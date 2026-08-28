package com.clone.drive.service.impl;

import com.clone.drive.dto.request.LoginRequest;
import com.clone.drive.dto.request.RefreshTokenRequest;
import com.clone.drive.dto.request.RegisterRequest;
import com.clone.drive.dto.response.JwtResponse;
import com.clone.drive.dto.response.UserDto;
import com.clone.drive.dto.response.UserProfileResponse;
import com.clone.drive.entity.RefreshToken;
import com.clone.drive.entity.Role;
import com.clone.drive.entity.User;
import com.clone.drive.exception.BadRequestException;
import com.clone.drive.exception.ResourceNotFoundException;
import com.clone.drive.exception.TokenRefreshException;
import com.clone.drive.exception.UserAlreadyExistsException;
import com.clone.drive.repository.RefreshTokenRepository;
import com.clone.drive.repository.UserRepository;
import com.clone.drive.security.UserDetailsServiceImpl;
import com.clone.drive.service.AuthService;
import com.clone.drive.service.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    @Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    public AuthServiceImpl(UserRepository userRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtService jwtService,
                           UserDetailsServiceImpl userDetailsService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    @Transactional
    public Map<String, Object> registerUser(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User already exists with email: " + request.getEmail());
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                Role.ROLE_USER
        );

        User savedUser = userRepository.save(user);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("userId", savedUser.getId());
        responseData.put("name", savedUser.getName());
        responseData.put("email", savedUser.getEmail());
        responseData.put("createdAt", savedUser.getCreatedAt());

        return responseData;
    }

    @Override
    @Transactional
    public JwtResponse loginUser(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        String accessToken = jwtService.generateToken(userDetails);
        RefreshToken refreshToken = createOrUpdateRefreshToken(user);

        UserDto userDto = new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole().name());

        return new JwtResponse(
                accessToken,
                refreshToken.getToken(),
                jwtService.getJwtExpirationMs() / 1000,
                userDto
        );
    }

    @Override
    @Transactional
    public JwtResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenRepository.findByToken(requestRefreshToken)
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "Refresh token is not in database!"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenRefreshException(requestRefreshToken, "Refresh token was expired. Please make a new login request");
        }

        User user = refreshToken.getUser();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String newAccessToken = jwtService.generateToken(userDetails);

        return new JwtResponse(
                newAccessToken,
                refreshToken.getToken(),
                jwtService.getJwtExpirationMs() / 1000
        );
    }

    @Override
    @Transactional
    public void logoutUser(String email) {
        userRepository.findByEmail(email).ifPresent(refreshTokenRepository::deleteByUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        List<String> roles = Collections.singletonList(user.getRole().name());

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                roles,
                user.getCreatedAt()
        );
    }

    private RefreshToken createOrUpdateRefreshToken(User user) {
        RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
                .orElseGet(() -> new RefreshToken(user, UUID.randomUUID().toString(), Instant.now().plusMillis(refreshExpirationMs)));

        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpirationMs));

        return refreshTokenRepository.save(refreshToken);
    }
}
