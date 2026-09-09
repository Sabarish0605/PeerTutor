package com.peertutor.api.repository;

import com.peertutor.api.entity.CourseSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CourseSlotRepository extends JpaRepository<CourseSlot, Long> {
    List<CourseSlot> findBySlotDateTimeBefore(LocalDateTime dateTime);
}
