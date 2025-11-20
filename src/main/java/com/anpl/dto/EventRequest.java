package com.anpl.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
public class EventRequest {
    @NotBlank(message = "Event name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price must be positive")
    private Double price;

    @NotNull(message = "Year is required")
    private Integer year;

    @NotNull(message = "Active status is required")
    private Boolean active;

    private LocalDateTime registrationStartDate;

    private LocalDateTime registrationEndDate;
}

