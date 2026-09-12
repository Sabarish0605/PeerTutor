package com.peertutor.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseSlotRequest {
    private Long id;            // null = create new slot; non-null = update existing slot
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer maxSeats;
}
