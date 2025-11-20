package com.anpl.dto;

import com.anpl.model.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String registrationNumber;
    private String block;
    private String token;
    private String role;

    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .registrationNumber(user.getRegistrationNumber())
            .role(user.getRole().toString())
            .build();
    }
} 