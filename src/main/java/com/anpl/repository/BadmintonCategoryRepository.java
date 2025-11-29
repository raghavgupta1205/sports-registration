package com.anpl.repository;

import com.anpl.model.BadmintonCategory;
import com.anpl.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BadmintonCategoryRepository extends JpaRepository<BadmintonCategory, Long> {

    List<BadmintonCategory> findByEvent_EventTypeIgnoreCaseOrderByDisplayOrderAsc(String eventType);

    List<BadmintonCategory> findByEventIdOrderByDisplayOrderAsc(Long eventId);

    Optional<BadmintonCategory> findByEventAndCodeIgnoreCase(Event event, String code);
}

