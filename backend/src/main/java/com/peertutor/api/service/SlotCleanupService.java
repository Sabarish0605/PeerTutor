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

@Service
@RequiredArgsConstructor
@Slf4j
public class SlotCleanupService {

    private final CourseSlotRepository courseSlotRepository;

    @Scheduled(cron = "0 0 * * * *") // Runs every hour
    @Transactional
    public void cleanupExpiredSlots() {
        log.info("Running expired slot cleanup job...");
        LocalDateTime now = LocalDateTime.now();
        List<CourseSlot> expiredSlots = courseSlotRepository.findBySlotDateTimeBefore(now);
        
        if (!expiredSlots.isEmpty()) {
            log.info("Found {} expired slots. Deleting...", expiredSlots.size());
            courseSlotRepository.deleteAll(expiredSlots);
        } else {
            log.info("No expired slots found.");
        }
    }
}
