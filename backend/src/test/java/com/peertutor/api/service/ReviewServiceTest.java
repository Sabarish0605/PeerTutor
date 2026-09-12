package com.peertutor.api.service;

import com.peertutor.api.dto.ReviewRequest;
import com.peertutor.api.entity.*;
import com.peertutor.api.repository.BookingRepository;
import com.peertutor.api.repository.ReviewRepository;
import com.peertutor.api.repository.TutorProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private TutorProfileRepository tutorProfileRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User student;
    private User tutorUser;
    private TutorProfile tutorProfile;
    private Course course;
    private CourseSlot closedSlot;
    private CourseSlot liveSlot;
    private Booking booking;

    @BeforeEach
    void setUp() {
        student = User.builder().id(20L).name("Bob Student").email("bob@test.com").build();
        tutorUser = User.builder().id(10L).name("Alice Tutor").email("alice@test.com").build();
        tutorProfile = TutorProfile.builder().id(1L).user(tutorUser).rating(4.0).build();
        tutorUser.setTutorProfile(tutorProfile);

        course = Course.builder().id(100L).title("Full Stack Web Dev").author(tutorUser).build();

        closedSlot = CourseSlot.builder().id(50L).course(course).sessionStatus("CLOSED").build();
        liveSlot = CourseSlot.builder().id(51L).course(course).sessionStatus("LIVE").build();

        booking = Booking.builder()
                .id(200L)
                .student(student)
                .course(course)
                .slot(closedSlot)
                .build();
    }

    @Test
    @DisplayName("Review Gate: Review submitted successfully for a CLOSED session")
    void testSubmitReviewForClosedSession() {
        when(bookingRepository.findById(200L)).thenReturn(Optional.of(booking));
        when(bookingRepository.existsByStudentIdAndSlotId(20L, 50L)).thenReturn(true);
        when(reviewRepository.existsByBookingId(200L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> i.getArgument(0));

        when(tutorProfileRepository.findByUserId(10L)).thenReturn(Optional.of(tutorProfile));
        Review existingRev = Review.builder().rating(5).build();
        when(reviewRepository.findByBookingCourseAuthorId(10L)).thenReturn(List.of(existingRev));

        ReviewRequest req = ReviewRequest.builder().rating(5).comment("Fantastic interactive class!").build();
        Review result = reviewService.submitReview(20L, 200L, req);

        assertNotNull(result);
        assertEquals(5, result.getRating());
        assertEquals("Fantastic interactive class!", result.getComment());
        assertEquals(5.0, tutorProfile.getRating()); // Dynamic rating updated
        verify(tutorProfileRepository).save(tutorProfile);
    }

    @Test
    @DisplayName("Review Gate: Review submission on LIVE session throws 400 Bad Request")
    void testSubmitReviewOnLiveSessionFails() {
        Booking liveBooking = Booking.builder()
                .id(201L)
                .student(student)
                .course(course)
                .slot(liveSlot)
                .build();

        when(bookingRepository.findById(201L)).thenReturn(Optional.of(liveBooking));

        ReviewRequest req = ReviewRequest.builder().rating(5).comment("Too early!").build();
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> reviewService.submitReview(20L, 201L, req));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Reviews can only be submitted after a session has been closed"));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("Double-Review Prevention: Second review attempt throws 400 Bad Request")
    void testDoubleReviewPrevention() {
        when(bookingRepository.findById(200L)).thenReturn(Optional.of(booking));
        when(bookingRepository.existsByStudentIdAndSlotId(20L, 50L)).thenReturn(true);
        when(reviewRepository.existsByBookingId(200L)).thenReturn(true); // already reviewed!

        ReviewRequest req = ReviewRequest.builder().rating(4).comment("Duplicate review").build();
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> reviewService.submitReview(20L, 200L, req));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("A review has already been submitted for this session"));
        verify(reviewRepository, never()).save(any());
    }
}
