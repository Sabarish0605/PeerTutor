package com.peertutor.api.repository;

import com.peertutor.api.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    // Custom method to easily find all courses taught by a specific tutor
    List<Course> findByTutorId(Long tutorId);

    // Custom method to filter courses by category (subject) for the Discover page
    List<Course> findBySubjectId(Long subjectId);

    // Custom method to search courses by title keyword (for the search bar!)
    List<Course> findByTitleContainingIgnoreCase(String keyword);
}