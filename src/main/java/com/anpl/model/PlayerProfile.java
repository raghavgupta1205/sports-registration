package com.anpl.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "player_profiles", schema = "anpl_sports")
public class PlayerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Sport Type: CRICKET, BADMINTON, FOOTBALL, etc.
    @Column(name = "sport_type", nullable = false, length = 50)
    private String sportType;

    // General Skill Information
    @Enumerated(EnumType.STRING)
    @Column(name = "skill_level", nullable = false, length = 20)
    private GameLevel skillLevel;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience = 0;

    @Column(columnDefinition = "TEXT")
    private String achievements;

    @Column(name = "sports_history", columnDefinition = "TEXT")
    private String sportsHistory;

    // Profile Status
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(nullable = false)
    private Boolean verified = false;

    @ManyToOne
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verification_notes", columnDefinition = "TEXT")
    private String verificationNotes;

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
