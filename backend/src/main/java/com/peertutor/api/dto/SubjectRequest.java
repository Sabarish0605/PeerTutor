package com.peertutor.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubjectRequest {

    @NotBlank(message = "Subject name is required")
    private String name; // e.g., "Java", "Calculus"

    @NotBlank(message = "Category is required")
    private String category; // e.g., "Programming", "Mathematics"
}