package com.peertutor.api.service;

import com.peertutor.api.dto.TutorProfileRequest;
import com.peertutor.api.entity.Role;
import com.peertutor.api.entity.TutorProfile;
import com.peertutor.api.entity.User;
import com.peertutor.api.repository.TutorProfileRepository;
import com.peertutor.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TutorProfileService {

    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;

    public TutorProfile createProfile(Long userId, TutorProfileRequest request) {
        // 1. Find the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. UPGRADE THE ROLE TO TUTOR
        user.setRole(Role.TUTOR);
        userRepository.save(user);

        // 3. Check if they ALREADY have a profile
        var existingProfileOpt = tutorProfileRepository.findByUserId(userId);

        if (existingProfileOpt.isPresent()) {
            // If they already have one, just update the details and return it!
            TutorProfile existingProfile = existingProfileOpt.get();
            existingProfile.setExperience(request.getExperience());
            existingProfile.setUpiId(request.getUpiId());
            return tutorProfileRepository.save(existingProfile);
        }

        // 4. Otherwise, create a brand new profile
        TutorProfile profile = TutorProfile.builder()
                .user(user)
                .experience(request.getExperience())
                .upiId(request.getUpiId())
                // Safe defaults for older database columns
                .price(0.0)
                .teachingLevel("Beginner")
                .build();

        return tutorProfileRepository.save(profile);
    }
}