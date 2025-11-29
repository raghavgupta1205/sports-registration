package com.anpl.dto;

import com.anpl.model.Gender;
import com.anpl.model.TShirtSize;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class BadmintonRegistrationRequest {

    @NotNull(message = "Event ID is required")
    private Long eventId;

    private Gender gender;

    private TShirtSize tshirtSize;

    private String residentialAddress;

    @Pattern(regexp = "^$|^\\d{10}$", message = "WhatsApp number must be 10 digits")
    private String whatsappNumber;

    @NotBlank(message = "Aadhaar front photo is required")
    private String aadhaarFrontPhoto;

    @NotBlank(message = "Aadhaar back photo is required")
    private String aadhaarBackPhoto;

    @NotBlank(message = "Player photo is required")
    private String playerPhoto;

    @NotBlank(message = "T-shirt name is required")
    @Size(max = 50, message = "T-shirt name must not exceed 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "T-shirt name must contain only letters")
    private String tshirtName;

    @NotNull(message = "Jersey number is required")
    @Min(value = 1, message = "Jersey number must be between 1 and 999")
    @Max(value = 999, message = "Jersey number must be between 1 and 999")
    private Integer jerseyNumber;

    @NotNull(message = "Availability selection is required")
    private Boolean availableAllDays;

    @Size(max = 31, message = "You can specify up to 31 unavailable dates")
    private List<@Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Date format must be yyyy-MM-dd") String> unavailableDates;

    @NotNull(message = "You must accept the terms and conditions")
    @AssertTrue(message = "Terms and conditions must be accepted")
    private Boolean termsAccepted;

    @NotEmpty(message = "Please select at least one category")
    private List<@Valid BadmintonCategorySelectionRequest> categories;
}

