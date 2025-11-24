package com.anpl.repository;

import com.anpl.model.BadmintonPlayerSkills;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BadmintonPlayerSkillsRepository extends JpaRepository<BadmintonPlayerSkills, Long> {
    Optional<BadmintonPlayerSkills> findByPlayerProfileId(Long playerProfileId);
}

