package com.peertutor.api.controller;

import com.peertutor.api.entity.Booking;
import com.peertutor.api.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/student/{studentId}/course/{courseId}/slot/{slotId}")
    public ResponseEntity<?> createBooking(
            @PathVariable Long studentId,
            @PathVariable Long courseId,
            @PathVariable Long slotId) {

        try {
            Booking booking = bookingService.createBooking(studentId, courseId, slotId);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            // Catches the "Already enrolled" or "Batch full" exceptions
            // and packages them into a clean JSON object for React!
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentBookings(@PathVariable Long studentId) {
        List<Map<String, Object>> response = bookingService.getStudentBookings(studentId).stream().map(booking -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", booking.getId());
            map.put("status", booking.getStatus());
            map.put("bookingDate", booking.getBookingDate());

            if (booking.getSlot() != null) {
                Map<String, Object> slotMap = new HashMap<>();
                slotMap.put("id", booking.getSlot().getId());
                slotMap.put("slotDateTime", booking.getSlot().getSlotDateTime());
                map.put("slot", slotMap);
            }
            
            if (booking.getCourse() != null) {
                Map<String, Object> courseMap = new HashMap<>();
                courseMap.put("id", booking.getCourse().getId());
                courseMap.put("title", booking.getCourse().getTitle());
                courseMap.put("thumbnailUrl", booking.getCourse().getThumbnailUrl());
                courseMap.put("demoVideoUrl", booking.getCourse().getDemoVideoUrl());
                courseMap.put("meetLink", booking.getCourse().getMeetLink());
                if (booking.getCourse().getAuthor() != null) {
                    courseMap.put("tutorId", booking.getCourse().getAuthor().getId());
                    courseMap.put("tutorName", booking.getCourse().getAuthor().getName());
                    courseMap.put("authorAvatar", booking.getCourse().getAuthor().getProfileImage());
                }
                map.put("course", courseMap);
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseBookings(@PathVariable Long courseId) {
        List<Map<String, Object>> safeRoster = bookingService.getCourseBookings(courseId).stream().map(booking -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", booking.getId());
            map.put("status", booking.getStatus());
            map.put("bookingDate", booking.getBookingDate());

            Map<String, String> studentData = new HashMap<>();
            studentData.put("name", booking.getStudent().getName());
            studentData.put("email", booking.getStudent().getEmail());
            map.put("student", studentData);

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(safeRoster);
    }
}