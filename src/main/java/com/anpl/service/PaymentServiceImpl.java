package com.anpl.service;

import com.anpl.dto.PaymentInitiateRequest;
import com.anpl.dto.PaymentResponse;
import com.anpl.dto.PaymentVerificationRequest;
import com.anpl.model.EventRegistration;
import com.anpl.model.Payment;
import com.anpl.model.PaymentStatus;
import com.anpl.model.RegistrationStatus;
import com.anpl.repository.EventRegistrationRepository;
import com.anpl.repository.PaymentRepository;
import com.anpl.exception.ResourceNotFoundException;
import com.anpl.exception.PaymentException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final EventRegistrationRepository eventRegistrationRepository;
    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Override
    @Transactional
    public PaymentResponse initiatePayment(PaymentInitiateRequest request) {
        try {
            EventRegistration registration = eventRegistrationRepository.findById(request.getRegistrationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", request.getAmount() * 100); // Convert to paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + registration.getId());

            Order order = razorpayClient.orders.create(orderRequest);

            // Save payment record
            Payment payment = new Payment();
            payment.setRegistration(registration);
            payment.setAmount(BigDecimal.valueOf(request.getAmount()));
            payment.setRazorpayOrderId(order.get("id"));
            payment.setPaymentStatus(PaymentStatus.PENDING);
            payment.setCreatedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            return PaymentResponse.builder()
                    .razorpayOrderId(order.get("id"))
                    .amount(BigDecimal.valueOf(request.getAmount()))
                    .status("PENDING")
                    .build();
        } catch (RazorpayException e) {
            throw new PaymentException("Failed to initiate payment: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void verifyPayment(PaymentVerificationRequest request) {
        EventRegistration registration = eventRegistrationRepository.findById(request.getRegistrationId())
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        try {
            // Get/Create payment record
            Payment payment = paymentRepository.findByRazorpayOrderId(request.getOrderId())
                .orElse(new Payment());
            
            payment.setRegistration(registration);
            payment.setRazorpayOrderId(request.getOrderId());
            payment.setRazorpayPaymentId(request.getPaymentId());
            payment.setRazorpaySignature(request.getSignature());
            
            // If signature is null or empty, mark as failed without verification
            if (request.getSignature() == null || request.getSignature().trim().isEmpty()) {
                payment.setPaymentStatus(PaymentStatus.FAILED);
                registration.setRegistrationStatus(RegistrationStatus.FAILED);
                paymentRepository.save(payment);
                eventRegistrationRepository.save(registration);
                return;
            }
            
            // Verify signature
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getOrderId());
            attributes.put("razorpay_payment_id", request.getPaymentId());
            attributes.put("razorpay_signature", request.getSignature());
            
            Utils.verifyPaymentSignature(attributes, request.getSignature());
            
            // Check payment status from Razorpay
            Order order = razorpayClient.orders.fetch(request.getOrderId());
            if ("paid".equals(order.get("status"))) {
                payment.setPaymentStatus(PaymentStatus.COMPLETED);
                payment.setPaymentDate(LocalDateTime.now());
                registration.setRegistrationStatus(RegistrationStatus.APPROVED);
                paymentRepository.save(payment);
                eventRegistrationRepository.save(registration);
            } else {
                payment.setPaymentStatus(PaymentStatus.FAILED);
                registration.setRegistrationStatus(RegistrationStatus.FAILED);
                paymentRepository.save(payment);
                eventRegistrationRepository.delete(registration);
                //throw new PaymentException("Payment failed. Please try registering again.");
            }
            
        } catch (RazorpayException e) {
            // Set status to failed and delete registration on verification error
            registration.setRegistrationStatus(RegistrationStatus.FAILED);
            eventRegistrationRepository.delete(registration);
            throw new PaymentException("Payment verification failed: " + e.getMessage());
        }
    }

    @Override
    public PaymentResponse getLatestPayment(Long registrationId) {
        Payment payment = paymentRepository.findFirstByRegistration_IdOrderByCreatedAtDesc(registrationId)
            .orElseThrow(() -> new ResourceNotFoundException("No payment found for this registration"));
        
        return PaymentResponse.builder()
            .razorpayOrderId(payment.getRazorpayOrderId())
            .razorpayPaymentId(payment.getRazorpayPaymentId())
            .razorpaySignature(payment.getRazorpaySignature())
            .amount(payment.getAmount())
            .status(payment.getPaymentStatus().toString())
            .build();
    }

} 