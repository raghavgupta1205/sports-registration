package com.anpl.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "badminton_registration_entries", schema = "anpl_sports",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_badminton_entry_registration_category",
                   columnNames = {"event_registration_id", "category_id"})
       })
public class BadmintonRegistrationEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "event_registration_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_badminton_entry_registration"))
    private EventRegistration eventRegistration;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_badminton_entry_category"))
    private BadmintonCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false, length = 20)
    private BadmintonCategoryType entryType;

    @Column(name = "primary_player_name", nullable = false, length = 255)
    private String primaryPlayerName;

    @Column(name = "primary_player_age")
    private Integer primaryPlayerAge;

    @Column(name = "primary_player_relation", length = 50)
    private String primaryPlayerRelation;

    @Column(name = "partner_player_name", length = 255)
    private String partnerPlayerName;

    @Column(name = "partner_player_age")
    private Integer partnerPlayerAge;

    @Column(name = "partner_player_relation", length = 50)
    private String partnerPlayerRelation;

    @Column(name = "participants_count", nullable = false)
    private Integer participantsCount = 1;

    @Column(name = "entry_fee", nullable = false)
    private Double entryFee;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (primaryPlayerRelation == null) {
            primaryPlayerRelation = "SELF";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

