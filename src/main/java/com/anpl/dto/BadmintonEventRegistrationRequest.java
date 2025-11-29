package com.anpl.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class BadmintonEventRegistrationRequest {

    @NotNull
    private Long eventId;

    @NotEmpty(message = "At least one category must be selected")
    @Valid
    private List<BadmintonRegistrationEntryRequest> entries;

    @NotNull
    private String playerPhoto;

    @NotNull
    private Boolean termsAccepted;

    @Min(1)
    private Integer totalAmount;
}

