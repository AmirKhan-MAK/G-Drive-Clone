package com.clone.drive.service;

import com.clone.drive.dto.request.LoginRequest;
import com.clone.drive.dto.request.RefreshTokenRequest;
import com.clone.drive.dto.request.RegisterRequest;
import com.clone.drive.dto.response.JwtResponse;
import com.clone.drive.dto.response.RegisterResponse;
import com.clone.drive.dto.response.UserProfileResponse;

public interface AuthService {

    RegisterResponse registerUser(RegisterRequest request);

    JwtResponse loginUser(LoginRequest request);

    JwtResponse refreshToken(RefreshTokenRequest request);

    void logoutUser(String email);

    UserProfileResponse getUserProfile(String email);
}
