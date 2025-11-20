package com.anpl.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "cricket_registrations")
public class CricketRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "event_registration_id", nullable = false, unique = true)
    private EventRegistration eventRegistration;

    // Basic Information
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "tshirt_size", nullable = false)
    private TShirtSize tshirtSize;

    @Column(name = "residential_address", nullable = false, length = 500)
    private String residentialAddress;

    @Column(name = "whatsapp_number", nullable = false, length = 20)
    private String whatsappNumber;

    // Document/Photo Paths
    @Column(name = "aadhaar_front_photo", nullable = false, length = 500)
    private String aadhaarFrontPhoto;

    @Column(name = "aadhaar_back_photo", nullable = false, length = 500)
    private String aadhaarBackPhoto;

    @Column(name = "player_photo", nullable = false, length = 500)
    private String playerPhoto;

    // Cricket Specific Fields
    @Enumerated(EnumType.STRING)
    @Column(name = "game_level", nullable = false)
    private GameLevel gameLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "cricket_preference", nullable = false)
    private CricketPreference cricketPreference;

    @Column(name = "is_wicket_keeper", nullable = false)
    private Boolean isWicketKeeper = false;

    @Column(name = "has_captain_experience", nullable = false)
    private Boolean hasCaptainExperience = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "batting_hand", nullable = false)
    private HandPreference battingHand;

    @Enumerated(EnumType.STRING)
    @Column(name = "bowling_arm", nullable = false)
    private HandPreference bowlingArm;

    @Enumerated(EnumType.STRING)
    @Column(name = "bowling_pace", nullable = false)
    private BowlingPace bowlingPace;

    // T-Shirt Details
    @Column(name = "tshirt_name", nullable = false, length = 50)
    private String tshirtName;

    @Column(name = "lucky_number", nullable = false)
    private Integer luckyNumber;

    // Terms and Conditions
    @Column(name = "terms_accepted", nullable = false)
    private Boolean termsAccepted = false;

    // Timestamps
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

