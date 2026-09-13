package com.peertutor.api.controller;

import com.peertutor.api.dto.CourseRequest;
import com.peertutor.api.entity.User;
import com.peertutor.api.repository.UserRepository;
import com.peertutor.api.service.CourseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseControllerSecurityTest {

    @Mock
    private CourseService courseService;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CourseController courseController;

    private User userA;
    private User userB;

    @BeforeEach
    void setUp() {
        userA = User.builder().id(1L).name("User A").email("usera@test.com").build();
        userB = User.builder().id(2L).name("User B").email("userb@test.com").build();
    }

    @Test
    @DisplayName("Security: User A cannot update User B's course (403 Forbidden)")
    void testUserACannotUpdateUserBCourse() {
        // User A is logged in with JWT
        Principal principalA = () -> "usera@test.com";
        when(userRepository.findByEmail("usera@test.com")).thenReturn(Optional.of(userA));

        CourseRequest request = CourseRequest.builder().title("Hijacked Course").build();

        // User A tries to send update for User B's course (userId = 2)
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> courseController.updateCourse(100L, 2L, request, principalA));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertTrue(ex.getReason().contains("You cannot modify courses belonging to another user"));
        verify(courseService, never()).updateCourse(any(), any(), any());
    }

    @Test
    @DisplayName("Security: User A cannot delete User B's course (403 Forbidden)")
    void testUserACannotDeleteUserBCourse() {
        Principal principalA = () -> "usera@test.com";
        when(userRepository.findByEmail("usera@test.com")).thenReturn(Optional.of(userA));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> courseController.deleteCourse(100L, 2L, principalA));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(courseService, never()).deleteCourse(any(), any());
    }

    @Test
    @DisplayName("Security: Unauthenticated request throws 401 Unauthorized")
    void testUnauthenticatedRequestFails() {
        CourseRequest request = CourseRequest.builder().title("Unauthenticated Course").build();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> courseController.createCourse(1L, request, null));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }
}
