package com.anpl.dto;

import lombok.Data;
import lombok.Builder;
import java.math.BigDecimal;

@Data
@Builder
public class PaymentResponse {
    private String orderId;
    private BigDecimal amount;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String status;
} 