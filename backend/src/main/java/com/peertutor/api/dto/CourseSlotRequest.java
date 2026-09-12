package com.peertutor.api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CourseSlotRequest {
    private Long id;            // null = create new slot; non-null = update existing slot
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer maxSeats;
}
