package com.anpl.repository;

import com.anpl.model.BadmintonRegistrationEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BadmintonRegistrationEntryRepository extends JpaRepository<BadmintonRegistrationEntry, Long> {

    List<BadmintonRegistrationEntry> findByEventRegistrationId(Long eventRegistrationId);

    boolean existsByEventRegistrationIdAndCategoryId(Long registrationId, Long categoryId);

    void deleteByEventRegistrationId(Long registrationId);
}

