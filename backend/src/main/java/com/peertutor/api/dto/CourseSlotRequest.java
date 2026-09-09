package com.peertutor.api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CourseSlotRequest {
    private LocalDateTime slotDateTime;
    private Integer maxSeats;
}
