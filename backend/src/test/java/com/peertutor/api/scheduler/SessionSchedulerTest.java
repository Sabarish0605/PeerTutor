package com.peertutor.api.scheduler;

import com.peertutor.api.entity.CourseSlot;
import com.peertutor.api.repository.CourseSlotRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionSchedulerTest {

    @Mock
    private CourseSlotRepository courseSlotRepository;

    @InjectMocks
    private SessionScheduler sessionScheduler;

    @Test
    @DisplayName("Auto-Complete: Past scheduled slots with endTime in the past are updated to COMPLETED")
    void testAutoCompletePastSessions() {
        CourseSlot pastSlot = CourseSlot.builder()
                .id(201L)
                .startTime(LocalDateTime.now().minusHours(2))
                .endTime(LocalDateTime.now().minusHours(1))
                .sessionStatus("SCHEDULED")
                .currentEnrolled(3)
                .build();

        when(courseSlotRepository.findBySessionStatusAndEndTimeBefore(eq("SCHEDULED"), any(LocalDateTime.class)))
                .thenReturn(List.of(pastSlot));

        sessionScheduler.autoCompletePastSessions();

        assertEquals("COMPLETED", pastSlot.getSessionStatus());
        verify(courseSlotRepository, times(1)).save(pastSlot);
    }

    @Test
    @DisplayName("No-Op: When no scheduled slots have passed endTime, repository save is not called")
    void testAutoCompleteNoPastSessions() {
        when(courseSlotRepository.findBySessionStatusAndEndTimeBefore(eq("SCHEDULED"), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        sessionScheduler.autoCompletePastSessions();

        verify(courseSlotRepository, never()).save(any());
    }
}
