package com.anpl.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BadmintonEventRegistrationResponse {
    private Long bundleRegistrationId;
    private Long eventId;
    private String eventName;
    private String playerFullName;
    private String playerPhoto;
    private Integer totalEntries;
    private Integer totalAmount;
    private Boolean readyForPayment;
    private String paymentOrderId;
    private List<BadmintonRegistrationEntryResponse> entries;
}

