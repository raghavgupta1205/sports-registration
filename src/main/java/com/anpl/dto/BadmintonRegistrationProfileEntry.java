package com.anpl.dto;

import com.anpl.model.RegistrationStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BadmintonRegistrationProfileEntry {
    private Long entryId;
    private Long bundleId;
    private String eventName;
    private String categoryName;
    private String categoryType;
    private String registrationCode;
    private String partnerName;
    private RegistrationStatus status;
}

