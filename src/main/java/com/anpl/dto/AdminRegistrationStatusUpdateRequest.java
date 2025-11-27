package com.anpl.dto;

import com.anpl.model.RegistrationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminRegistrationStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private RegistrationStatus status;

    private String notes;
}

