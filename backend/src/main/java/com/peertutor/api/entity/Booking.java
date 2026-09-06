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
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The student who is enrolling
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    // The specific course cohort they are joining
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // Track when they purchased/booked the seat
    @Column(name = "booking_date", nullable = false, updatable = false)
    private LocalDateTime bookingDate;

    // e.g., "ACTIVE", "CANCELLED", "COMPLETED"
    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";

    @PrePersist
    protected void onCreate() {
        bookingDate = LocalDateTime.now();
    }
}