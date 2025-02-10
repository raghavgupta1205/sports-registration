package com.anpl.service;

import com.anpl.dto.*;
import com.anpl.model.EventRegistration;
import com.anpl.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;
import org.json.JSONObject;
import com.razorpay.RazorpayException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.anpl.repository.EventRegistrationRepository;
import com.anpl.repository.EventRepository;
import com.anpl.model.Event;
import com.anpl.exception.ResourceNotFoundException;
import com.anpl.exception.PaymentException;
import com.anpl.service.PaymentService;
import com.anpl.service.EventRegistrationService;
import com.anpl.repository.PaymentRepository;
import com.anpl.model.Payment;
import com.anpl.model.PaymentStatus;
import com.anpl.model.RegistrationStatus;
import java.util.Optional;
import java.math.BigDecimal;

@Service
@Transactional
@RequiredArgsConstructor
public class RegistrationService {
    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventRepository eventRepository;
    private final SecurityUtils securityUtils;
    private final RazorpayClient razorpayClient;
    private final PaymentService paymentService;
    private final EventRegistrationService eventRegistrationService;
    private final PaymentRepository paymentRepository;

    public OrderResponse createOrder(OrderRequest request) {
        // First validate the event exists
        Event event = eventRepository.findById(request.getEventId())
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        // Create registration first
        EventRegistrationResponse registration = eventRegistrationService.registerForEvent(
            securityUtils.getCurrentUserId(),
            event.getId()
        );

        // Create Razorpay order
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", event.getPrice() * 100); // Convert to paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + UUID.randomUUID().toString().substring(0, 8));
            orderRequest.put("notes", new JSONObject().put("registration_id", registration.getId()));

            Order order = razorpayClient.orders.create(orderRequest);
            
            // Create payment record
            Payment payment = new Payment();
            payment.setRegistration(eventRegistrationRepository.getReferenceById(registration.getId()));
            payment.setAmount(BigDecimal.valueOf(event.getPrice()));
            payment.setRazorpayOrderId(order.get("id"));
            payment.setPaymentStatus(PaymentStatus.PENDING);
            paymentRepository.save(payment);
            
            return OrderResponse.builder()
                .orderId(order.get("id"))
                .amount(event.getPrice().longValue())
                .currency("INR")
                .registrationId(registration.getId())
                .build();
        } catch (RazorpayException e) {
            throw new PaymentException("Failed to create order: " + e.getMessage());
        }
    }

    public EventRegistrationResponse buildEventRegistrationResponse(EventRegistration registration) {
        return EventRegistrationResponse.builder()
            .id(registration.getId())
            .registrationNumber(registration.getRegistrationNumber())
            .event(EventRegistrationResponse.EventResponse.builder()
                .id(registration.getEvent().getId())
                .name(registration.getEvent().getName())
                .description(registration.getEvent().getDescription())
                .price(registration.getEvent().getPrice())
                .build())
            .registrationStatus(registration.getRegistrationStatus())
            .build();
    }

    @Transactional
    public RegistrationResponse verifyPaymentAndRegister(PaymentVerificationRequest request) {
        paymentService.verifyPayment(request);
        
        EventRegistrationResponse registration = eventRegistrationService.getRegistrationById(
            request.getRegistrationId()
        );
        
        return RegistrationResponse.builder()
            .registrationId(registration.getId())
            .eventId(registration.getEvent().getId())
            .status(registration.getRegistrationStatus().toString())
            .build();
    }

    public List<RegistrationResponse> getCurrentUserRegistrations() {
        Long userId = securityUtils.getCurrentUserId();
        List<EventRegistration> registrations = eventRegistrationService.getUserRegistrations(userId);
        
        return registrations.stream()
            .map(reg -> RegistrationResponse.builder()
                .registrationId(reg.getId())
                .eventId(reg.getEvent().getId())
                .status(reg.getRegistrationStatus().toString())
                .build())
            .collect(Collectors.toList());
    }

    @Transactional
    public RegistrationResponse checkRegistrationStatus(Long registrationId) {
        EventRegistration registration = eventRegistrationRepository.findById(registrationId)
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        try {
            Optional<Payment> paymentOpt = paymentRepository.findFirstByRegistration_IdOrderByCreatedAtDesc(registrationId);
            
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                Order order = razorpayClient.orders.fetch(payment.getRazorpayOrderId());
                
                if ("paid".equals(order.get("status"))) {
                    payment.setPaymentStatus(PaymentStatus.COMPLETED);
                    registration.setRegistrationStatus(RegistrationStatus.APPROVED);
                    paymentRepository.save(payment);
                    eventRegistrationRepository.save(registration);
                }
            }

            return RegistrationResponse.builder()
                .registrationId(registration.getId())
                .eventId(registration.getEvent().getId())
                .status(registration.getRegistrationStatus().toString())
                .paymentStatus(paymentOpt.map(p -> p.getPaymentStatus().toString()).orElse("PENDING"))
                .build();
        } catch (RazorpayException e) {
            throw new PaymentException("Failed to check payment status: " + e.getMessage());
        }
    }
} 