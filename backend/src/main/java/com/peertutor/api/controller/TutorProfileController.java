package com.peertutor.api.controller;

import com.peertutor.api.dto.TutorProfileRequest;
import com.peertutor.api.dto.OnboardTutorRequest;
import com.peertutor.api.dto.AuthResponse;
import com.peertutor.api.entity.User;
import com.peertutor.api.service.TutorProfileService;
import com.peertutor.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tutors")
@RequiredArgsConstructor
public class TutorProfileController {

    private final TutorProfileService tutorProfileService;
    private final JwtService jwtService;

    @PostMapping("/profile/{userId}")
    public ResponseEntity<?> createProfile(
            @PathVariable Long userId,
            @RequestBody TutorProfileRequest request
    ) {
        return ResponseEntity.ok(tutorProfileService.createProfile(userId, request));
    }

    @PostMapping("/onboard")
    public ResponseEntity<AuthResponse> onboardTutor(
            @AuthenticationPrincipal User currentUser,
            @RequestBody OnboardTutorRequest request
    ) {
        User updatedUser = tutorProfileService.onboardTutor(currentUser.getId(), request);
        String jwtToken = jwtService.generateToken(updatedUser);
        
        AuthResponse response = AuthResponse.builder()
                .token(jwtToken)
                .userId(updatedUser.getId())
                .name(updatedUser.getName())
                .email(updatedUser.getEmail())
                .role(updatedUser.getRole())
                .build();
                
        return ResponseEntity.ok(response);
    }
}