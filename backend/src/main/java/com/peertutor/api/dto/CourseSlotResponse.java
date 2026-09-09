package com.peertutor.api.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CourseSlotResponse {
    private Long id;
    private LocalDateTime slotDateTime;
    private Integer maxSeats;
    private Integer currentEnrolled;
}
