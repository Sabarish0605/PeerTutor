package com.peertutor.api.controller;

import com.peertutor.api.dto.ProfileUpdateRequest;
import com.peertutor.api.entity.User;
import com.peertutor.api.entity.TutorProfile;
import com.peertutor.api.repository.UserRepository;
import com.peertutor.api.repository.TutorProfileRepository;
import com.peertutor.api.repository.CourseRepository;
import com.peertutor.api.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {

    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final CourseRepository courseRepository;
    private final SubscriptionRepository subscriptionRepository;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("userId", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("profileImage", user.getProfileImage());
        profile.put("avatarUrl", user.getProfileImage());
        profile.put("fieldOfStudy", user.getFieldOfStudy());
        profile.put("bio", user.getBio());
        profile.put("portfolioUrl", user.getPortfolioUrl());
        profile.put("repositoryUrl", user.getRepositoryUrl());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(@RequestBody ProfileUpdateRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        // The principal's name is the email of the authenticated user
        String email = principal.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null) {
            user.setName(request.getFullName());
        }
        if (request.getFieldOfStudy() != null) {
            user.setFieldOfStudy(request.getFieldOfStudy());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getAvatarUrl() != null) {
            user.setProfileImage(request.getAvatarUrl());
        }
        if (request.getPortfolioUrl() != null) {
            user.setPortfolioUrl(request.getPortfolioUrl());
        }
        if (request.getRepositoryUrl() != null) {
            user.setRepositoryUrl(request.getRepositoryUrl());
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<Map<String, Object>> getPublicProfile(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("avatarUrl", user.getProfileImage());
        profile.put("profileImage", user.getProfileImage());
        profile.put("fieldOfStudy", user.getFieldOfStudy());
        profile.put("bio", user.getBio());
        profile.put("portfolioUrl", user.getPortfolioUrl());
        profile.put("repositoryUrl", user.getRepositoryUrl());
        
        long subscribersCount = 0;
        double avgRating = 0.0;
        long coursesCount = 0;
        
        TutorProfile tutor = tutorProfileRepository.findByUserId(user.getId()).orElse(null);
        if (tutor != null) {
             subscribersCount = subscriptionRepository.countByTutorId(user.getId());
             avgRating = tutor.getRating() != null ? tutor.getRating() : 0.0;
             coursesCount = courseRepository.countByAuthorId(user.getId());
        }
        
        profile.put("subscribersCount", subscribersCount);
        profile.put("avgRating", avgRating);
        profile.put("coursesCount", coursesCount);
        
        return ResponseEntity.ok(profile);
    }
}
