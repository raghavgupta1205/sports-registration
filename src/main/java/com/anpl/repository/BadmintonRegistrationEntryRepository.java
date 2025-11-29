package com.anpl.repository;

import com.anpl.model.BadmintonRegistrationEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadmintonRegistrationEntryRepository extends JpaRepository<BadmintonRegistrationEntry, Long> {
    List<BadmintonRegistrationEntry> findByBundleId(Long bundleId);
}

