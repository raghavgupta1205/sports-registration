package com.anpl.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "badminton_player_skills", schema = "anpl_sports")
public class BadmintonPlayerSkills {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "player_profile_id", nullable = false, unique = true)
    private PlayerProfile playerProfile;

    // Playing Details
    @Enumerated(EnumType.STRING)
    @Column(name = "playing_style", nullable = false, length = 30)
    private BadmintonPlayingStyle playingStyle;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_hand", nullable = false, length = 20)
    private HandPreference preferredHand;

    // Format Preferences
    @Column(name = "singles_player", nullable = false)
    private Boolean singlesPlayer = true;

    @Column(name = "doubles_player", nullable = false)
    private Boolean doublesPlayer = true;

    @Column(name = "mixed_doubles", nullable = false)
    private Boolean mixedDoubles = true;

    // Court Position (for doubles)
    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_position", length = 30)
    private CourtPosition preferredPosition;

    // Specialty Shots
    @Column(name = "specialty_shots", columnDefinition = "TEXT")
    private String specialtyShots;

    // Statistics (optional)
    @Column(name = "matches_played")
    private Integer matchesPlayed = 0;

    @Column(name = "win_percentage", precision = 5, scale = 2)
    private BigDecimal winPercentage;

    @Column(name = "best_ranking")
    private Integer bestRanking;

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
