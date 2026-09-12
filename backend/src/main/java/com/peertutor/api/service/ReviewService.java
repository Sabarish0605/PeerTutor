package com.peertutor.api.service;

import com.peertutor.api.dto.ReviewRequest;
import com.peertutor.api.entity.Booking;
import com.peertutor.api.entity.Review;
import com.peertutor.api.entity.TutorProfile;
import com.peertutor.api.repository.BookingRepository;
import com.peertutor.api.repository.ReviewRepository;
import com.peertutor.api.repository.TutorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final TutorProfileRepository tutorProfileRepository;

    public Review submitReview(Long studentId, Long bookingId, ReviewRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Ensure the student owns this booking
        if (!booking.getStudent().getId().equals(studentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized: This is not your booking.");
        }

        // ── Strict Review Gateway ──────────────────────────────────────────
        // The slot MUST be CLOSED for a review to be submitted
        if (booking.getSlot() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No session slot found for this booking.");
        }
        String slotStatus = booking.getSlot().getSessionStatus();
        if (!"CLOSED".equals(slotStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Reviews can only be submitted after a session has been closed by the tutor. Current status: " + slotStatus);
        }

        // Verify the student actually has a booking for that slot
        boolean hasValidBooking = bookingRepository.existsByStudentIdAndSlotId(studentId, booking.getSlot().getId());
        if (!hasValidBooking) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not enrolled in this session.");
        }

        // ── Double-Review Prevention ───────────────────────────────────────
        if (reviewRepository.existsByBookingId(bookingId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A review has already been submitted for this session.");
        }

        Review review = Review.builder()
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Update tutor's average rating dynamically
        Long tutorUserId = booking.getCourse().getAuthor().getId();
        tutorProfileRepository.findByUserId(tutorUserId).ifPresent(this::updateTutorRating);

        return savedReview;
    }

    private void updateTutorRating(TutorProfile tutor) {
        List<Review> tutorReviews = reviewRepository.findByBookingCourseAuthorId(tutor.getUser().getId());
        if (tutorReviews.isEmpty()) return;

        double averageRating = tutorReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        tutor.setRating(Math.round(averageRating * 10.0) / 10.0);
        tutorProfileRepository.save(tutor);
    }

    public List<Review> getReviewsByTutor(Long tutorId) {
        return reviewRepository.findByBookingCourseAuthorId(tutorId);
    }
}