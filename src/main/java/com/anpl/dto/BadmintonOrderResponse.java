package com.anpl.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BadmintonOrderResponse {
    private Long bundleId;
    private String orderId;
    private Integer amount;
    private String currency;
}

