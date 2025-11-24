package com.anpl.repository;

import com.anpl.model.PlayerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlayerProfileRepository extends JpaRepository<PlayerProfile, Long> {
    Optional<PlayerProfile> findByUserIdAndSportType(Long userId, String sportType);
    boolean existsByUserIdAndSportType(Long userId, String sportType);
}

