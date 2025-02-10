package com.anpl.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class EventRegistrationRequest {
    @NotNull(message = "Event ID is required")
    private Long eventId;
} 