package com.anpl.controller;

import com.anpl.dto.*;
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

    @GetMapping("/{registrationId}/status")
    public ResponseEntity<ApiResponse<RegistrationResponse>> checkRegistrationStatus(
        @PathVariable Long registrationId
    ) {
        RegistrationResponse response = registrationService.checkRegistrationStatus(registrationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
} 