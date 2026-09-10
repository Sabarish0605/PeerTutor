package com.peertutor.api.repository;

import com.peertutor.api.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // NEW PATH: Finds reviews by looking at Booking -> Course -> Author -> Id
    List<Review> findByBookingCourseAuthorId(Long authorId);

    // Checks if a specific booking already has a review (used to set `reviewed` flag in booking API response)
    boolean existsByBookingId(Long bookingId);
}