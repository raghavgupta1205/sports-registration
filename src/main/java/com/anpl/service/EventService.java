package com.anpl.service;

import com.anpl.model.Event;
import com.anpl.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;

    public List<Event> getActiveEvents() {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findByActiveIsTrueAndRegistrationEndDateAfterAndRegistrationStartDateBefore(
            now,
            now
        );
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public boolean isEventActive(Long eventId) {
        return eventRepository.findById(eventId)
            .map(Event::isActive)
            .orElse(false);
    }
} 