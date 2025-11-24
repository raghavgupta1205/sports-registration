package com.anpl.dto;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;
import com.anpl.model.RegistrationStatus;

@Data
@Builder
public class EventRegistrationResponse {
    private Long id;
    private String registrationNumber;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String block;
    private RegistrationStatus registrationStatus;
    private LocalDateTime registrationDate;
    private String tshirtName;
    private Integer jerseyNumber;
    private com.anpl.model.RegistrationCategory registrationCategory;
    private Boolean availableAllDays;
    private String unavailableDates;
    private Boolean termsAccepted;
    private LocalDateTime termsAcceptedAt;
    private EventResponse event;

    @Data
    @Builder
    public static class EventResponse {
        private Long id;
        private String name;
        private String description;
        private Double price;
        // Add other necessary fields
    }
} 