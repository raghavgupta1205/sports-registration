package com.anpl.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "badminton_registration_entries", schema = "anpl_sports")
public class BadmintonRegistrationEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "bundle_id", nullable = false)
    private BadmintonRegistrationBundle bundle;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private BadmintonCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "category_type", nullable = false, length = 20)
    private BadmintonCategoryType categoryType;

    @Column(name = "price_per_player", nullable = false)
    private Integer pricePerPlayer;

    @Column(name = "partner_user_id")
    private Long partnerUserId;

    @Column(name = "partner_full_name")
    private String partnerFullName;

    @Column(name = "partner_age")
    private Integer partnerAge;

    @Column(name = "partner_contact")
    private String partnerContact;

    @Column(name = "secondary_partner_user_id")
    private Long secondaryPartnerUserId;

    @Column(name = "secondary_partner_full_name")
    private String secondaryPartnerFullName;

    @Column(name = "secondary_partner_age")
    private Integer secondaryPartnerAge;

    @Column(name = "secondary_partner_contact")
    private String secondaryPartnerContact;

    @Column(name = "self_relation")
    private String selfRelation;

    @Column(name = "partner_relation")
    private String partnerRelation;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_status", nullable = false, length = 20)
    private RegistrationStatus entryStatus = RegistrationStatus.PENDING;
}

