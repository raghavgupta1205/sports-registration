package com.anpl.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class OrderResponse {
    private String orderId;
    private Long amount;
    private String currency;
    private Long registrationId;
} 