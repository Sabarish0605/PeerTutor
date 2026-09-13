package com.peertutor.api.scheduler;

import com.peertutor.api.entity.Booking;
import com.peertutor.api.entity.BookingStatus;
import com.peertutor.api.entity.CourseSlot;
import com.peertutor.api.entity.SlotStatus;
import com.peertutor.api.repository.BookingRepository;
import com.peertutor.api.repository.CourseSlotRepository;
import com.peertutor.api.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * EscrowScheduler — Automated Escrow Arbiter for "Ghost Tutors".
 * If a scheduled class time expires without the tutor marking it as completed (status remains 'SCHEDULED'),
 * this scheduler automatically marks the slot as ABANDONED, marks all student bookings as REFUNDED,
 * and sends each student an escrow refund notification email.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EscrowScheduler {

    private final CourseSlotRepository courseSlotRepository;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");

    @Scheduled(cron = "0 0/15 * * * *")
    @Transactional
    public void processAbandonedEscrowSlots() {
        LocalDateTime now = LocalDateTime.now();
        List<CourseSlot> expiredSlots = courseSlotRepository
                .findBySessionStatusAndEndTimeBefore("SCHEDULED", now);

        if (expiredSlots.isEmpty()) {
            return;
        }

        log.info("EscrowScheduler: Found {} expired SCHEDULED slot(s) to arbitrate.", expiredSlots.size());

        List<Booking> allUpdatedBookings = new ArrayList<>();
        List<CourseSlot> allUpdatedSlots = new ArrayList<>();

        for (CourseSlot slot : expiredSlots) {
            slot.setSessionStatus(SlotStatus.ABANDONED.name());
            allUpdatedSlots.add(slot);

            List<Booking> bookings = bookingRepository.findBySlotId(slot.getId());
            String courseTitle = (slot.getCourse() != null && slot.getCourse().getTitle() != null)
                    ? slot.getCourse().getTitle()
                    : "Course";
            String slotTime = slot.getStartTime() != null
                    ? slot.getStartTime().format(TIME_FORMATTER)
                    : "Scheduled Session";

            for (Booking booking : bookings) {
                booking.setStatus(BookingStatus.REFUNDED.name());
                allUpdatedBookings.add(booking);

                if (booking.getStudent() != null && booking.getStudent().getEmail() != null) {
                    try {
                        emailService.sendEscrowRefundEmail(
                                booking.getStudent().getEmail(),
                                courseTitle,
                                slotTime
                        );
                        log.info("Triggered escrow refund email to student {} for course '{}' slot id={}",
                                booking.getStudent().getEmail(), courseTitle, slot.getId());
                    } catch (Exception e) {
                        log.error("Failed to trigger escrow refund email to {}: {}",
                                booking.getStudent().getEmail(), e.getMessage());
                    }
                }
            }
        }

        // Save all updated slots and bookings in a single @Transactional batch
        courseSlotRepository.saveAll(allUpdatedSlots);
        if (!allUpdatedBookings.isEmpty()) {
            bookingRepository.saveAll(allUpdatedBookings);
        }

        log.info("EscrowScheduler: Successfully marked {} slot(s) as ABANDONED and refunded {} booking(s).",
                allUpdatedSlots.size(), allUpdatedBookings.size());
    }
}
