package com.anpl.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Combined response for Cricket Event Registration
 * Returns both event registration and cricket details
 */
@Data
@Builder
public class CricketEventRegistrationResponse {
    private Long eventRegistrationId;
    private Long playerProfileId;
    private Long cricketProfileId;
    private String registrationNumber;
    private String eventName;
    private Double eventPrice;
    private String message;
    private Boolean readyForPayment;
}

