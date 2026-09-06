package com.peertutor.api.controller;

import com.peertutor.api.dto.TutorProfileRequest;
import com.peertutor.api.service.TutorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tutors")
@RequiredArgsConstructor
public class TutorProfileController {

    private final TutorProfileService tutorProfileService;

    @PostMapping("/profile/{userId}")
    public ResponseEntity<?> createProfile(
            @PathVariable Long userId,
            @RequestBody TutorProfileRequest request
    ) {
        return ResponseEntity.ok(tutorProfileService.createProfile(userId, request));
    }
}