package com.anpl.service;

import com.anpl.dto.LoginRequest;
import com.anpl.dto.RegistrationRequest;
import com.anpl.dto.UserResponse;
import com.anpl.model.User;
import com.anpl.model.UserRole;
import com.anpl.exception.DuplicateResourceException;
import com.anpl.exception.InvalidCredentialsException;
import com.anpl.repository.UserRepository;
import com.anpl.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    @Transactional
    public UserResponse registerUser(RegistrationRequest request) {
        // Validate password confirmation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new DuplicateResourceException("Passwords do not match");
        }

        // Check for existing user
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setFathersName(request.getFathersName());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAadhaarNumber(request.getAadhaarNumber());
        user.setBlock(request.getBlock());
        user.setHouseNumber(request.getHouseNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);
        user.setRegistrationNumber(generateRegistrationNumber());
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        emailService.sendWelcomeEmail(savedUser);

        String token = jwtTokenProvider.generateToken(savedUser.getEmail());

        return UserResponse.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .phoneNumber(savedUser.getPhoneNumber())
                .registrationNumber(savedUser.getRegistrationNumber())
                .block(savedUser.getBlock())
                .token(token)
                .role(savedUser.getRole().toString())
                .build();
    }

    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail());
        return buildUserResponse(user, token);
    }

    @Transactional
    public void initiatePasswordReset(String email, String baseUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found with email: " + email));
        // Generate reset token and send email
        String resetToken = generateResetToken();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);
        String normalizedBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String resetUrl = normalizedBase + "/reset-password?token=" + resetToken;
        emailService.sendPasswordResetEmail(user, resetUrl);
    }

    @Transactional
    public void completePasswordReset(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    private String generateResetToken() {
        return UUID.randomUUID().toString();
    }

    private String generateRegistrationNumber() {
        return "ANPL" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private UserResponse buildUserResponse(User user, String token) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .registrationNumber(user.getRegistrationNumber())
                .block(user.getBlock())
                .token(token)
                .role(user.getRole().toString())
                .build();
    }
} 