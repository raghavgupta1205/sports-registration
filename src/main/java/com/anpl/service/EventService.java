package com.anpl.service;

import com.anpl.dto.EventRequest;
import com.anpl.exception.ResourceNotFoundException;
import com.anpl.model.Event;
import com.anpl.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

    public boolean isEventActive(Long eventId) {
        return eventRepository.findById(eventId)
            .map(Event::isActive)
            .orElse(false);
    }

    @Transactional
    public Event createEvent(EventRequest request) {
        Event event = new Event();
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setPrice(request.getPrice());
        event.setYear(request.getYear());
        event.setActive(request.getActive());
        event.setRegistrationStartDate(request.getRegistrationStartDate());
        event.setRegistrationEndDate(request.getRegistrationEndDate());
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        
        return eventRepository.save(event);
    }

    @Transactional
    public Event updateEvent(Long id, EventRequest request) {
        Event event = getEventById(id);
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setPrice(request.getPrice());
        event.setYear(request.getYear());
        event.setActive(request.getActive());
        event.setRegistrationStartDate(request.getRegistrationStartDate());
        event.setRegistrationEndDate(request.getRegistrationEndDate());
        event.setUpdatedAt(LocalDateTime.now());
        
        return eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        Event event = getEventById(id);
        eventRepository.delete(event);
    }

    @Transactional
    public Event toggleEventStatus(Long id) {
        Event event = getEventById(id);
        event.setActive(!event.isActive());
        event.setUpdatedAt(LocalDateTime.now());
        return eventRepository.save(event);
    }
} 