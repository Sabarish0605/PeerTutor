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
import com.peertutor.api.repository.CourseSlotRepository;
import com.peertutor.api.repository.SubscriptionRepository;
import com.peertutor.api.repository.TutorProfileRepository;
import com.peertutor.api.repository.UserRepository;
import com.peertutor.api.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CourseSlotRepository courseSlotRepository;

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
                    .map(slotReq -> buildSlot(course, slotReq))
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

    // Fetch all courses for the public Marketplace Discover page (no student context)
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Fetch all courses for the Discover page, enriched with enrolledSlotId
     * so the frontend can render an "Already Enrolled" badge per course.
     *
     * @param studentId the currently logged-in student's user id
     */
    public List<CourseResponse> getAllCoursesForStudent(Long studentId) {
        return courseRepository.findAll().stream()
                .map(course -> mapToResponseForStudent(course, studentId))
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

    /**
     * Granular course update with per-slot locking.
     *
     * Rules:
     *  - Global fields (description, thumbnailUrl, demoVideoUrl, meetLink, title, category, price, maxPeers)
     *    are ALWAYS updatable.
     *  - For each slot in the request:
     *    - If slot.id == null  → create a new slot
     *    - If slot.id != null AND currentEnrolled == 0 → full edit allowed (time, maxSeats)
     *    - If slot.id != null AND currentEnrolled > 0  → LOCKED: startTime, endTime, maxSeats cannot change
     */
    @Transactional
    public CourseResponse updateCourse(Long courseId, Long userId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!course.getAuthor().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized: You do not own this course");
        }

        // ── Check price modification when enrolled students exist ────────────
        long totalEnrolled = bookingRepository.countByCourseId(courseId);
        if (request.getPrice() != null && !Objects.equals(course.getPrice(), request.getPrice())) {
            if (totalEnrolled > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Cannot modify course price because " + totalEnrolled + " student(s) have already enrolled in this course.");
            }
            course.setPrice(request.getPrice());
        }

        // ── Always-editable global fields ────────────────────────────────────
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setMaxPeers(request.getMaxPeers() != null ? request.getMaxPeers() : 1);
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setDemoVideoUrl(request.getDemoVideoUrl());
        course.setMeetLink(request.getMeetLink());
        course.setCategoryName(request.getCategoryName());

        // ── Per-slot granular update ─────────────────────────────────────────
        if (request.getSlots() != null) {
            // Build a quick lookup of existing slots by their ID
            Map<Long, CourseSlot> existingById = course.getSlots() == null
                    ? Map.of()
                    : course.getSlots().stream()
                        .filter(s -> s.getId() != null)
                        .collect(Collectors.toMap(CourseSlot::getId, s -> s));

            // Track which existing slot IDs the request is keeping
            List<Long> keptSlotIds = new ArrayList<>();

            List<CourseSlot> updatedSlots = new ArrayList<>();

            for (CourseSlotRequest slotReq : request.getSlots()) {
                if (slotReq.getId() == null) {
                    // ── NEW slot: create it
                    updatedSlots.add(buildSlot(course, slotReq));

                } else {
                    // ── EXISTING slot: apply granular lock logic
                    CourseSlot existing = existingById.get(slotReq.getId());
                    if (existing == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Slot id=" + slotReq.getId() + " does not belong to this course.");
                    }

                    keptSlotIds.add(existing.getId());

                    if (existing.getCurrentEnrolled() > 0) {
                        // 🔒 LOCKED: students are enrolled — only maxSeats may be increased, not time
                        boolean timeChanged = !Objects.equals(existing.getStartTime(), slotReq.getStartTime())
                                || !Objects.equals(existing.getEndTime(), slotReq.getEndTime());
                        if (timeChanged) {
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                    "Cannot change the date/time of slot id=" + existing.getId()
                                    + " because " + existing.getCurrentEnrolled() + " student(s) are enrolled.");
                        }
                        // Allow maxSeats to be increased (never reduced below currentEnrolled)
                        if (slotReq.getMaxSeats() != null && slotReq.getMaxSeats() < existing.getCurrentEnrolled()) {
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                    "Cannot reduce max seats below the number of enrolled students ("
                                    + existing.getCurrentEnrolled() + ").");
                        }
                        if (slotReq.getMaxSeats() != null) {
                            existing.setMaxSeats(slotReq.getMaxSeats());
                        }
                    } else {
                        // ✅ UNLOCKED: full edit allowed
                        if (slotReq.getStartTime() != null) existing.setStartTime(slotReq.getStartTime());
                        if (slotReq.getEndTime() != null)   existing.setEndTime(slotReq.getEndTime());
                        if (slotReq.getMaxSeats() != null)  existing.setMaxSeats(slotReq.getMaxSeats());
                    }
                    updatedSlots.add(existing);
                }
            }

            // Slots present in DB but NOT in request → delete (only if no enrollments)
            if (course.getSlots() != null) {
                for (CourseSlot old : course.getSlots()) {
                    if (old.getId() != null && !keptSlotIds.contains(old.getId())) {
                        // Not in request = tutor wants to delete it
                        if (old.getCurrentEnrolled() > 0) {
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                    "Cannot delete slot id=" + old.getId()
                                    + " because " + old.getCurrentEnrolled() + " student(s) are enrolled.");
                        }
                        // Delete slot — will cascade via orphanRemoval on Course.slots
                    } else if (old.getId() == null || keptSlotIds.contains(old.getId())) {
                        // Already handled above
                    }
                }
            }

            // Replace slot collection (Hibernate handles orphan deletion)
            if (course.getSlots() == null) {
                course.setSlots(updatedSlots);
            } else {
                course.getSlots().clear();
                course.getSlots().addAll(updatedSlots);
            }
        }

        Course updatedCourse = courseRepository.save(course);
        return mapToResponse(updatedCourse);
    }

    public void deleteCourse(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!course.getAuthor().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized: You do not own this course");
        }

        long activeBookings = bookingRepository.countByCourseId(courseId);
        if (activeBookings > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot delete course: There are " + activeBookings + " active student booking(s) for this course. Please cancel or refund sessions first.");
        }

        courseRepository.delete(course);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private CourseSlot buildSlot(Course course, CourseSlotRequest slotReq) {
        return CourseSlot.builder()
                .course(course)
                .startTime(slotReq.getStartTime())
                .endTime(slotReq.getEndTime())
                .maxSeats(slotReq.getMaxSeats() != null ? slotReq.getMaxSeats() : 1)
                .currentEnrolled(0)
                .sessionStatus("SCHEDULED")
                .build();
    }

    // ── Private response mappers ─────────────────────────────────────────────

    /** Maps a course to its response DTO with no student enrollment context. */
    private CourseResponse mapToResponse(Course course) {
        return buildCourseResponse(course, null);
    }

    /** Maps a course to its response DTO, populating enrolledSlotId for the given student. */
    private CourseResponse mapToResponseForStudent(Course course, Long studentId) {
        Long enrolledSlotId = null;
        if (studentId != null) {
            Optional<Long> slotId = bookingRepository.findEnrolledSlotId(studentId, course.getId());
            enrolledSlotId = slotId.orElse(null);
        }
        return buildCourseResponse(course, enrolledSlotId);
    }

    private CourseResponse buildCourseResponse(Course course, Long enrolledSlotId) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .maxPeers(course.getMaxPeers())
                .slots(course.getSlots() != null ? course.getSlots().stream()
                        .map(slot -> CourseSlotResponse.builder()
                                .id(slot.getId())
                                .startTime(slot.getStartTime())
                                .endTime(slot.getEndTime())
                                .maxSeats(slot.getMaxSeats())
                                .currentEnrolled(slot.getCurrentEnrolled())
                                .sessionStatus(slot.getSessionStatus())
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
                .enrolledSlotId(enrolledSlotId)
                .build();
    }
}