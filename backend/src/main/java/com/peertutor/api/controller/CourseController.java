package com.peertutor.api.controller;

import com.peertutor.api.dto.CourseRequest;
import com.peertutor.api.dto.CourseResponse;
import com.peertutor.api.entity.User;
import com.peertutor.api.repository.UserRepository;
import com.peertutor.api.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final UserRepository userRepository;

    @PostMapping("/user/{userId}")
    public ResponseEntity<CourseResponse> createCourse(
            @PathVariable Long userId,
            @RequestBody CourseRequest request
    ) {
        return ResponseEntity.ok(courseService.createCourse(userId, request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CourseResponse>> getCoursesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(courseService.getCoursesByAuthor(userId));
    }

    // NEW: Public endpoint to get all courses for the Discover page
    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<List<CourseResponse>> getSubscribedCourses(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findByEmail(principal.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(courseService.getSubscribedCourses(user.getId()));
    }


    @PutMapping("/{courseId}/user/{userId}")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long courseId,
            @PathVariable Long userId,
            @RequestBody CourseRequest request
    ) {
        return ResponseEntity.ok(courseService.updateCourse(courseId, userId, request));
    }

    @DeleteMapping("/{courseId}/user/{userId}")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable Long courseId,
            @PathVariable Long userId
    )
    {
        courseService.deleteCourse(courseId, userId);
        return ResponseEntity.noContent().build();
    }
}