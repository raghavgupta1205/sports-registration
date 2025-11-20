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
    private Long cricketRegistrationId;
    private String registrationNumber;
    private String eventName;
    private Double eventPrice;
    private String message;
    
    // Used to indicate the registration is complete and ready for payment
    private Boolean readyForPayment;
}

