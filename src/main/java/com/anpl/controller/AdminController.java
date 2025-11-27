package com.anpl.controller;

import com.anpl.dto.AdminRegistrationDetailResponse;
import com.anpl.dto.AdminRegistrationStatusUpdateRequest;
import com.anpl.dto.AdminRegistrationSummaryResponse;
import com.anpl.dto.ApiResponse;
import com.anpl.dto.EventRequest;
import com.anpl.model.Event;
import com.anpl.model.RegistrationStatus;
import com.anpl.service.AdminService;
import com.anpl.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {
    private final AdminService adminService;
    private final EventService eventService;

    @GetMapping("/registrations")
    public ResponseEntity<ApiResponse<List<AdminRegistrationSummaryResponse>>> getAllRegistrations(
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) RegistrationStatus status,
            @RequestParam(required = false, defaultValue = "false") boolean includeFailed) {
        List<AdminRegistrationSummaryResponse> registrations = adminService.getRegistrationSummaries(
                eventType, status, includeFailed);
        return ResponseEntity.ok(ApiResponse.success(registrations));
    }

    @GetMapping("/registrations/{registrationId}")
    public ResponseEntity<ApiResponse<AdminRegistrationDetailResponse>> getRegistrationDetail(
            @PathVariable Long registrationId) {
        AdminRegistrationDetailResponse detail = adminService.getRegistrationDetail(registrationId);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @PatchMapping("/registrations/{registrationId}")
    public ResponseEntity<ApiResponse<Void>> updateRegistrationStatus(
            @PathVariable Long registrationId,
            @Valid @RequestBody AdminRegistrationStatusUpdateRequest request) {
        adminService.updateRegistrationStatus(registrationId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/registrations/{registrationId}/status")
    public ResponseEntity<ApiResponse<Void>> updateRegistrationStatusCompat(
            @PathVariable Long registrationId,
            @RequestParam RegistrationStatus status) {
        adminService.updateRegistrationStatus(registrationId, status);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/export/registrations")
    public ResponseEntity<byte[]> exportRegistrations() {
        byte[] excelFile = adminService.exportRegistrationsToExcel();
        return ResponseEntity.ok()
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .header("Content-Disposition", "attachment; filename=registrations.xlsx")
                .body(excelFile);
    }

    // Event Management Endpoints
    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<Event>>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<ApiResponse<Event>> getEventById(@PathVariable Long id) {
        Event event = eventService.getEventById(id);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @PostMapping("/events")
    public ResponseEntity<ApiResponse<Event>> createEvent(@Valid @RequestBody EventRequest request) {
        Event event = eventService.createEvent(request);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<ApiResponse<Event>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request) {
        Event event = eventService.updateEvent(id, request);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/events/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Event>> toggleEventStatus(@PathVariable Long id) {
        Event event = eventService.toggleEventStatus(id);
        return ResponseEntity.ok(ApiResponse.success(event));
    }
} 