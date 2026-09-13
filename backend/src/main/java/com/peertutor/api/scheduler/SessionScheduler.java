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
     * Legacy auto-completion helper.
     * Note: Scheduled auto-completion of expired SCHEDULED slots is now handled by
     * EscrowScheduler to protect students from ghost tutors and process refunds.
     */
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
