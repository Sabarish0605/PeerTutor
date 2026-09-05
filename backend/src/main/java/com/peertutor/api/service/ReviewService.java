package com.peertutor.api.service;

import com.peertutor.api.dto.ReviewRequest;
import com.peertutor.api.entity.Booking;
import com.peertutor.api.entity.BookingStatus;
import com.peertutor.api.entity.Review;
import com.peertutor.api.entity.TutorProfile;
import com.peertutor.api.repository.BookingRepository;
import com.peertutor.api.repository.ReviewRepository;
import com.peertutor.api.repository.TutorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final TutorProfileRepository tutorProfileRepository;

    @Transactional
    public Review createReview(Long studentId, ReviewRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Security check: Only the student who booked it can review it
        if (!booking.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("You can only review your own sessions");
        }

        // For MVP: We assume the session is COMPLETED if they are reviewing it.
        // Let's update the booking status to COMPLETED if it isn't already.
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            booking.setStatus(BookingStatus.COMPLETED);
            bookingRepository.save(booking);
        }

        Review review = Review.builder()
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Update the Tutor's Ranking & Reputation
        updateTutorReputation(booking.getTutor().getId());

        return savedReview;
    }

    private void updateTutorReputation(Long tutorId) {
        TutorProfile tutor = tutorProfileRepository.findById(tutorId)
                .orElseThrow(() -> new RuntimeException("Tutor not found"));

        List<Review> tutorReviews = reviewRepository.findByBookingTutorId(tutorId);

        if (tutorReviews.isEmpty()) return;

        // Calculate average rating
        double totalRating = 0;
        for (Review r : tutorReviews) {
            totalRating += r.getRating();
        }
        double averageRating = totalRating / tutorReviews.size();

        // Basic Reputation Formula: (Average Rating) * (Number of Completed Sessions)
        int completedSessions = tutorReviews.size();
        double reputationScore = averageRating * completedSessions;

        tutor.setRating(Math.round(averageRating * 10.0) / 10.0); // Round to 1 decimal
        tutor.setCompletedSessions(completedSessions);
        tutor.setReputationScore(reputationScore);

        tutorProfileRepository.save(tutor);
    }
}