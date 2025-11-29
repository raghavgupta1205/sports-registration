package com.anpl.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "badminton_categories", schema = "anpl_sports",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_badminton_category_event_code", columnNames = {"event_id", "code"})
       })
public class BadmintonCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false, foreignKey = @ForeignKey(name = "fk_badminton_category_event"))
    private Event event;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Column(name = "display_name", nullable = false, length = 255)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(name = "category_type", nullable = false, length = 20)
    private BadmintonCategoryType categoryType;

    @Column(name = "min_age")
    private Integer minAge;

    @Column(name = "max_age")
    private Integer maxAge;

    @Column(name = "gender_group", length = 20)
    private String genderGroup;

    @Column(name = "participants_per_entry", nullable = false)
    private Integer participantsPerEntry = 1;

    @Column(name = "requires_partner_details", nullable = false)
    private Boolean requiresPartnerDetails = false;

    @Column(name = "requires_relation_details", nullable = false)
    private Boolean requiresRelationDetails = false;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

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

