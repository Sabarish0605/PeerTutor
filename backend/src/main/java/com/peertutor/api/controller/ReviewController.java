package com.peertutor.api.controller;

import com.peertutor.api.dto.ReviewRequest;
import com.peertutor.api.entity.Review;
import com.peertutor.api.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // UPGRADED: Now requires the bookingId in the URL to link the review properly
    @PostMapping("/student/{studentId}/booking/{bookingId}")
    public ResponseEntity<Review> submitReview(
            @PathVariable Long studentId,
            @PathVariable Long bookingId,
            @Valid @RequestBody ReviewRequest request
    ) {
        // Calls the correct method name that we set up in ReviewService
        return ResponseEntity.ok(reviewService.submitReview(studentId, bookingId, request));
    }
}