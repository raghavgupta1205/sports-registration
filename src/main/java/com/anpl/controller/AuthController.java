package com.anpl.controller;

import com.anpl.dto.ApiResponse;
import com.anpl.dto.ChangePasswordRequest;
import com.anpl.dto.LoginRequest;
import com.anpl.dto.RegistrationRequest;
import com.anpl.dto.UserResponse;
import com.anpl.exception.InvalidCredentialsException;
import com.anpl.security.UserPrincipal;
import com.anpl.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ApiResponse<Void>> initiatePasswordReset(@RequestParam String email,
                                                                   HttpServletRequest request) {
        String baseUrl = request.getRequestURL().toString().replace(request.getRequestURI(), "");
        userService.initiatePasswordReset(email, baseUrl);
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

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(userPrincipal.getUser(), request);
            return ResponseEntity.ok(ApiResponse.success(null, "Password updated successfully"));
        } catch (InvalidCredentialsException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        }
    }
} 