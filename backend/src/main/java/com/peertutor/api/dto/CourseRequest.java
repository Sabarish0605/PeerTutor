package com.peertutor.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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