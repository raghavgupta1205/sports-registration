package com.anpl.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BadmintonCategorySelectionRequest {

    @NotBlank(message = "Category code is required")
    private String categoryCode;

    @NotBlank(message = "Player name is required")
    private String primaryPlayerName;

    @NotNull(message = "Player age is required")
    @Min(value = 1, message = "Player age must be positive")
    private Integer primaryPlayerAge;

    @NotBlank(message = "Relation info is required")
    private String primaryPlayerRelation;

    private String partnerPlayerName;

    @Min(value = 1, message = "Partner age must be positive")
    private Integer partnerPlayerAge;

    private String partnerPlayerRelation;

    @Size(max = 500, message = "Notes must be within 500 characters")
    private String notes;
}

