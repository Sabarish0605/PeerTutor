package com.peertutor.api.repository;

import com.peertutor.api.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // Allows us to find all reviews for a specific tutor via the booking connection
    List<Review> findByBookingTutorId(Long tutorId);
}