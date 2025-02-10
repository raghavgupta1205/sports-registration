package com.anpl.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

@Data
public class PaymentVerificationRequest {
    @NotNull(message = "Registration ID is required")
    private Long registrationId;
    
    @NotBlank(message = "Razorpay order ID is required")
    private String orderId;
    
    @NotBlank(message = "Razorpay payment ID is required")
    private String paymentId;
    
    @NotBlank(message = "Razorpay signature is required")
    private String signature;
} 