package com.peertutor.api.repository;

import com.peertutor.api.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByTutorIdAndIsBookedFalse(Long tutorId);
}