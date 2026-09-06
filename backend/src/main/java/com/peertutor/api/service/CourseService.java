package com.peertutor.api.service;

import com.peertutor.api.dto.CourseRequest;
import com.peertutor.api.dto.CourseResponse;
import com.peertutor.api.entity.Course;
import com.peertutor.api.entity.Subject;
import com.peertutor.api.entity.TutorProfile;
import com.peertutor.api.repository.CourseRepository;
import com.peertutor.api.repository.SubjectRepository;
import com.peertutor.api.repository.TutorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final SubjectRepository subjectRepository;

    public CourseResponse createCourse(Long userId, CourseRequest request) {
        TutorProfile tutor = tutorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Tutor profile not found. Please complete profile setup first."));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .maxPeers(request.getMaxPeers() != null ? request.getMaxPeers() : 1)
                .scheduleDay(request.getScheduleDay())
                .scheduleTime(request.getScheduleTime())
                .scheduleEndTime(request.getScheduleEndTime())
                .thumbnailUrl(request.getThumbnailUrl())
                .demoVideoUrl(request.getDemoVideoUrl())
                .tutor(tutor)
                .subject(subject)
                .build();

        Course savedCourse = courseRepository.save(course);
        return mapToResponse(savedCourse);
    }

    public List<CourseResponse> getCoursesByTutor(Long userId) {
        TutorProfile tutor = tutorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
        return courseRepository.findByTutorId(tutor.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // NEW: Fetch all courses for the public Marketplace Discover page
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteCourse(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getTutor().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You do not own this course");
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
                .scheduleDay(course.getScheduleDay())
                .scheduleTime(course.getScheduleTime())
                .scheduleEndTime(course.getScheduleEndTime())
                .thumbnailUrl(course.getThumbnailUrl())
                .demoVideoUrl(course.getDemoVideoUrl())
                .categoryName(course.getSubject().getName())
                .tutorName(course.getTutor().getUser().getName())
                .build();
    }
}