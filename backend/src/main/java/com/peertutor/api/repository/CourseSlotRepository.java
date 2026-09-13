package com.peertutor.api.repository;

import com.peertutor.api.entity.CourseSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CourseSlotRepository extends JpaRepository<CourseSlot, Long> {

    // Pessimistic Write Lock: Serializes concurrent booking transactions for "last seat" protection
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM CourseSlot s WHERE s.id = :id")
    Optional<CourseSlot> findByIdWithLock(@Param("id") Long id);

    // Legacy — kept for any residual usage
    List<CourseSlot> findByStartTimeBefore(LocalDateTime dateTime);

    // Find SCHEDULED slots whose startTime is before a given cutoff (for expiry engine)
    List<CourseSlot> findBySessionStatusAndStartTimeBefore(String sessionStatus, LocalDateTime dateTime);

    // Find SCHEDULED slots with specific enrollment count before a cutoff
    List<CourseSlot> findBySessionStatusAndCurrentEnrolledAndStartTimeBefore(String sessionStatus, Integer currentEnrolled, LocalDateTime dateTime);

    // Find all slots of a course with a specific status
    List<CourseSlot> findByCourseIdAndSessionStatus(Long courseId, String sessionStatus);

    // Find slots with a specific status whose endTime is before a given cutoff (for auto-completion)
    List<CourseSlot> findBySessionStatusAndEndTimeBefore(String sessionStatus, LocalDateTime dateTime);
}
