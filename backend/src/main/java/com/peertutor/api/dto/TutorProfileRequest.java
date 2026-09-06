package com.peertutor.api.dto;

import lombok.Data;
import java.util.List;

@Data
public class TutorProfileRequest {
    private String experience;
    private Double price;
    private String teachingLevel;
    private String upiId;
    private List<Long> subjectIds;
}