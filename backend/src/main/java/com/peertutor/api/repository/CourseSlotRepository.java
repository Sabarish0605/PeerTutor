package com.peertutor.api.repository;

import com.peertutor.api.entity.CourseSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CourseSlotRepository extends JpaRepository<CourseSlot, Long> {

    // Legacy — kept for any residual usage
    List<CourseSlot> findByStartTimeBefore(LocalDateTime dateTime);

    // Find SCHEDULED slots whose startTime is before a given cutoff (for expiry engine)
    List<CourseSlot> findBySessionStatusAndStartTimeBefore(String sessionStatus, LocalDateTime dateTime);

    // Find all slots of a course with a specific status
    List<CourseSlot> findByCourseIdAndSessionStatus(Long courseId, String sessionStatus);
}
