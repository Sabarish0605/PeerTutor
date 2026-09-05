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

    @PostMapping("/student/{studentId}")
    public ResponseEntity<Review> createReview(
            @PathVariable Long studentId,
            @Valid @RequestBody ReviewRequest request
    ) {
        return ResponseEntity.ok(reviewService.createReview(studentId, request));
    }
}