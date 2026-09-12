package com.peertutor.api.service;

import com.peertutor.api.dto.CourseRequest;
import com.peertutor.api.dto.CourseSlotRequest;
import com.peertutor.api.entity.Course;
import com.peertutor.api.entity.CourseSlot;
import com.peertutor.api.entity.User;
import com.peertutor.api.repository.BookingRepository;
import com.peertutor.api.repository.CourseRepository;
import com.peertutor.api.repository.CourseSlotRepository;
import com.peertutor.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private CourseSlotRepository courseSlotRepository;

    @InjectMocks
    private CourseService courseService;

    private User tutor;
    private Course sampleCourse;
    private CourseSlot enrolledSlot;

    @BeforeEach
    void setUp() {
        tutor = User.builder().id(1L).name("Tutor Alice").email("alice@test.com").build();

        enrolledSlot = CourseSlot.builder()
                .id(10L)
                .startTime(LocalDateTime.now().plusHours(2))
                .endTime(LocalDateTime.now().plusHours(3))
                .maxSeats(5)
                .currentEnrolled(2)
                .sessionStatus("SCHEDULED")
                .build();

        sampleCourse = Course.builder()
                .id(100L)
                .title("DSA in Java")
                .price(499.0)
                .maxPeers(5)
                .author(tutor)
                .slots(new ArrayList<>(List.of(enrolledSlot)))
                .build();
        enrolledSlot.setCourse(sampleCourse);
    }

    @Test
    @DisplayName("Granular Lock: Changing start/end time of enrolled slot throws 400 Bad Request")
    void testLockedSlotTimeModification() {
        when(courseRepository.findById(100L)).thenReturn(Optional.of(sampleCourse));
        when(bookingRepository.countByCourseId(100L)).thenReturn(2L);

        CourseSlotRequest modifiedSlotReq = CourseSlotRequest.builder()
                .id(10L)
                .startTime(LocalDateTime.now().plusHours(4)) // changed time!
                .endTime(LocalDateTime.now().plusHours(5))
                .maxSeats(5)
                .build();

        CourseRequest request = CourseRequest.builder()
                .title("DSA in Java")
                .price(499.0)
                .slots(List.of(modifiedSlotReq))
                .build();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> courseService.updateCourse(100L, 1L, request));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Cannot change the date/time"));
    }

    @Test
    @DisplayName("Price Lockout: Changing course price after student enrollment throws 400 Bad Request")
    void testLockedPriceModification() {
        when(courseRepository.findById(100L)).thenReturn(Optional.of(sampleCourse));
        when(bookingRepository.countByCourseId(100L)).thenReturn(2L);

        CourseRequest request = CourseRequest.builder()
                .title("DSA in Java")
                .price(799.0) // changed price!
                .slots(List.of(CourseSlotRequest.builder()
                        .id(10L)
                        .startTime(enrolledSlot.getStartTime())
                        .endTime(enrolledSlot.getEndTime())
                        .maxSeats(5)
                        .build()))
                .build();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> courseService.updateCourse(100L, 1L, request));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Cannot modify course price"));
    }

    @Test
    @DisplayName("Safe Deletion: Attempting to delete course with active bookings throws 400 Bad Request")
    void testSafeDeletionBlockedWithActiveBookings() {
        when(courseRepository.findById(100L)).thenReturn(Optional.of(sampleCourse));
        when(bookingRepository.countByCourseId(100L)).thenReturn(3L); // 3 active student bookings

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> courseService.deleteCourse(100L, 1L));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Cannot delete course: There are 3 active student booking(s)"));
        verify(courseRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Safe Deletion: Course with 0 bookings is successfully deleted")
    void testSafeDeletionAllowedWithZeroBookings() {
        when(courseRepository.findById(100L)).thenReturn(Optional.of(sampleCourse));
        when(bookingRepository.countByCourseId(100L)).thenReturn(0L);

        assertDoesNotThrow(() -> courseService.deleteCourse(100L, 1L));
        verify(courseRepository).delete(sampleCourse);
    }
}
