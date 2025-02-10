package com.anpl.controller;

import com.anpl.dto.ApiResponse;
import com.anpl.dto.LoginRequest;
import com.anpl.dto.RegistrationRequest;
import com.anpl.dto.UserResponse;
import com.anpl.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.anpl.security.UserPrincipal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegistrationRequest request) {
        UserResponse response = userService.registerUser(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@Valid @RequestBody LoginRequest request) {
        UserResponse response = userService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/password-reset")
    public ResponseEntity<ApiResponse<Void>> initiatePasswordReset(@RequestParam String email) {
        userService.initiatePasswordReset(email);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/password-reset/complete")
    public ResponseEntity<ApiResponse<Void>> completePasswordReset(
            @RequestParam String token,
            @RequestParam String newPassword) {
        userService.completePasswordReset(token, newPassword);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserResponse userResponse = UserResponse.fromUser(userPrincipal.getUser());
        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }
} 