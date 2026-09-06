package com.peertutor.api.controller;

import com.peertutor.api.entity.Booking;
import com.peertutor.api.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<?> createBooking(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {

        try {
            Booking booking = bookingService.createBooking(studentId, courseId);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            // Catches the "Already enrolled" or "Batch full" exceptions
            // and packages them into a clean JSON object for React!
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Booking>> getStudentBookings(@PathVariable Long studentId) {
        return ResponseEntity.ok(bookingService.getStudentBookings(studentId));
    }
}