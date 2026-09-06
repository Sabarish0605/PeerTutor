package com.peertutor.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Double price;

    // Maximum number of peers allowed per session batch
    @Column(nullable = false)
    private Integer maxPeers;

    // The specific day of the week the batch runs
    @Column(nullable = false)
    private String scheduleDay;

    // The time the session starts (stored in standard format like "14:30")
    @Column(nullable = false)
    private String scheduleTime;

    @Column(nullable = false)
    private String scheduleEndTime;

    // Increased character limit to avoid URL truncation errors
    @Column(length = 2000)
    private String thumbnailUrl;

    @Column(length = 2000)
    private String demoVideoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_profile_id", nullable = false)
    private TutorProfile tutor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}