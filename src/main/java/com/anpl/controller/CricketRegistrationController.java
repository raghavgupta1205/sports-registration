package com.anpl.controller;

import com.anpl.dto.*;
import com.anpl.security.UserPrincipal;
import com.anpl.service.CricketEventRegistrationService;
import com.anpl.service.CricketRegistrationService;
import com.anpl.service.FileUploadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cricket-registrations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CricketRegistrationController {

    private final CricketRegistrationService cricketRegistrationService;
    private final CricketEventRegistrationService cricketEventRegistrationService;
    private final FileUploadService fileUploadService;

    /**
     * MAIN ENDPOINT: Complete cricket event registration (BEFORE PAYMENT)
     * This endpoint handles the full registration process:
     * 1. Creates event registration
     * 2. Saves all cricket-specific details
     * 3. Returns confirmation to proceed to payment
     */
    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<CricketEventRegistrationResponse>> completeCricketRegistration(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CricketEventRegistrationRequest request) {
        CricketEventRegistrationResponse response = cricketEventRegistrationService
                .registerForCricketEvent(userPrincipal.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Check if cricket registration is complete before allowing payment
     */
    @GetMapping("/check/{eventRegistrationId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkCricketRegistrationStatus(
            @PathVariable Long eventRegistrationId) {
        boolean isComplete = cricketEventRegistrationService.isCricketRegistrationComplete(eventRegistrationId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("cricketRegistrationComplete", isComplete);
        response.put("readyForPayment", isComplete);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get cricket registration details by event registration ID
     */
    @GetMapping("/event-registration/{eventRegistrationId}")
    public ResponseEntity<ApiResponse<CricketRegistrationResponse>> getCricketRegistrationByEventId(
            @PathVariable Long eventRegistrationId) {
        CricketRegistrationResponse response = cricketEventRegistrationService
                .getCricketDetailsByEventRegistration(eventRegistrationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get cricket registration by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CricketRegistrationResponse>> getCricketRegistrationById(
            @PathVariable Long id) {
        CricketRegistrationResponse response = cricketRegistrationService.getCricketRegistrationById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Update cricket registration (if needed before payment)
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CricketRegistrationResponse>> updateCricketRegistration(
            @PathVariable Long id,
            @Valid @RequestBody CricketRegistrationRequest request) {
        CricketRegistrationResponse response = cricketRegistrationService.updateCricketRegistration(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== FILE UPLOAD ENDPOINTS ====================
    
    /**
     * Upload Aadhaar front photo
     * This should be called BEFORE submitting the complete registration
     */
    @PostMapping(value = "/upload/aadhaar-front", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAadhaarFront(
            @RequestParam("file") MultipartFile file) throws IOException {
        String filePath = fileUploadService.uploadFile(file, "aadhaar-front");
        Map<String, String> response = new HashMap<>();
        response.put("filePath", filePath);
        response.put("message", "Aadhaar front photo uploaded successfully");
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Upload Aadhaar back photo
     */
    @PostMapping(value = "/upload/aadhaar-back", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAadhaarBack(
            @RequestParam("file") MultipartFile file) throws IOException {
        String filePath = fileUploadService.uploadFile(file, "aadhaar-back");
        Map<String, String> response = new HashMap<>();
        response.put("filePath", filePath);
        response.put("message", "Aadhaar back photo uploaded successfully");
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Upload player photo
     */
    @PostMapping(value = "/upload/player-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPlayerPhoto(
            @RequestParam("file") MultipartFile file) throws IOException {
        String filePath = fileUploadService.uploadFile(file, "player-photos");
        Map<String, String> response = new HashMap<>();
        response.put("filePath", filePath);
        response.put("message", "Player photo uploaded successfully");
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

