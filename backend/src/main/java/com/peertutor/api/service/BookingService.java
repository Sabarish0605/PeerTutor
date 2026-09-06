package com.peertutor.api.service;

import com.peertutor.api.entity.Booking;
import com.peertutor.api.entity.Course;
import com.peertutor.api.entity.User;
import com.peertutor.api.repository.BookingRepository;
import com.peertutor.api.repository.CourseRepository;
import com.peertutor.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public Booking createBooking(Long studentId, Long courseId) {

        // 1. Fetch the Student and the Course
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // 2. Guardrail: Prevent double-booking
        if (bookingRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new RuntimeException("You are already enrolled in this course!");
        }

        // 3. Guardrail: Check seat capacity
        long currentEnrollments = bookingRepository.countByCourseId(courseId);
        if (currentEnrollments >= course.getMaxPeers()) {
            throw new RuntimeException("Sorry, this batch is completely full!");
        }

        // 4. Create the Enrollment
        Booking booking = Booking.builder()
                .student(student)
                .course(course)
                .status("ACTIVE")
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getStudentBookings(Long studentId) {
        return bookingRepository.findByStudentId(studentId);
    }
}