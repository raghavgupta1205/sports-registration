package com.anpl.repository;

import com.anpl.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRegistrationNumber(String registrationNumber);
    Optional<User> findByResetToken(String token);
    boolean existsByAadhaarNumber(String aadhaarNumber);

    List<User> findTop10ByFullNameContainingIgnoreCaseOrRegistrationNumberContainingIgnoreCase(
            String name, String registrationNumber);
} 