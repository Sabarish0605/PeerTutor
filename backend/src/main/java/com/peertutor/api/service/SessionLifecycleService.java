package com.peertutor.api.service;

import com.peertutor.api.entity.CourseSlot;
import com.peertutor.api.repository.CourseSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * SessionLifecycleService — runs every minute.
 *
 * Auto-expiry rule:
 *   Any SCHEDULED slot whose startTime is ≤ (now + 10 minutes)
 *   AND currentEnrolled == 0  →  mark as EXPIRED.
 *
 * This prevents ghost empty slots from cluttering the view.
 * Slots with enrolled students are left to the tutor to start/close manually.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SessionLifecycleService {

    private final CourseSlotRepository courseSlotRepository;

    @Scheduled(fixedRate = 60_000)  // every 60 seconds
    @Transactional
    public void autoExpireEmptySlots() {
        LocalDateTime cutoff = LocalDateTime.now().plusMinutes(10);

        List<CourseSlot> candidates = courseSlotRepository
                .findBySessionStatusAndStartTimeBefore("SCHEDULED", cutoff);

        int expiredCount = 0;
        for (CourseSlot slot : candidates) {
            if (slot.getCurrentEnrolled() == 0) {
                slot.setSessionStatus("EXPIRED");
                courseSlotRepository.save(slot);
                expiredCount++;
                log.info("Auto-expired empty slot id={} (startTime={})", slot.getId(), slot.getStartTime());
            }
        }

        if (expiredCount > 0) {
            log.info("SessionLifecycleService: expired {} empty slot(s).", expiredCount);
        }
    }
}
