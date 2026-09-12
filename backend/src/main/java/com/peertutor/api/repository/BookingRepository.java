package com.peertutor.api.repository;

import com.peertutor.api.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Finds all bookings for a student
    List<Booking> findByStudentId(Long studentId);

    // Counts how many seats are currently taken in a specific course
    long countByCourseId(Long courseId);

    // Checks if a student is already enrolled in a specific slot
    boolean existsByStudentIdAndCourseIdAndSlotId(Long studentId, Long courseId, Long slotId);

    // Checks if a student has ANY booking for a given course (any slot)
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    // Checks if a student has a booking for a specific slot (for review gateway)
    boolean existsByStudentIdAndSlotId(Long studentId, Long slotId);

    // Finds all bookings for a specific course
    List<Booking> findByCourseId(Long courseId);

    // Returns the slot id the student is enrolled in for a given course (for "Already Enrolled" badge)
    @Query("SELECT b.slot.id FROM Booking b WHERE b.student.id = :studentId AND b.course.id = :courseId")
    Optional<Long> findEnrolledSlotId(@Param("studentId") Long studentId, @Param("courseId") Long courseId);
}
