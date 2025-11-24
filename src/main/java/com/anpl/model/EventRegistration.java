package com.anpl.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "event_registrations", schema = "anpl_sports")
public class EventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_number", unique = true)
    private String registrationNumber;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_status")
    private RegistrationStatus registrationStatus;

    // Event-Specific Customization
    @Column(name = "tshirt_name", length = 50)
    private String tshirtName;

    @Column(name = "jersey_number")
    private Integer jerseyNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_category", length = 20)
    private RegistrationCategory registrationCategory;

    @Column(name = "available_all_days")
    private Boolean availableAllDays = true;

    @Column(name = "unavailable_dates", columnDefinition = "TEXT")
    private String unavailableDates;

    // Team Information (if applicable)
    @Column(name = "team_name", length = 100)
    private String teamName;

    @Column(name = "team_role", length = 50)
    private String teamRole;

    // Special Requests
    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    @Column(name = "dietary_requirements")
    private String dietaryRequirements;

    // Terms & Conditions
    @Column(name = "terms_accepted", nullable = false)
    private Boolean termsAccepted = false;

    @Column(name = "terms_accepted_at")
    private LocalDateTime termsAcceptedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (registrationNumber == null) {
            registrationNumber = generateRegistrationNumber();
        }
        if (termsAccepted && termsAcceptedAt == null) {
            termsAcceptedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (termsAccepted && termsAcceptedAt == null) {
            termsAcceptedAt = LocalDateTime.now();
        }
    }

    private String generateRegistrationNumber() {
        return "REG" + System.currentTimeMillis();
    }
} 