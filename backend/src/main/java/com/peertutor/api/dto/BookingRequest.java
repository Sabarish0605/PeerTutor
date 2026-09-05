package com.peertutor.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {

    @NotNull(message = "Tutor ID is required")
    private Long tutorId;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotNull(message = "Availability Slot ID is required")
    private Long availabilityId;

    @NotNull(message = "Session date is required")
    private LocalDate sessionDate;
}