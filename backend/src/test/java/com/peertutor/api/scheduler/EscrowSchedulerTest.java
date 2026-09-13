package com.peertutor.api.scheduler;

import com.peertutor.api.entity.Booking;
import com.peertutor.api.entity.Course;
import com.peertutor.api.entity.CourseSlot;
import com.peertutor.api.entity.User;
import com.peertutor.api.repository.BookingRepository;
import com.peertutor.api.repository.CourseSlotRepository;
import com.peertutor.api.service.EmailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EscrowSchedulerTest {

    @Mock
    private CourseSlotRepository courseSlotRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private EscrowScheduler escrowScheduler;

    @Test
    @DisplayName("Escrow Arbiter: Expired scheduled slots are marked ABANDONED, bookings REFUNDED, and refund emails sent")
    void testProcessAbandonedEscrowSlots() {
        Course course = Course.builder()
                .id(10L)
                .title("Full Stack Web Development")
                .build();

        CourseSlot expiredSlot = CourseSlot.builder()
                .id(100L)
                .course(course)
                .startTime(LocalDateTime.now().minusHours(2))
                .endTime(LocalDateTime.now().minusHours(1))
                .sessionStatus("SCHEDULED")
                .currentEnrolled(1)
                .build();

        User student = User.builder()
                .id(20L)
                .name("Alice")
                .email("alice@example.com")
                .build();

        Booking booking = Booking.builder()
                .id(300L)
                .course(course)
                .slot(expiredSlot)
                .student(student)
                .status("ACTIVE")
                .build();

        when(courseSlotRepository.findBySessionStatusAndEndTimeBefore(eq("SCHEDULED"), any(LocalDateTime.class)))
                .thenReturn(List.of(expiredSlot));
        when(bookingRepository.findBySlotId(100L))
                .thenReturn(List.of(booking));

        escrowScheduler.processAbandonedEscrowSlots();

        assertEquals("ABANDONED", expiredSlot.getSessionStatus());
        assertEquals("REFUNDED", booking.getStatus());

        verify(courseSlotRepository).saveAll(List.of(expiredSlot));
        verify(bookingRepository).saveAll(List.of(booking));
        verify(emailService).sendEscrowRefundEmail(eq("alice@example.com"), eq("Full Stack Web Development"), anyString());
    }

    @Test
    @DisplayName("Escrow Arbiter No-Op: When no slots are expired, repositories are not updated")
    void testNoExpiredSlots() {
        when(courseSlotRepository.findBySessionStatusAndEndTimeBefore(eq("SCHEDULED"), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        escrowScheduler.processAbandonedEscrowSlots();

        verify(courseSlotRepository, never()).saveAll(any());
        verify(bookingRepository, never()).saveAll(any());
        verify(emailService, never()).sendEscrowRefundEmail(anyString(), anyString(), anyString());
    }
}
