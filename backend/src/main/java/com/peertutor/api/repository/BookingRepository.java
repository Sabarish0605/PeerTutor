package com.peertutor.api.repository;

import com.peertutor.api.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Finds all courses a student is enrolled in
    List<Booking> findByStudentId(Long studentId);

    // Counts how many seats are currently taken in a specific course
    long countByCourseId(Long courseId);

    // Checks if a student is already enrolled in a specific slot
    boolean existsByStudentIdAndCourseIdAndSlotId(Long studentId, Long courseId, Long slotId);

    // Checks if a student has a booking for a specific slot (for review gateway)
    boolean existsByStudentIdAndSlotId(Long studentId, Long slotId);

    // Finds all bookings for a specific course
    List<Booking> findByCourseId(Long courseId);
}