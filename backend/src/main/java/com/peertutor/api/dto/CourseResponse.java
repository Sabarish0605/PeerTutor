package com.peertutor.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private Double price;
    private Integer maxPeers;
    private String thumbnailUrl;
    private String demoVideoUrl;
    private String categoryName;
    private String tutorName;
    private String scheduleDay;
    private String scheduleTime;
    private String scheduleEndTime;
}