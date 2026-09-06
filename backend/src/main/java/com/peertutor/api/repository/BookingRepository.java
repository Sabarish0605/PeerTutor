package com.peertutor.api.repository;

import com.peertutor.api.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Finds all courses a student is enrolled in
    List<Booking> findByStudentId(Long studentId);

    // Counts how many seats are currently taken in a specific course
    long countByCourseId(Long courseId);

    // Checks if a student is already enrolled in a specific course
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
}