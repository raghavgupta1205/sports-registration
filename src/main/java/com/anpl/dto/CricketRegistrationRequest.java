package com.anpl.dto;

import com.anpl.model.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CricketRegistrationRequest {
    
    @NotNull(message = "Event registration ID is required")
    private Long eventRegistrationId;

    // Basic Information
    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotNull(message = "T-shirt size is required")
    private TShirtSize tshirtSize;

    @NotBlank(message = "Residential address is required")
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String residentialAddress;

    @NotBlank(message = "WhatsApp number is required")
    @Pattern(regexp = "^\\d{10}$", message = "WhatsApp number must be 10 digits")
    private String whatsappNumber;

    // Photo/Document Uploads (for file paths after upload)
    @NotBlank(message = "Aadhaar front photo is required")
    private String aadhaarFrontPhoto;

    @NotBlank(message = "Aadhaar back photo is required")
    private String aadhaarBackPhoto;

    @NotBlank(message = "Player photo is required")
    private String playerPhoto;

    // Cricket Specific Fields
    @NotNull(message = "Game level is required")
    private GameLevel gameLevel;

    @NotNull(message = "Cricket preference is required")
    private CricketPreference cricketPreference;

    @NotNull(message = "Wicket keeper status is required")
    private Boolean isWicketKeeper;

    @NotNull(message = "Captain experience status is required")
    private Boolean hasCaptainExperience;

    @NotNull(message = "Batting hand is required")
    private HandPreference battingHand;

    @NotNull(message = "Bowling arm is required")
    private HandPreference bowlingArm;

    @NotNull(message = "Bowling pace is required")
    private BowlingPace bowlingPace;

    // T-Shirt Details
    @NotBlank(message = "T-shirt name is required")
    @Size(max = 50, message = "T-shirt name must not exceed 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "T-shirt name must contain only letters")
    private String tshirtName;

    @NotNull(message = "Lucky number is required")
    @Min(value = 1, message = "Lucky number must be between 1 and 99")
    @Max(value = 99, message = "Lucky number must be between 1 and 99")
    private Integer luckyNumber;

    // Terms and Conditions
    @NotNull(message = "You must accept terms and conditions")
    @AssertTrue(message = "You must accept terms and conditions to register")
    private Boolean termsAccepted;
}

