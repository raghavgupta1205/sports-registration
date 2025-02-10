package com.anpl.controller;

import com.anpl.dto.ApiResponse;
import com.anpl.dto.EventRegistrationRequest;
import com.anpl.dto.EventRegistrationResponse;
import com.anpl.model.EventRegistration;
import com.anpl.security.UserPrincipal;
import com.anpl.service.EventRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventRegistrationController {
    private final EventRegistrationService registrationService;

    @PostMapping
    public ResponseEntity<ApiResponse<EventRegistrationResponse>> register(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody EventRegistrationRequest request) {
        EventRegistrationResponse response = registrationService.createRegistration(userPrincipal.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventRegistrationResponse>>> getUserRegistrations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<EventRegistration> registrations = registrationService.getUserRegistrations(userPrincipal.getId());
        List<EventRegistrationResponse> responses = registrations.stream()
                .map(registrationService::buildEventRegistrationResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{registrationId}")
    public ResponseEntity<ApiResponse<EventRegistrationResponse>> getRegistration(
            @PathVariable Long registrationId) {
        EventRegistrationResponse registration = registrationService.getRegistrationById(registrationId);
        return ResponseEntity.ok(ApiResponse.success(registration));
    }
} 