package com.anpl.repository;

import com.anpl.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    List<EventRegistration> findByUserId(Long userId);
    List<EventRegistration> findByUserIdAndEventYear(Long userId, Integer eventYear);
    boolean existsByUserIdAndEventYear(Long userId, Integer eventYear);
    Optional<EventRegistration> findByUserIdAndEventId(Long userId, Long eventId);
} 