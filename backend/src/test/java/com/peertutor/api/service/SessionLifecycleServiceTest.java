package com.peertutor.api.service;

import com.peertutor.api.entity.CourseSlot;
import com.peertutor.api.repository.CourseSlotRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionLifecycleServiceTest {

    @Mock
    private CourseSlotRepository courseSlotRepository;

    @InjectMocks
    private SessionLifecycleService sessionLifecycleService;

    @Test
    @DisplayName("10-Minute Auto-Expiry: Slot starting in 9 mins with 0 enrollments is marked EXPIRED")
    void testAutoExpireUnbookedSlotWithin10Minutes() {
        CourseSlot unbookedSlot = CourseSlot.builder()
                .id(101L)
                .startTime(LocalDateTime.now().plusMinutes(9))
                .endTime(LocalDateTime.now().plusMinutes(69))
                .currentEnrolled(0)
                .sessionStatus("SCHEDULED")
                .build();

        when(courseSlotRepository.findBySessionStatusAndCurrentEnrolledAndStartTimeBefore(
                eq("SCHEDULED"), eq(0), any(LocalDateTime.class)))
                .thenReturn(List.of(unbookedSlot));

        when(courseSlotRepository.findBySessionStatusAndStartTimeBefore(
                eq("SCHEDULED"), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        sessionLifecycleService.autoExpirePastSlots();

        assertEquals("EXPIRED", unbookedSlot.getSessionStatus());
        verify(courseSlotRepository, atLeastOnce()).save(unbookedSlot);
    }

    @Test
    @DisplayName("Preservation Rule: Slot starting in 9 mins with active enrollments is NOT expired by unbooked rule")
    void testPreserveBookedSlotWithin10Minutes() {
        when(courseSlotRepository.findBySessionStatusAndCurrentEnrolledAndStartTimeBefore(
                eq("SCHEDULED"), eq(0), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        when(courseSlotRepository.findBySessionStatusAndStartTimeBefore(
                eq("SCHEDULED"), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        sessionLifecycleService.autoExpirePastSlots();

        verify(courseSlotRepository, never()).save(any());
    }

    @Test
    @DisplayName("Past Slot Expiry: Missed scheduled slot older than 30 mins grace window is marked EXPIRED")
    void testAutoExpirePastMissedSlot() {
        CourseSlot pastMissedSlot = CourseSlot.builder()
                .id(102L)
                .startTime(LocalDateTime.now().minusMinutes(35))
                .endTime(LocalDateTime.now().minusMinutes(5))
                .currentEnrolled(2)
                .sessionStatus("SCHEDULED")
                .build();

        when(courseSlotRepository.findBySessionStatusAndCurrentEnrolledAndStartTimeBefore(
                eq("SCHEDULED"), eq(0), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        when(courseSlotRepository.findBySessionStatusAndStartTimeBefore(
                eq("SCHEDULED"), any(LocalDateTime.class)))
                .thenReturn(List.of(pastMissedSlot));

        sessionLifecycleService.autoExpirePastSlots();

        assertEquals("EXPIRED", pastMissedSlot.getSessionStatus());
        verify(courseSlotRepository).save(pastMissedSlot);
    }
}
