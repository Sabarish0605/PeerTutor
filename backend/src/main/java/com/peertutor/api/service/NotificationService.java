package com.peertutor.api.service;

import com.peertutor.api.entity.Booking;
import com.peertutor.api.entity.Course;
import com.peertutor.api.entity.CourseSlot;
import com.peertutor.api.entity.Notification;
import com.peertutor.api.entity.User;
import com.peertutor.api.repository.BookingRepository;
import com.peertutor.api.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");

    /**
     * Runs every minute to dispatch 60-minute reminders for upcoming peer sessions.
     * Looks for SCHEDULED slots starting within the 55-65 minute window.
     */
    @Scheduled(fixedRate = 60_000)  // every 60 seconds
    @Transactional
    public void scheduleClassReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowStart = now.plusMinutes(55);
        LocalDateTime windowEnd = now.plusMinutes(65);

        List<Booking> allBookings = bookingRepository.findAll();
        int reminderCount = 0;

        for (Booking booking : allBookings) {
            try {
                CourseSlot slot = booking.getSlot();
                if (slot == null || !"SCHEDULED".equals(slot.getSessionStatus())) {
                    continue;
                }

                LocalDateTime start = slot.getStartTime();
                if (start == null || start.isBefore(windowStart) || start.isAfter(windowEnd)) {
                    continue;
                }

                User student = booking.getStudent();
                Course course = booking.getCourse();
                if (student == null || course == null) continue;

                String slotMarker = "[Slot #" + slot.getId() + "]";
                // Prevent duplicate reminders for the same slot
                if (notificationRepository.existsByUserIdAndMessageContaining(student.getId(), slotMarker)) {
                    continue;
                }

                String tutorName = course.getAuthor() != null ? course.getAuthor().getName() : "your tutor";
                String formattedTime = start.format(TIME_FORMATTER);

                // 1. In-App Notification (Always delivered even if external email fails)
                String notifMsg = "⏰ Reminder: Your session for '" + course.getTitle() + "' with " + tutorName
                        + " starts in ~60 minutes (" + formattedTime + ")! " + slotMarker;

                Notification notification = Notification.builder()
                        .user(student)
                        .message(notifMsg)
                        .isRead(false)
                        .build();
                notificationRepository.save(notification);

                // 2. Email Delivery with isolated exception suppression
                try {
                    emailService.sendSessionReminder(
                            student.getEmail(),
                            student.getName(),
                            course.getTitle(),
                            tutorName,
                            formattedTime,
                            course.getMeetLink()
                    );
                } catch (Exception emailEx) {
                    log.warn("External email dispatch failed for student {}: {}. Continuing loop.",
                            student.getEmail(), emailEx.getMessage());
                }

                reminderCount++;
                log.info("Sent 60-min reminder to student id={} for slot id={} course='{}'",
                        student.getId(), slot.getId(), course.getTitle());
            } catch (Exception itemEx) {
                log.error("Error processing booking reminder for id={}: {}",
                        booking != null ? booking.getId() : "null", itemEx.getMessage());
            }
        }

        if (reminderCount > 0) {
            log.info("NotificationService: Dispatched {} session reminder(s).", reminderCount);
        }
    }
}

