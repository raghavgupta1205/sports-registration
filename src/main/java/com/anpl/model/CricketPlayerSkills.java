package com.anpl.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "cricket_player_skills", schema = "anpl_sports")
public class CricketPlayerSkills {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "player_profile_id", nullable = false, unique = true)
    private PlayerProfile playerProfile;

    // Primary Role
    @Enumerated(EnumType.STRING)
    @Column(name = "primary_role", nullable = false, length = 30)
    private CricketRole primaryRole;

    // Batting Details
    @Enumerated(EnumType.STRING)
    @Column(name = "batting_style", nullable = false, length = 20)
    private BattingStyle battingStyle;

    @Enumerated(EnumType.STRING)
    @Column(name = "batting_position", length = 30)
    private BattingPosition battingPosition;

    // Bowling Details
    @Enumerated(EnumType.STRING)
    @Column(name = "bowling_style", nullable = false, length = 20)
    private BowlingStyle bowlingStyle;

    @Enumerated(EnumType.STRING)
    @Column(name = "bowling_type", length = 30)
    private BowlingType bowlingType;

    @Enumerated(EnumType.STRING)
    @Column(name = "bowling_arm", length = 20)
    private HandPreference bowlingArm;

    // Fielding
    @Column(name = "is_wicket_keeper", nullable = false)
    private Boolean isWicketKeeper = false;

    @Column(name = "preferred_fielding_position", length = 50)
    private String preferredFieldingPosition;

    // Leadership
    @Column(name = "has_captaincy_experience", nullable = false)
    private Boolean hasCaptaincyExperience = false;

    @Column(name = "captaincy_details", columnDefinition = "TEXT")
    private String captaincyDetails;

    // Statistics (optional - can be updated)
    @Column(name = "matches_played")
    private Integer matchesPlayed = 0;

    @Column(name = "batting_average", precision = 5, scale = 2)
    private BigDecimal battingAverage;

    @Column(name = "bowling_average", precision = 5, scale = 2)
    private BigDecimal bowlingAverage;

    @Column(name = "best_score")
    private Integer bestScore;

    @Column(name = "best_bowling", length = 10)
    private String bestBowling;

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
