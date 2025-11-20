package com.anpl.repository;

import com.anpl.model.CricketRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CricketRegistrationRepository extends JpaRepository<CricketRegistration, Long> {
    Optional<CricketRegistration> findByEventRegistrationId(Long eventRegistrationId);
    boolean existsByEventRegistrationId(Long eventRegistrationId);
    boolean existsByLuckyNumber(Integer luckyNumber);
}

