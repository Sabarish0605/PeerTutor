package com.peertutor.api.service;

import com.peertutor.api.entity.*;
import com.peertutor.api.repository.BookingRepository;
import com.peertutor.api.repository.NotificationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    @DisplayName("60-Minute Reminders: Dispatches in-app notification & email for slot starting in 60 mins")
    void testDispatches60MinuteReminder() {
        User tutor = User.builder().id(1L).name("Prof. Turing").email("turing@test.com").build();
        User student = User.builder().id(2L).name("Grace Hopper").email("grace@test.com").build();

        Course course = Course.builder().id(10L).title("Advanced Compiler Design").author(tutor).meetLink("https://meet.google.com/xyz").build();

        CourseSlot slot = CourseSlot.builder()
                .id(99L)
                .course(course)
                .startTime(LocalDateTime.now().plusMinutes(60))
                .endTime(LocalDateTime.now().plusMinutes(120))
                .sessionStatus("SCHEDULED")
                .build();

        Booking booking = Booking.builder()
                .id(500L)
                .student(student)
                .course(course)
                .slot(slot)
                .build();

        when(bookingRepository.findAll()).thenReturn(List.of(booking));
        when(notificationRepository.existsByUserIdAndMessageContaining(eq(2L), contains("[Slot #99]"))).thenReturn(false);

        notificationService.scheduleClassReminders();

        // 1. Verify in-app notification saved
        ArgumentCaptor<Notification> notifCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notifCaptor.capture());
        Notification savedNotif = notifCaptor.getValue();
        assertEquals(student, savedNotif.getUser());
        assertTrue(savedNotif.getMessage().contains("Advanced Compiler Design"));
        assertTrue(savedNotif.getMessage().contains("[Slot #99]"));

        // 2. Verify email reminder sent
        verify(emailService).sendSessionReminder(
                eq("grace@test.com"),
                eq("Grace Hopper"),
                eq("Advanced Compiler Design"),
                eq("Prof. Turing"),
                anyString(),
                eq("https://meet.google.com/xyz")
        );
    }

    @Test
    @DisplayName("Duplicate Suppression: Does not re-send 60-min reminder if already sent")
    void testSuppressesDuplicateReminders() {
        User tutor = User.builder().id(1L).name("Prof. Turing").build();
        User student = User.builder().id(2L).name("Grace Hopper").email("grace@test.com").build();
        Course course = Course.builder().id(10L).title("Algorithms").author(tutor).build();
        CourseSlot slot = CourseSlot.builder().id(99L).startTime(LocalDateTime.now().plusMinutes(60)).sessionStatus("SCHEDULED").build();
        Booking booking = Booking.builder().id(500L).student(student).course(course).slot(slot).build();

        when(bookingRepository.findAll()).thenReturn(List.of(booking));
        // Already sent!
        when(notificationRepository.existsByUserIdAndMessageContaining(eq(2L), contains("[Slot #99]"))).thenReturn(true);

        notificationService.scheduleClassReminders();

        verify(notificationRepository, never()).save(any());
        verify(emailService, never()).sendSessionReminder(any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Fault Tolerance: External Email failure for Student 1 does not crash loop; Student 2 receives reminder")
    void testFaultToleranceWhenEmailFailsForOneStudent() {
        User tutor = User.builder().id(1L).name("Prof. Turing").email("turing@test.com").build();
        User student1 = User.builder().id(2L).name("Grace Hopper").email("grace@invalid.com").build();
        User student2 = User.builder().id(3L).name("Ada Lovelace").email("ada@test.com").build();

        Course course = Course.builder().id(10L).title("Algorithms").author(tutor).meetLink("https://meet.google.com/xyz").build();

        CourseSlot slot1 = CourseSlot.builder().id(91L).course(course).startTime(LocalDateTime.now().plusMinutes(60)).sessionStatus("SCHEDULED").build();
        CourseSlot slot2 = CourseSlot.builder().id(92L).course(course).startTime(LocalDateTime.now().plusMinutes(60)).sessionStatus("SCHEDULED").build();

        Booking booking1 = Booking.builder().id(501L).student(student1).course(course).slot(slot1).build();
        Booking booking2 = Booking.builder().id(502L).student(student2).course(course).slot(slot2).build();

        when(bookingRepository.findAll()).thenReturn(List.of(booking1, booking2));
        when(notificationRepository.existsByUserIdAndMessageContaining(anyLong(), anyString())).thenReturn(false);

        // Student 1 fails with external network / SendGrid exception
        doThrow(new RuntimeException("SendGrid 503 Service Unavailable"))
                .when(emailService).sendSessionReminder(eq("grace@invalid.com"), any(), any(), any(), any(), any());

        // Run the scheduled reminder
        assertDoesNotThrow(() -> notificationService.scheduleClassReminders());

        // In-app notifications must be created for BOTH students
        verify(notificationRepository, times(2)).save(any(Notification.class));

        // Email was attempted for student 1 and successfully sent for student 2
        verify(emailService).sendSessionReminder(eq("grace@invalid.com"), any(), any(), any(), any(), any());
        verify(emailService).sendSessionReminder(eq("ada@test.com"), any(), any(), any(), any(), any());
    }
}

