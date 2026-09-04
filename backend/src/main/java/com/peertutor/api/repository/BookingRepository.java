package com.peertutor.api.repository;

import com.peertutor.api.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    // Finds all bookings where the user is the student
    List<Booking> findByStudentId(Long studentId);

    // Finds all bookings where the user is the tutor
    List<Booking> findByTutorId(Long tutorId);
}