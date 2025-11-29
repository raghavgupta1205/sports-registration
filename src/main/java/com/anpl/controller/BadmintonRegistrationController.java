package com.anpl.controller;

import com.anpl.dto.*;
import com.anpl.model.User;
import com.anpl.service.BadmintonRegistrationService;
import com.anpl.service.FileUploadService;
import com.razorpay.RazorpayException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/badminton-registrations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BadmintonRegistrationController {

    private final BadmintonRegistrationService registrationService;
    private final FileUploadService fileUploadService;

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<BadmintonCategoryOption>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(registrationService.getCategories()));
    }

    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<BadmintonEventRegistrationResponse>> completeRegistration(
            @AuthenticationPrincipal(expression = "user") User currentUser,
            @Valid @RequestBody BadmintonEventRegistrationRequest request) {
        BadmintonEventRegistrationResponse response = registrationService
                .createBundle(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/order")
    public ResponseEntity<ApiResponse<BadmintonOrderResponse>> createOrder(
            @AuthenticationPrincipal(expression = "user") User currentUser,
            @RequestBody Map<String, Long> payload) throws RazorpayException {
        Long bundleId = payload.get("bundleId");
        BadmintonOrderResponse response = registrationService.createOrder(currentUser, bundleId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Void>> verifyPayment(
            @Valid @RequestBody BadmintonPaymentVerificationRequest request) throws RazorpayException {
        registrationService.verifyPayment(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping(value = "/upload/player-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPlayerPhoto(
            @RequestParam("file") MultipartFile file) throws IOException {
        String filePath = fileUploadService.uploadFile(file, "badminton-player-photos");
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "filePath", filePath,
                "message", "Player photo uploaded successfully"
        )));
    }
}

