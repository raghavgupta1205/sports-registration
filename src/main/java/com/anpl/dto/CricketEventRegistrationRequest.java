package com.anpl.dto;

import com.anpl.model.CricketPreference;
import com.anpl.model.GameLevel;
import com.anpl.model.HandPreference;
import com.anpl.model.BowlingPace;
import com.anpl.model.RegistrationCategory;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

/**
 * Combined request for Cricket Event Registration
 * This includes both event registration and cricket-specific details
 * All fields must be filled BEFORE payment
 */
@Data
public class CricketEventRegistrationRequest {
    
    // Event Registration Info
    @NotNull(message = "Event ID is required")
    private Long eventId;

    // Basic Personal Information
    private com.anpl.model.Gender gender;

    private com.anpl.model.TShirtSize tshirtSize;

    private String residentialAddress;

    @Pattern(regexp = "^\\d{10}$", message = "WhatsApp number must be 10 digits")
    private String whatsappNumber;

    // Document/Photo Uploads (file paths after upload)
    @NotBlank(message = "Aadhaar front photo is required")
    private String aadhaarFrontPhoto;

    @NotBlank(message = "Aadhaar back photo is required")
    private String aadhaarBackPhoto;

    @NotBlank(message = "Player photo is required")
    private String playerPhoto;

    // Cricket Specific Skills
    @NotNull(message = "Registration category is required")
    private RegistrationCategory registrationCategory;

    @NotNull(message = "Game level is required")
    private GameLevel gameLevel;

    @NotNull(message = "Availability selection is required")
    private Boolean availableAllDays;

    @Size(max = 31, message = "You can specify up to 31 unavailable dates")
    private List<@Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Date must be in yyyy-MM-dd format") String> unavailableDates;

    @NotBlank(message = "Sports history is required")
    @Size(max = 1000, message = "Sports history must be under 1000 characters")
    private String sportsHistory;

    @NotBlank(message = "Achievements are required")
    @Size(max = 1000, message = "Achievements must be under 1000 characters")
    private String achievements;

    @Pattern(regexp = "^$|^\\d{10}$", message = "CricHeroes mobile number must be 10 digits")
    private String cricHeroesPhone;

    @NotNull(message = "Matches played info is required")
    @Min(value = 0, message = "Matches played cannot be negative")
    private Integer cricHeroesMatchesPlayed;

    @NotNull(message = "Total runs info is required")
    @Min(value = 0, message = "Total runs cannot be negative")
    private Integer cricHeroesTotalRuns;

    @NotNull(message = "Strike rate info is required")
    @DecimalMin(value = "0.00", inclusive = true, message = "Strike rate cannot be negative")
    @Digits(integer = 6, fraction = 2, message = "Strike rate must be a valid number (up to 2 decimal places)")
    private BigDecimal cricHeroesStrikeRate;

    @NotNull(message = "Total wickets info is required")
    @Min(value = 0, message = "Total wickets cannot be negative")
    private Integer cricHeroesTotalWickets;

    @NotNull(message = "Bowling economy info is required")
    @DecimalMin(value = "0.00", inclusive = true, message = "Bowling economy cannot be negative")
    @Digits(integer = 5, fraction = 2, message = "Bowling economy must be a valid number (up to 2 decimal places)")
    private BigDecimal cricHeroesBowlingEconomy;

    @NotNull(message = "Cricket preference is required")
    private CricketPreference cricketPreference;

    @NotNull(message = "Wicket keeper status is required")
    private Boolean isWicketKeeper;

    @NotNull(message = "All rounder status is required")
    private Boolean isAllRounder;

    @NotNull(message = "Captain experience status is required")
    private Boolean hasCaptainExperience;

    @NotNull(message = "Batting hand is required")
    private HandPreference battingHand;

    @NotNull(message = "Bowling arm is required")
    private HandPreference bowlingArm;

    @NotNull(message = "Bowling pace is required")
    private BowlingPace bowlingPace;

    // T-Shirt Customization
    @NotBlank(message = "T-shirt name is required")
    @Size(max = 50, message = "T-shirt name must not exceed 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "T-shirt name must contain only letters")
    private String tshirtName;

    @NotNull(message = "Lucky number is required")
    @Min(value = 1, message = "Lucky number must be between 1 and 99")
    @Max(value = 999, message = "Lucky number must be between 1 and 999")
    private Integer luckyNumber;

    // Terms and Conditions
    @NotNull(message = "You must accept terms and conditions")
    @AssertTrue(message = "You must accept terms and conditions to register")
    private Boolean termsAccepted;
}

