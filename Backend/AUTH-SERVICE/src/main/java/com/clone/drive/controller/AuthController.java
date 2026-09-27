package com.clone.drive.controller;

import com.clone.drive.dto.request.LoginRequest;
import com.clone.drive.dto.request.RefreshTokenRequest;
import com.clone.drive.dto.request.RegisterRequest;
import com.clone.drive.dto.response.ApiResponse;
import com.clone.drive.dto.response.JwtResponse;
import com.clone.drive.dto.response.RegisterResponse;
import com.clone.drive.dto.response.UserProfileResponse;
import com.clone.drive.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> registerUser(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse data = authService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", data));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> loginUser(@Valid @RequestBody LoginRequest request) {
        JwtResponse data = authService.loginUser(request);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", data));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<JwtResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        JwtResponse data = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", data));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logoutUser(Authentication authentication) {
        if (authentication != null && authentication.getName() != null) {
            authService.logoutUser(authentication.getName());
        }
        return ResponseEntity.ok(ApiResponse.success("Logout successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        UserProfileResponse userProfile = authService.getUserProfile(email);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", userProfile));
    }
}
