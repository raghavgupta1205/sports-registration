package com.anpl.dto;

import com.anpl.model.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String whatsappNumber;
    private String registrationNumber;
    private String block;
    private String houseNumber;
    private String residentialAddress;
    private LocalDate dateOfBirth;
    private String gender;
    private String playerPhoto;
    private Boolean hasAadhaarDocuments;
    private String token;
    private String role;

    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .phoneNumber(user.getPhoneNumber())
            .whatsappNumber(user.getWhatsappNumber())
            .registrationNumber(user.getRegistrationNumber())
            .block(user.getBlock())
            .houseNumber(user.getHouseNumber())
            .dateOfBirth(user.getDateOfBirth())
            .gender(user.getGender() != null ? user.getGender().name() : null)
            .playerPhoto(user.getPlayerPhoto())
            .hasAadhaarDocuments(hasAadhaarDocs(user))
            .role(user.getRole().toString())
            .build();
    }

    private static boolean hasAadhaarDocs(User user) {
        return user.getAadhaarFrontPhoto() != null && user.getAadhaarBackPhoto() != null;
    }
} 