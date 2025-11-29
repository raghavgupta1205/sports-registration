package com.anpl.dto;

import com.anpl.model.Gender;
import com.anpl.model.TShirtSize;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class BadmintonRegistrationResponse {
    Long eventRegistrationId;
    String registrationNumber;
    String eventName;
    Double eventPricePerParticipant;
    Double totalPayableAmount;
    boolean readyForPayment;
    List<String> unavailableDates;
    Boolean availableAllDays;
    String tshirtName;
    Integer jerseyNumber;
    Boolean termsAccepted;
    LocalDateTime termsAcceptedAt;
    String aadhaarFrontPhoto;
    String aadhaarBackPhoto;
    String playerPhoto;
    Gender gender;
    TShirtSize tshirtSize;
    String residentialAddress;
    String whatsappNumber;
    List<BadmintonRegistrationEntryResponse> selectedCategories;
}

