package com.peertutor.api.controller;

import com.peertutor.api.dto.BookingRequest;
import com.peertutor.api.entity.Booking;
import com.peertutor.api.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/student/{studentId}")
    public ResponseEntity<Booking> createBooking(
            @PathVariable Long studentId,
            @Valid @RequestBody BookingRequest request
    ) {
        return ResponseEntity.ok(bookingService.createBooking(studentId, request));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Booking>> getStudentBookings(@PathVariable Long studentId) {
        return ResponseEntity.ok(bookingService.getStudentBookings(studentId));
    }
}