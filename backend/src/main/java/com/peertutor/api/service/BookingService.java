package com.peertutor.api.service;

import com.peertutor.api.entity.Booking;
import com.peertutor.api.entity.Course;
import com.peertutor.api.entity.CourseSlot;
import com.peertutor.api.entity.User;
import com.peertutor.api.repository.BookingRepository;
import com.peertutor.api.repository.CourseRepository;
import com.peertutor.api.repository.CourseSlotRepository;
import com.peertutor.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CourseSlotRepository courseSlotRepository;

    @Transactional
    public Booking createBooking(Long studentId, Long courseId, Long slotId) {

        // 1. Fetch the Student and the Course
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // 2. Fetch the Slot with Pessimistic Write Lock (resolves race condition on last seat)
        CourseSlot slot = courseSlotRepository.findByIdWithLock(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
                
        if (!slot.getCourse().getId().equals(course.getId())) {
            throw new RuntimeException("Slot does not belong to this course");
        }

        // 3. Guardrail: Prevent double-booking for the exact same slot
        if (bookingRepository.existsByStudentIdAndCourseIdAndSlotId(studentId, courseId, slotId)) {
            throw new RuntimeException("You are already enrolled in this slot!");
        }

        // 4. Guardrail: Check seat capacity
        if (slot.getCurrentEnrolled() >= slot.getMaxSeats()) {
            throw new RuntimeException("Sorry, this slot is completely full!");
        }

        // 5. Increment capacity
        slot.setCurrentEnrolled(slot.getCurrentEnrolled() + 1);
        courseSlotRepository.save(slot);

        // 6. Create the Enrollment
        Booking booking = Booking.builder()
                .student(student)
                .course(course)
                .slot(slot)
                .status("ACTIVE")
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getStudentBookings(Long studentId) {
        return bookingRepository.findByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public List<Booking> getCourseBookings(Long courseId) {
        return bookingRepository.findByCourseId(courseId);
    }
}