package com.anpl.controller;

import com.anpl.dto.ApiResponse;
import com.anpl.dto.BadmintonRegistrationProfileEntry;
import com.anpl.dto.OrderRequest;
import com.anpl.dto.OrderResponse;
import com.anpl.dto.PaymentVerificationRequest;
import com.anpl.dto.RegistrationResponse;
import com.anpl.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {
    private final RegistrationService registrationService;

    @PostMapping("/order")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@RequestBody OrderRequest request) {
        OrderResponse response = registrationService.createOrder(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<RegistrationResponse>> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        RegistrationResponse response = registrationService.verifyPaymentAndRegister(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getUserRegistrations() {
        List<RegistrationResponse> registrations = registrationService.getCurrentUserRegistrations();
        return ResponseEntity.ok(ApiResponse.success(registrations));
    }

    @GetMapping("/user/badminton")
    public ResponseEntity<ApiResponse<List<BadmintonRegistrationProfileEntry>>> getUserBadmintonEntries() {
        List<BadmintonRegistrationProfileEntry> entries = registrationService.getCurrentUserBadmintonEntries();
        return ResponseEntity.ok(ApiResponse.success(entries));
    }

    @GetMapping("/{registrationId}/status")
    public ResponseEntity<ApiResponse<RegistrationResponse>> checkRegistrationStatus(
        @PathVariable Long registrationId
    ) {
        RegistrationResponse response = registrationService.checkRegistrationStatus(registrationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
} 