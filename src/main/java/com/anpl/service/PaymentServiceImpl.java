package com.anpl.service;

import com.anpl.dto.PaymentInitiateRequest;
import com.anpl.dto.PaymentResponse;
import com.anpl.dto.PaymentVerificationRequest;
import com.anpl.model.EventRegistration;
import com.anpl.model.Payment;
import com.anpl.model.PaymentStatus;
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

            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", request.getAmount() * 100); // Convert to paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + registration.getId());

            Order order = razorpay.orders.create(orderRequest);

            // Save payment record
            Payment payment = new Payment();
            payment.setRegistration(registration);
            payment.setAmount(BigDecimal.valueOf(request.getAmount()));
            payment.setRazorpayOrderId(order.get("id"));
            payment.setPaymentStatus(PaymentStatus.PENDING);
            payment.setCreatedAt(LocalDateTime.now());

            return PaymentResponse.builder()
                    .orderId(order.get("id"))
                    .amount(BigDecimal.valueOf(request.getAmount()))
                    .status("PENDING")
                    .build();
        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to initiate payment: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void verifyPayment(PaymentVerificationRequest request) {
        if (request.getRegistrationId() == null) {
            throw new PaymentException("Registration ID cannot be null");
        }

        EventRegistration registration = eventRegistrationRepository.findById(request.getRegistrationId())
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        try {
            // Verify signature
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getOrderId());
            attributes.put("razorpay_payment_id", request.getPaymentId());
            attributes.put("razorpay_signature", request.getSignature());
            
            Utils.verifyPaymentSignature(attributes, request.getSignature());
            
            // Update registration status
            registration.setPaymentStatus(PaymentStatus.COMPLETED);
            eventRegistrationRepository.save(registration);
        } catch (RazorpayException e) {
            throw new PaymentException("Payment verification failed: " + e.getMessage());
        }
    }
} 