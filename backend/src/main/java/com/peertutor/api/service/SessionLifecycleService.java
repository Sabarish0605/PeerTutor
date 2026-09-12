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
 * SessionLifecycleService — runs every 60 seconds.
 *
 * Aggressive auto-expiry rule:
 *   Any SCHEDULED slot whose startTime is ≤ (now − 30 minutes)
 *   is marked EXPIRED, regardless of enrollment count.
 *
 * The 30-minute grace window allows a tutor who is running late to still
 * manually start the session. Past that window, the slot is considered a
 * "ghost" and is expired to prevent it from appearing as "Starting Soon"
 * on the student discover page.
 *
 * Slots that were manually transitioned to LIVE or CLOSED by the tutor
 * are never touched by this scheduler.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SessionLifecycleService {

    private final CourseSlotRepository courseSlotRepository;

    /** Grace period after startTime before a missed session is auto-expired. */
    private static final int GRACE_MINUTES = 30;

    @Scheduled(fixedRate = 60_000)  // every 60 seconds
    @Transactional
    public void autoExpirePastSlots() {
        // Cutoff: any slot that started more than GRACE_MINUTES ago
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(GRACE_MINUTES);

        List<CourseSlot> candidates = courseSlotRepository
                .findBySessionStatusAndStartTimeBefore("SCHEDULED", cutoff);

        int expiredCount = 0;
        for (CourseSlot slot : candidates) {
            slot.setSessionStatus("EXPIRED");
            courseSlotRepository.save(slot);
            expiredCount++;
            log.info("Auto-expired past slot id={} (startTime={}, enrolled={})",
                    slot.getId(), slot.getStartTime(), slot.getCurrentEnrolled());
        }

        if (expiredCount > 0) {
            log.info("SessionLifecycleService: auto-expired {} past slot(s).", expiredCount);
        }
    }
}

