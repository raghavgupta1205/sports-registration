package com.anpl.repository;

import com.anpl.model.EventRegistration;
import com.anpl.model.RegistrationStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    List<EventRegistration> findByUserIdAndRegistrationStatusNot(Long userId, RegistrationStatus registrationStatus);
    List<EventRegistration> findByUserIdAndEventYear(Long userId, Integer eventYear);
    boolean existsByUserIdAndEventYear(Long userId, Integer eventYear);
    Optional<EventRegistration> findByUserIdAndEventIdAndRegistrationStatus(Long userId, Long eventId, RegistrationStatus registrationStatus);
} 