package com.peertutor.api.service;

import com.peertutor.api.entity.Booking;
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

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private CourseSlotRepository courseSlotRepository;

    @InjectMocks
    private BookingService bookingService;

    private User student1;
    private User student2;
    private Course course;
    private CourseSlot lastSeatSlot;

    @BeforeEach
    void setUp() {
        student1 = User.builder().id(101L).name("Student One").email("s1@test.com").build();
        student2 = User.builder().id(102L).name("Student Two").email("s2@test.com").build();
        course = Course.builder().id(10L).title("Concurrent Algorithms").build();

        // Slot with maxSeats = 1, currentEnrolled = 0 (exactly 1 seat available)
        lastSeatSlot = CourseSlot.builder()
                .id(50L)
                .course(course)
                .startTime(LocalDateTime.now().plusHours(24))
                .endTime(LocalDateTime.now().plusHours(25))
                .maxSeats(1)
                .currentEnrolled(0)
                .sessionStatus("SCHEDULED")
                .build();
    }

    @Test
    @DisplayName("Last Seat Booking: First student acquires lock and successfully reserves the last seat")
    void testFirstStudentBooksLastSeatSuccessfully() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(student1));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(courseSlotRepository.findByIdWithLock(50L)).thenReturn(Optional.of(lastSeatSlot));
        when(bookingRepository.existsByStudentIdAndCourseIdAndSlotId(101L, 10L, 50L)).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        Booking booking = bookingService.createBooking(101L, 10L, 50L);

        assertNotNull(booking);
        assertEquals(1, lastSeatSlot.getCurrentEnrolled());
        verify(courseSlotRepository).save(lastSeatSlot);
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    @DisplayName("The Last Seat Race Condition: Second concurrent student fails gracefully with 'completely full'")
    void testSecondStudentFailsWhenLastSeatTaken() {
        // Slot capacity has been updated to 1/1 (no seats left)
        lastSeatSlot.setCurrentEnrolled(1);

        when(userRepository.findById(102L)).thenReturn(Optional.of(student2));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(courseSlotRepository.findByIdWithLock(50L)).thenReturn(Optional.of(lastSeatSlot));
        when(bookingRepository.existsByStudentIdAndCourseIdAndSlotId(102L, 10L, 50L)).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> bookingService.createBooking(102L, 10L, 50L));

        assertTrue(ex.getMessage().contains("completely full"));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Double Booking Guard: Student cannot double-book the same slot")
    void testPreventDoubleBooking() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(student1));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(courseSlotRepository.findByIdWithLock(50L)).thenReturn(Optional.of(lastSeatSlot));
        when(bookingRepository.existsByStudentIdAndCourseIdAndSlotId(101L, 10L, 50L)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> bookingService.createBooking(101L, 10L, 50L));

        assertTrue(ex.getMessage().contains("already enrolled"));
    }
}
