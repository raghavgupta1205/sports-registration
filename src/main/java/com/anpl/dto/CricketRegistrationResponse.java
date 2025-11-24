package com.anpl.dto;

import com.anpl.model.*;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CricketRegistrationResponse {
    private Long eventRegistrationId;
    private Long playerProfileId;
    private Long cricketProfileId;

    // User Static Information
    private Gender gender;
    private TShirtSize preferredTshirtSize;
    private String residentialAddress;
    private String whatsappNumber;
    private String aadhaarFrontPhoto;
    private String aadhaarBackPhoto;
    private String playerPhoto;

    // Cricket Profile
    private RegistrationCategory registrationCategory;
    private GameLevel skillLevel;
    private String sportsHistory;
    private String achievements;
    private CricketPreference cricketPreference;
    private CricketRole primaryRole;
    private Boolean isWicketKeeper;
    private Boolean hasCaptainExperience;
    private BattingStyle battingStyle;
    private HandPreference battingHand;
    private BattingPosition battingPosition;
    private BowlingStyle bowlingStyle;
    private BowlingType bowlingType;
    private BowlingPace bowlingPace;
    private HandPreference bowlingArm;
    private String preferredFieldingPosition;

    // Event Specific Details
    private String tshirtName;
    private Integer jerseyNumber;
    private Boolean availableAllDays;
    private List<String> unavailableDates;
    private Boolean termsAccepted;
    private LocalDateTime termsAcceptedAt;

    // Metadata
    private LocalDateTime profileCreatedAt;
    private LocalDateTime profileUpdatedAt;
}

