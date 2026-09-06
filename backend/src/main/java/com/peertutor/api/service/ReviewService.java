package com.peertutor.api.service;

import com.peertutor.api.dto.ReviewRequest;
import com.peertutor.api.entity.Booking;
import com.peertutor.api.entity.Review;
import com.peertutor.api.entity.TutorProfile;
import com.peertutor.api.repository.BookingRepository;
import com.peertutor.api.repository.ReviewRepository;
import com.peertutor.api.repository.TutorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final TutorProfileRepository tutorProfileRepository;

    public Review submitReview(Long studentId, Long bookingId, ReviewRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("Unauthorized: This is not your booking.");
        }

        // We only need the booking, rating, and comment!
        Review review = Review.builder()
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Grab the tutor from the course to update their rating
        TutorProfile tutor = booking.getCourse().getTutor();
        updateTutorRating(tutor);

        return savedReview;
    }

    private void updateTutorRating(TutorProfile tutor) {
        // Using the updated repository method
        List<Review> tutorReviews = reviewRepository.findByBookingCourseTutorId(tutor.getId());
        if (tutorReviews.isEmpty()) return;

        double averageRating = tutorReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        tutor.setRating(Math.round(averageRating * 10.0) / 10.0);
        tutorProfileRepository.save(tutor);
    }
}