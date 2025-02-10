package com.anpl.controller;

import com.anpl.dto.ApiResponse;
import com.anpl.model.Event;
import com.anpl.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Event>>> getActiveEvents() {
        List<Event> activeEvents = eventService.getActiveEvents();
        return ResponseEntity.ok(ApiResponse.success(activeEvents));
    }
} 