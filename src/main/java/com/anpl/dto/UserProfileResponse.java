package com.anpl.dto;

import com.anpl.model.RegistrationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UserProfileResponse {
    private UserResponse user;
    private List<EventRegistrationSummary> eventRegistrations;
    private List<BadmintonEntrySummary> badmintonEntries;

    @Data
    @Builder
    public static class EventRegistrationSummary {
        private Long registrationId;
        private String eventName;
        private String eventType;
        private RegistrationStatus status;
        private LocalDateTime registeredOn;
        private String registrationCode;
    }

    @Data
    @Builder
    public static class BadmintonEntrySummary {
        private Long entryId;
        private String categoryName;
        private String categoryType;
        private String registrationCode;
        private String partnerName;
        private RegistrationStatus status;
    }
}

