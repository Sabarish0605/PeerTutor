package com.peertutor.api.controller;

import com.peertutor.api.entity.Course;
import com.peertutor.api.entity.CourseSlot;
import com.peertutor.api.entity.User;
import com.peertutor.api.repository.CourseSlotRepository;
import com.peertutor.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SlotControllerTest {

    @Mock
    private CourseSlotRepository courseSlotRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SlotController slotController;

    private User tutorUser;
    private User otherUser;
    private Course course;
    private CourseSlot slot;
    private Principal principal;

    @BeforeEach
    void setUp() {
        tutorUser = User.builder().id(1L).email("tutor@test.com").name("Tutor").build();
        otherUser = User.builder().id(2L).email("other@test.com").name("Other").build();

        course = Course.builder().id(10L).author(tutorUser).title("Test Course").build();

        slot = CourseSlot.builder()
                .id(100L)
                .course(course)
                .startTime(LocalDateTime.now().plusMinutes(10)) // within 15 min!
                .endTime(LocalDateTime.now().plusMinutes(70))
                .sessionStatus("SCHEDULED")
                .build();

        principal = () -> "tutor@test.com";
    }

    @Test
    @DisplayName("Manual Controls: Tutor starts session within 15 min window -> Status is LIVE")
    void testStartSessionWithin15Minutes() {
        when(courseSlotRepository.findById(100L)).thenReturn(Optional.of(slot));
        when(userRepository.findByEmail("tutor@test.com")).thenReturn(Optional.of(tutorUser));

        ResponseEntity<Map<String, String>> response = slotController.startSession(100L, principal);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("LIVE", response.getBody().get("status"));
        assertEquals("LIVE", slot.getSessionStatus());
        verify(courseSlotRepository).save(slot);
    }

    @Test
    @DisplayName("Manual Controls: Starting session earlier than 15 mins before start throws 400 Bad Request")
    void testStartSessionTooEarlyFails() {
        slot.setStartTime(LocalDateTime.now().plusMinutes(45)); // 45 min away!
        when(courseSlotRepository.findById(100L)).thenReturn(Optional.of(slot));
        when(userRepository.findByEmail("tutor@test.com")).thenReturn(Optional.of(tutorUser));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> slotController.startSession(100L, principal));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("within 15 minutes"));
        verify(courseSlotRepository, never()).save(any());
    }

    @Test
    @DisplayName("Manual Controls: Tutor closes a LIVE session -> Status is CLOSED")
    void testCloseLiveSession() {
        slot.setSessionStatus("LIVE");
        when(courseSlotRepository.findById(100L)).thenReturn(Optional.of(slot));
        when(userRepository.findByEmail("tutor@test.com")).thenReturn(Optional.of(tutorUser));

        ResponseEntity<Map<String, String>> response = slotController.closeSession(100L, principal);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("CLOSED", response.getBody().get("status"));
        assertEquals("CLOSED", slot.getSessionStatus());
        verify(courseSlotRepository).save(slot);
    }

    @Test
    @DisplayName("Manual Controls: Closing a non-LIVE session throws 400 Bad Request")
    void testCloseNonLiveSessionFails() {
        slot.setSessionStatus("SCHEDULED");
        when(courseSlotRepository.findById(100L)).thenReturn(Optional.of(slot));
        when(userRepository.findByEmail("tutor@test.com")).thenReturn(Optional.of(tutorUser));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> slotController.closeSession(100L, principal));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("only be closed from LIVE status"));
    }

    @Test
    @DisplayName("Ownership Gate: Unauthorized user cannot start another tutor's session (403 Forbidden)")
    void testUnauthorizedUserCannotStartSession() {
        when(courseSlotRepository.findById(100L)).thenReturn(Optional.of(slot));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherUser));

        Principal otherPrincipal = () -> "other@test.com";
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> slotController.startSession(100L, otherPrincipal));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }
}
