package com.anpl.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "badminton_registration_bundles", schema = "anpl_sports")
public class BadmintonRegistrationBundle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "terms_accepted", nullable = false)
    private Boolean termsAccepted = false;

    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "bundle_status", nullable = false, length = 20)
    private RegistrationStatus bundleStatus = RegistrationStatus.PENDING;

    @Column(name = "payment_order_id", length = 100)
    private String paymentOrderId;

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "bundle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BadmintonRegistrationEntry> entries = new ArrayList<>();

    public void addEntry(BadmintonRegistrationEntry entry) {
        entries.add(entry);
        entry.setBundle(this);
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

