package com.anpl.dto;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Builder
public class RegistrationResponse {
    private Long registrationId;
    private Long eventId;
    private String status;
    private String paymentStatus;
    private String eventName;
    private String eventType;
    private String registrationCode;
    private LocalDateTime createdAt;
} 