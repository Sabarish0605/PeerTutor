package com.peertutor.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore; // <--- Added import
import java.util.List;

@Entity
@Table(name = "tutor_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TutorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 1000)
    private String experience;

    @Column(nullable = false)
    private Double price; // Price per session

    private String teachingLevel; // e.g., Beginner, Intermediate, Advanced

    @Column(name = "upi_id")
    private String upiId;

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer completedSessions = 0;

    @Builder.Default
    private Double reputationScore = 0.0;

    // ==========================================
    // NEW FOR MARKETPLACE (V3.0)
    // One Tutor can create multiple custom courses
    // ==========================================
    @JsonIgnore // <--- Added to prevent infinite JSON recursion
    @OneToMany(mappedBy = "tutor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Course> courses;
}