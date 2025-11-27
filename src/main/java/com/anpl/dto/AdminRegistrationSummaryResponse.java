package com.anpl.dto;

import com.anpl.model.RegistrationCategory;
import com.anpl.model.RegistrationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminRegistrationSummaryResponse {
    private Long registrationId;
    private String registrationNumber;
    private RegistrationStatus registrationStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String whatsappNumber;
    private String block;
    private String houseNumber;

    private Long eventId;
    private String eventName;
    private String eventType;

    private RegistrationCategory registrationCategory;
    private Integer jerseyNumber;
    private Boolean availableAllDays;

    private String aadhaarFrontPhoto;
    private String aadhaarBackPhoto;
    private String playerPhoto;
}

