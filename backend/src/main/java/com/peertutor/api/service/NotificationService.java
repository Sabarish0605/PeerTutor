package com.peertutor.api.service;

import com.peertutor.api.entity.Booking;
import com.peertutor.api.entity.Course;
import com.peertutor.api.entity.Notification;
import com.peertutor.api.repository.BookingRepository;
import com.peertutor.api.repository.CourseRepository;
import com.peertutor.api.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final CourseRepository courseRepository;
    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;

    @Scheduled(cron = "0 * * * * *") // Runs every minute
    public void scheduleClassReminders() {
        // Reminders are temporarily disabled because schedule formatting 
        // has been changed to support arbitrary user strings.
        // E.g., "Every Monday 10:00 AM" instead of strict DateTimes.
    }
}
