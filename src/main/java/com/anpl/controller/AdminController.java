package com.anpl.controller;

import com.anpl.dto.ApiResponse;
import com.anpl.dto.EventRegistrationResponse;
import com.anpl.model.RegistrationStatus;
import com.anpl.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/registrations")
    public ResponseEntity<ApiResponse<List<EventRegistrationResponse>>> getAllRegistrations() {
        List<EventRegistrationResponse> registrations = adminService.getAllRegistrations();
        return ResponseEntity.ok(ApiResponse.success(registrations));
    }

    @PutMapping("/registrations/{registrationId}/status")
    public ResponseEntity<ApiResponse<Void>> updateRegistrationStatus(
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
} 