package com.anpl.dto;

import com.anpl.model.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegistrationRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Father's name is required")
    private String fathersName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "House number is required")
    private String houseNumber;

    @NotBlank(message = "Block is required")
    private String block;

    @NotBlank(message = "Aadhaar number is required")
    @Pattern(regexp = "^\\d{12}$", message = "Aadhaar number must be exactly 12 digits")
    private String aadhaarNumber;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotBlank(message = "Aadhaar front photo is required")
    private String aadhaarFrontPhotoData;

    @NotBlank(message = "Aadhaar back photo is required")
    private String aadhaarBackPhotoData;

    @NotBlank(message = "Profile photo is required")
    private String profilePhotoData;

    @NotBlank(message = "Password is required")
    @Pattern(regexp = "^.{6,}$", message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
} 