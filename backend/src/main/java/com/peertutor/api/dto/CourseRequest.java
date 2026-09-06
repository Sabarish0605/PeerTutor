package com.peertutor.api.dto;

import lombok.Data;

@Data
public class CourseRequest {
    private String title;
    private String description;
    private Double price;
    private Integer maxPeers;
    private String thumbnailUrl;
    private String demoVideoUrl;
    private Long subjectId;
    private String scheduleDay;
    private String scheduleTime;
    private String scheduleEndTime;
}