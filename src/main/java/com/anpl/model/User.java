package com.anpl.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users", schema = "anpl_sports")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "fathers_name", nullable = false)
    private String fathersName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "whatsapp_number")
    private String whatsappNumber;

    @Column(name = "residential_address", length = 500)
    private String residentialAddress;

    @Column(nullable = false)
    private String password;

    @Column(name = "registration_number", nullable = false, unique = true)
    private String registrationNumber;

    @Column(name = "block", nullable = false)
    private String block;

    @Column(name = "house_number", nullable = false)
    private String houseNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Column(name = "blood_group", length = 5)
    private String bloodGroup;

    @Column(name = "emergency_contact", length = 20)
    private String emergencyContact;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.USER;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    @Column(name = "aadhaar_number", length = 12, nullable = false, unique = true)
    private String aadhaarNumber;

    @Column(name = "aadhaar_front_photo", length = 500)
    private String aadhaarFrontPhoto;

    @Column(name = "aadhaar_back_photo", length = 500)
    private String aadhaarBackPhoto;

    @Column(name = "player_photo", length = 500)
    private String playerPhoto;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_tshirt_size")
    private TShirtSize preferredTshirtSize;

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