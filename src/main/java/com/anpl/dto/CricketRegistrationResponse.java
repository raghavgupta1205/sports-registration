package com.anpl.dto;

import com.anpl.model.*;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CricketRegistrationResponse {
    private Long id;
    private Long eventRegistrationId;
    
    // Basic Information
    private Gender gender;
    private TShirtSize tshirtSize;
    private String residentialAddress;
    private String whatsappNumber;
    
    // Photo/Document URLs
    private String aadhaarFrontPhoto;
    private String aadhaarBackPhoto;
    private String playerPhoto;
    
    // Cricket Specific Fields
    private GameLevel gameLevel;
    private CricketPreference cricketPreference;
    private Boolean isWicketKeeper;
    private Boolean hasCaptainExperience;
    private HandPreference battingHand;
    private HandPreference bowlingArm;
    private BowlingPace bowlingPace;
    
    // T-Shirt Details
    private String tshirtName;
    private Integer luckyNumber;
    
    // Terms
    private Boolean termsAccepted;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

