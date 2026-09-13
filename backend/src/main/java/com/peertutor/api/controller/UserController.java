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

import com.peertutor.api.dto.PasswordChangeRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

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
    private final PasswordEncoder passwordEncoder;

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
        profile.put("fullName", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("profileImage", user.getProfileImage());
        profile.put("avatarUrl", user.getProfileImage());
        profile.put("fieldOfStudy", user.getFieldOfStudy());
        profile.put("bio", user.getBio());
        profile.put("portfolioUrl", user.getPortfolioUrl());
        profile.put("repositoryUrl", user.getRepositoryUrl());
        profile.put("timezone", user.getTimezone() != null ? user.getTimezone() : "Asia/Kolkata (IST, UTC+5:30)");
        profile.put("timeFormat", user.getTimeFormat() != null ? user.getTimeFormat() : "12h");
        profile.put("emailNotifs60m", user.getEmailNotifs60m() != null ? user.getEmailNotifs60m() : true);
        profile.put("emailNotifsNewCourses", user.getEmailNotifsNewCourses() != null ? user.getEmailNotifsNewCourses() : true);
        profile.put("emailNotifsSecurity", user.getEmailNotifsSecurity() != null ? user.getEmailNotifsSecurity() : true);
        profile.put("payoutUpi", user.getPayoutUpi() != null ? user.getPayoutUpi() : "");
        profile.put("payoutBank", user.getPayoutBank() != null ? user.getPayoutBank() : "");
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(@RequestBody ProfileUpdateRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

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
        if (request.getTimezone() != null) {
            user.setTimezone(request.getTimezone());
        }
        if (request.getTimeFormat() != null) {
            user.setTimeFormat(request.getTimeFormat());
        }
        if (request.getEmailNotifs60m() != null) {
            user.setEmailNotifs60m(request.getEmailNotifs60m());
        }
        if (request.getEmailNotifsNewCourses() != null) {
            user.setEmailNotifsNewCourses(request.getEmailNotifsNewCourses());
        }
        if (request.getEmailNotifsSecurity() != null) {
            user.setEmailNotifsSecurity(request.getEmailNotifsSecurity());
        }
        if (request.getPayoutUpi() != null) {
            user.setPayoutUpi(request.getPayoutUpi());
        }
        if (request.getPayoutBank() != null) {
            user.setPayoutBank(request.getPayoutBank());
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody PasswordChangeRequest request,
            Principal principal
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password does not match.");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 6 characters long.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password and confirmation do not match.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully!"));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @RequestBody Map<String, String> body,
            Principal principal
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String password = body.get("password");
        if (password == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect password. Account deletion aborted.");
        }

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "Account successfully deleted."));
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
