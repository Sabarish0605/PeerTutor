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
    private String categoryName;
    private java.util.List<CourseSlotRequest> slots;
    private String meetLink;
}