package com.anpl.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.anpl.repository.UserRepository;
import com.anpl.model.User;
import com.anpl.model.UserRole;
import com.anpl.dto.UserResponse;
import com.anpl.dto.RegistrationRequest;
import com.anpl.util.RegistrationNumberGenerator;

import java.time.LocalDateTime;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RegistrationNumberGenerator registrationNumberGenerator;

    public UserResponse register(RegistrationRequest request) {
        validateRegistration(request);
        
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setFathersName(request.getFathersName());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setBlock(request.getBlock());
        user.setHouseNumber(request.getHouseNumber());
        user.setAadhaarNumber(request.getAadhaarNumber());
        user.setRole(UserRole.USER);
        user.setRegistrationNumber(registrationNumberGenerator.generate());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        return UserResponse.fromUser(savedUser);
    }

    private void validateRegistration(RegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByAadhaarNumber(request.getAadhaarNumber())) {
            throw new RuntimeException("Aadhaar number already registered");
        }
    }
} 