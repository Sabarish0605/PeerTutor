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
    private Long tutorId;
    private String tutorName;
    private java.util.List<CourseSlotResponse> slots;
    private String meetLink;
    private Long enrollmentCount;
    private String authorAvatar;
    /** Non-null when the requesting student is already enrolled in a slot of this course. */
    private Long enrolledSlotId;
}