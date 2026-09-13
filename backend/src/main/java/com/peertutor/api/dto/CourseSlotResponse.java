package com.peertutor.api.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CourseSlotResponse {
    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer maxSeats;
    private Integer currentEnrolled;
    private String sessionStatus;

    @com.fasterxml.jackson.annotation.JsonProperty("status")
    public String getStatus() {
        return sessionStatus;
    }
}
