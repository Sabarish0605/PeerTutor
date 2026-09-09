package com.peertutor.api.dto;

import lombok.Data;

@Data
public class OnboardTutorRequest {
    private String bio;
    private String experience;
    private String upiId;
}
