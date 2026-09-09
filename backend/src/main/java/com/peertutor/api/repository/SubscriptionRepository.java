package com.peertutor.api.repository;

import com.peertutor.api.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByStudentIdAndTutorId(Long studentId, Long tutorId);
    boolean existsByStudentIdAndTutorId(Long studentId, Long tutorId);
    List<Subscription> findByStudentId(Long studentId);
    long countByTutorId(Long tutorId);
}
