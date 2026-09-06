package com.peertutor.api.repository;

import com.peertutor.api.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // NEW PATH: Finds reviews by looking at Booking -> Course -> Tutor -> Id
    List<Review> findByBookingCourseTutorId(Long tutorId);
}