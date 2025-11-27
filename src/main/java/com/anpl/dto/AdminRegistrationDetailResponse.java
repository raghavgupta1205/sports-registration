package com.anpl.dto;

import com.anpl.model.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AdminRegistrationDetailResponse {
    private Long registrationId;
    private RegistrationStatus registrationStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // User information
    private Long userId;
    private String fullName;
    private String fathersName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String bloodGroup;
    private String email;
    private String phoneNumber;
    private String whatsappNumber;
    private String block;
    private String houseNumber;
    private String residentialAddress;
    private String aadhaarNumber;
    private String aadhaarFrontPhoto;
    private String aadhaarBackPhoto;
    private String playerPhoto;
    private TShirtSize preferredTshirtSize;

    // Event information
    private Long eventId;
    private String eventName;
    private String eventType;
    private Double eventPrice;
    private LocalDateTime eventStartDate;
    private LocalDateTime eventEndDate;
    private String eventVenue;

    // Registration specifics
    private RegistrationCategory registrationCategory;
    private String teamRole;
    private Integer jerseyNumber;
    private String tshirtName;
    private Boolean availableAllDays;
    private List<String> unavailableDates;
    private Boolean termsAccepted;
    private LocalDateTime termsAcceptedAt;

    // Player profile
    private Long playerProfileId;
    private GameLevel skillLevel;
    private Integer yearsOfExperience;
    private String sportsHistory;
    private String achievements;
    private Boolean profileActive;
    private LocalDateTime profileUpdatedAt;

    // Cricket-specific skills (if available)
    private Long cricketSkillsId;
    private CricketRole primaryRole;
    private Boolean wicketKeeper;
    private Boolean allRounder;
    private Boolean hasCaptainExperience;
    private BattingStyle battingStyle;
    private BattingPosition battingPosition;
    private HandPreference battingHand;
    private BowlingStyle bowlingStyle;
    private BowlingType bowlingType;
    private HandPreference bowlingArm;
    private String preferredFieldingPosition;
    private Integer matchesPlayed;
    private Integer bestScore;
    private String bestBowling;
    private String cricHeroesPhone;
    private Integer cricHeroesMatchesPlayed;
    private Integer cricHeroesTotalRuns;
    private BigDecimal cricHeroesStrikeRate;
    private Integer cricHeroesTotalWickets;
    private BigDecimal cricHeroesBowlingEconomy;
}

