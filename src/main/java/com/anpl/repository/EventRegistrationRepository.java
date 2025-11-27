package com.anpl.repository;

import com.anpl.model.EventRegistration;
import com.anpl.model.RegistrationStatus;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    List<EventRegistration> findByUserIdAndRegistrationStatusNot(Long userId, RegistrationStatus registrationStatus);
    Optional<EventRegistration> findByUserIdAndEventIdAndRegistrationStatus(Long userId, Long eventId, RegistrationStatus registrationStatus);
    Optional<EventRegistration> findByUserIdAndEventId(Long userId, Long eventId);
    boolean existsByEventIdAndJerseyNumber(Long eventId, Integer jerseyNumber);
    Optional<EventRegistration> findFirstByUserIdAndEvent_EventTypeOrderByUpdatedAtDesc(Long userId, String eventType);

    @EntityGraph(attributePaths = {"user", "event"})
    List<EventRegistration> findAll();

    @EntityGraph(attributePaths = {"user", "event"})
    Optional<EventRegistration> findById(Long id);
} 