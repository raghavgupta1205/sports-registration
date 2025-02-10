package com.anpl.dto;

import lombok.Data;
import lombok.Builder;
import java.math.BigDecimal;

@Data
@Builder
public class PaymentResponse {
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private BigDecimal amount;
    private String status;
} 