package com.peertutor.api.scheduler;

import com.peertutor.api.entity.CourseSlot;
import com.peertutor.api.repository.CourseSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * SessionScheduler — handles auto-completion of course sessions that have ended.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SessionScheduler {

    private final CourseSlotRepository courseSlotRepository;

    /**
     * Auto-completes course sessions whose end time has passed.
     * Runs at the top of every hour (0 0 * * * *).
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void autoCompletePastSessionsHourly() {
        autoCompletePastSessions();
    }

    /**
     * Also runs on a 60-second fixed rate to ensure sessions are marked
     * COMPLETED promptly after their end time without waiting up to 60 minutes.
     */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void autoCompletePastSessions() {
        LocalDateTime now = LocalDateTime.now();
        List<CourseSlot> pastScheduledSlots = courseSlotRepository
                .findBySessionStatusAndEndTimeBefore("SCHEDULED", now);

        if (!pastScheduledSlots.isEmpty()) {
            for (CourseSlot slot : pastScheduledSlots) {
                slot.setSessionStatus("COMPLETED");
                courseSlotRepository.save(slot);
                log.info("Auto-completed past session slot id={} (endTime={}, enrolled={})",
                        slot.getId(), slot.getEndTime(), slot.getCurrentEnrolled());
            }
            log.info("SessionScheduler: auto-completed {} past session slot(s).", pastScheduledSlots.size());
        }
    }
}
