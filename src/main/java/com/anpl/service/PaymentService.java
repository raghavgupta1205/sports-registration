package com.anpl.service;

import com.anpl.dto.PaymentInitiateRequest;
import com.anpl.dto.PaymentResponse;
import com.anpl.dto.PaymentVerificationRequest;

public interface PaymentService {
    PaymentResponse initiatePayment(PaymentInitiateRequest request);
    void verifyPayment(PaymentVerificationRequest request);
    PaymentResponse getLatestPayment(Long registrationId);
} 