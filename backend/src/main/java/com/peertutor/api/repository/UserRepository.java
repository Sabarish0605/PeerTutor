package com.peertutor.api.repository;

import com.peertutor.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring magically writes the SQL for this based on the method name!
    Optional<User> findByEmail(String email);
}