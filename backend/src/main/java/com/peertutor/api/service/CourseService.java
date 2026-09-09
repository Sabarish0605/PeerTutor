package com.peertutor.api.service;

import com.peertutor.api.dto.CourseRequest;
import com.peertutor.api.dto.CourseResponse;
import com.peertutor.api.dto.CourseSlotRequest;
import com.peertutor.api.dto.CourseSlotResponse;
import com.peertutor.api.entity.Course;
import com.peertutor.api.entity.CourseSlot;
import com.peertutor.api.entity.TutorProfile;
import com.peertutor.api.repository.BookingRepository;
import com.peertutor.api.repository.CourseRepository;
import com.peertutor.api.repository.SubscriptionRepository;
import com.peertutor.api.repository.TutorProfileRepository;
import com.peertutor.api.repository.UserRepository;
import com.peertutor.api.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final SubscriptionRepository subscriptionRepository;

    public CourseResponse createCourse(Long userId, CourseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .maxPeers(request.getMaxPeers() != null ? request.getMaxPeers() : 1)
                .meetLink(request.getMeetLink())
                .author(user)
                .categoryName(request.getCategoryName())
                .thumbnailUrl(request.getThumbnailUrl())
                .demoVideoUrl(request.getDemoVideoUrl())
                .build();

        if (request.getSlots() != null) {
            List<CourseSlot> slots = request.getSlots().stream()
                    .map(slotReq -> CourseSlot.builder()
                            .course(course)
                            .slotDateTime(slotReq.getSlotDateTime())
                            .maxSeats(slotReq.getMaxSeats() != null ? slotReq.getMaxSeats() : 1)
                            .currentEnrolled(0)
                            .build())
                    .collect(Collectors.toList());
            course.setSlots(slots);
        }

        Course savedCourse = courseRepository.save(course);
        return mapToResponse(savedCourse);
    }

    public List<CourseResponse> getCoursesByAuthor(Long userId) {
        return courseRepository.findByAuthorId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // NEW: Fetch all courses for the public Marketplace Discover page
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CourseResponse> getSubscribedCourses(Long studentId) {
        List<Long> tutorIds = subscriptionRepository.findByStudentId(studentId).stream()
                .map(sub -> sub.getTutor().getId())
                .collect(Collectors.toList());

        return courseRepository.findByAuthorIdIn(tutorIds).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse updateCourse(Long courseId, Long userId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getAuthor().getId().equals(userId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, 
                    "Unauthorized: You do not own this course"
            );
        }

        if (bookingRepository.countByCourseId(courseId) > 0) {
            throw new IllegalStateException("Cannot edit a course that already has enrolled students.");
        }

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setPrice(request.getPrice());
        course.setMaxPeers(request.getMaxPeers() != null ? request.getMaxPeers() : 1);
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setDemoVideoUrl(request.getDemoVideoUrl());
        course.setMeetLink(request.getMeetLink());
        course.setCategoryName(request.getCategoryName());

        if (request.getSlots() != null) {
            if (course.getSlots() != null) {
                course.getSlots().clear();
            } else {
                course.setSlots(new java.util.ArrayList<>());
            }
            List<CourseSlot> slots = request.getSlots().stream()
                    .map(slotReq -> CourseSlot.builder()
                            .course(course)
                            .slotDateTime(slotReq.getSlotDateTime())
                            .maxSeats(slotReq.getMaxSeats() != null ? slotReq.getMaxSeats() : 1)
                            .currentEnrolled(0)
                            .build())
                    .collect(Collectors.toList());
            course.getSlots().addAll(slots);
        }

        Course updatedCourse = courseRepository.save(course);
        return mapToResponse(updatedCourse);
    }

    public void deleteCourse(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getAuthor().getId().equals(userId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, 
                    "Unauthorized: You do not own this course"
            );
        }

        courseRepository.delete(course);
    }

    private CourseResponse mapToResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .maxPeers(course.getMaxPeers())
                .slots(course.getSlots() != null ? course.getSlots().stream()
                        .map(slot -> CourseSlotResponse.builder()
                                .id(slot.getId())
                                .slotDateTime(slot.getSlotDateTime())
                                .maxSeats(slot.getMaxSeats())
                                .currentEnrolled(slot.getCurrentEnrolled())
                                .build())
                        .collect(Collectors.toList()) : new java.util.ArrayList<>())
                .thumbnailUrl(course.getThumbnailUrl())
                .demoVideoUrl(course.getDemoVideoUrl())
                .categoryName(course.getCategoryName())
                .tutorId(course.getAuthor().getId())
                .tutorName(course.getAuthor().getName())
                .authorAvatar(course.getAuthor().getProfileImage())
                .meetLink(course.getMeetLink())
                .enrollmentCount(bookingRepository.countByCourseId(course.getId()))
                .build();
    }
}