package com.anpl.repository;

import com.anpl.model.CricketPlayerSkills;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CricketPlayerSkillsRepository extends JpaRepository<CricketPlayerSkills, Long> {
    Optional<CricketPlayerSkills> findByPlayerProfileId(Long playerProfileId);
}

