package com.anpl.controller;

import com.anpl.dto.ApiResponse;
import com.anpl.model.Event;
import com.anpl.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventController {
    private final EventService eventService;

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Event>>> getActiveEvents() {
        List<Event> activeEvents = eventService.getActiveEvents();
        return ResponseEntity.ok(ApiResponse.success(activeEvents));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Event>>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Event>> getEventById(@PathVariable Long id) {
        Event event = eventService.getEventById(id);
        return ResponseEntity.ok(ApiResponse.success(event));
    }
} 