package com.peertutor.api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CourseSlotRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer maxSeats;
}
