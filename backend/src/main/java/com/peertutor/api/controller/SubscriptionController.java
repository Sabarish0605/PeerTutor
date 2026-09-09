package com.peertutor.api.controller;

import com.peertutor.api.entity.Subscription;
import com.peertutor.api.entity.Notification;
import com.peertutor.api.entity.User;
import com.peertutor.api.repository.NotificationRepository;
import com.peertutor.api.repository.SubscriptionRepository;
import com.peertutor.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@CrossOrigin
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @PostMapping("/student/{studentId}/tutor/{tutorId}")
    public ResponseEntity<?> toggleSubscription(@PathVariable Long studentId, @PathVariable Long tutorId) {
        Optional<Subscription> existing = subscriptionRepository.findByStudentIdAndTutorId(studentId, tutorId);
        
        if (existing.isPresent()) {
            subscriptionRepository.delete(existing.get());
            return ResponseEntity.ok().body("{\"subscribed\": false}");
        }

        User student = userRepository.findById(studentId).orElseThrow();
        User tutor = userRepository.findById(tutorId).orElseThrow();

        Subscription sub = Subscription.builder()
                .student(student)
                .tutor(tutor)
                .build();
        subscriptionRepository.save(sub);

        Notification notif = Notification.builder()
                .user(tutor)
                .message(student.getName() + " just subscribed to your profile!")
                .isRead(false)
                .build();
        notificationRepository.save(notif);

        return ResponseEntity.ok().body("{\"subscribed\": true}");
    }

    @GetMapping("/check/student/{studentId}/tutor/{tutorId}")
    public ResponseEntity<?> checkSubscription(@PathVariable Long studentId, @PathVariable Long tutorId) {
        boolean exists = subscriptionRepository.existsByStudentIdAndTutorId(studentId, tutorId);
        return ResponseEntity.ok().body("{\"subscribed\": " + exists + "}");
    }
}
