package com.anpl.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class RegistrationResponse {
    private Long id;
    private Long eventId;
    private String status;
    private String paymentStatus;
} 