package com.anpl.controller;

import com.anpl.dto.ApiResponse;
import com.anpl.dto.UserResponse;
import com.anpl.model.User;
import com.anpl.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class UserDirectoryController {

    private final UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(@RequestParam("query") String query) {
        if (query == null || query.trim().length() < 3) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        List<User> users = userRepository
                .findTop10ByFullNameContainingIgnoreCaseOrRegistrationNumberContainingIgnoreCase(query, query);
        List<UserResponse> responses = users.stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}

