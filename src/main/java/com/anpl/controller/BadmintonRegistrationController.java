package com.anpl.controller;

import com.anpl.dto.*;
import com.anpl.security.UserPrincipal;
import com.anpl.service.BadmintonRegistrationService;
import com.anpl.service.FileUploadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/badminton")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BadmintonRegistrationController {

    private final BadmintonRegistrationService badmintonRegistrationService;
    private final FileUploadService fileUploadService;

    @GetMapping("/events/{eventId}/categories")
    public ResponseEntity<ApiResponse<List<BadmintonCategoryResponse>>> getCategories(@PathVariable Long eventId) {
        List<BadmintonCategoryResponse> categories = badmintonRegistrationService.getCategories(eventId);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/registrations/event/{eventId}")
    public ResponseEntity<ApiResponse<BadmintonRegistrationResponse>> getRegistration(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long eventId) {
        BadmintonRegistrationResponse response = badmintonRegistrationService
                .getRegistration(userPrincipal.getUser(), eventId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/registrations/complete")
    public ResponseEntity<ApiResponse<BadmintonRegistrationResponse>> completeRegistration(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody BadmintonRegistrationRequest request) {
        BadmintonRegistrationResponse response = badmintonRegistrationService
                .register(userPrincipal.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping(value = "/registrations/upload/aadhaar-front", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAadhaarFront(
            @RequestParam("file") MultipartFile file) throws java.io.IOException {
        return ResponseEntity.ok(ApiResponse.success(uploadDocument(file, "aadhaar-front",
                "Aadhaar front photo uploaded successfully")));
    }

    @PostMapping(value = "/registrations/upload/aadhaar-back", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAadhaarBack(
            @RequestParam("file") MultipartFile file) throws java.io.IOException {
        return ResponseEntity.ok(ApiResponse.success(uploadDocument(file, "aadhaar-back",
                "Aadhaar back photo uploaded successfully")));
    }

    @PostMapping(value = "/registrations/upload/player-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPlayerPhoto(
            @RequestParam("file") MultipartFile file) throws java.io.IOException {
        return ResponseEntity.ok(ApiResponse.success(uploadDocument(file, "player-photos",
                "Player photo uploaded successfully")));
    }

    private Map<String, String> uploadDocument(MultipartFile file, String folder, String message) throws java.io.IOException {
        String filePath = fileUploadService.uploadFile(file, folder);
        return Map.of(
                "filePath", filePath,
                "message", message
        );
    }
}

