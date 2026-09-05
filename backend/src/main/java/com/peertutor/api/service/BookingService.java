package com.peertutor.api.service;

import com.peertutor.api.dto.BookingRequest;
import com.peertutor.api.entity.*;
import com.peertutor.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final SubjectRepository subjectRepository;

    @Transactional
    public Booking createBooking(Long studentId, BookingRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        TutorProfile tutor = tutorProfileRepository.findById(request.getTutorId())
                .orElseThrow(() -> new RuntimeException("Tutor not found"));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        Availability slot = availabilityRepository.findById(request.getAvailabilityId())
                .orElseThrow(() -> new RuntimeException("Availability slot not found"));

        // Guardrail against double booking
        if (slot.isBooked()) {
            throw new RuntimeException("This slot is already booked!");
        }

        // Mark the slot as booked
        slot.setBooked(true);
        availabilityRepository.save(slot);

        // Create the booking
        Booking booking = Booking.builder()
                .student(student)
                .tutor(tutor)
                .subject(subject)
                .sessionDate(request.getSessionDate())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .status(BookingStatus.BOOKED)
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getStudentBookings(Long studentId) {
        return bookingRepository.findByStudentId(studentId);
    }
}