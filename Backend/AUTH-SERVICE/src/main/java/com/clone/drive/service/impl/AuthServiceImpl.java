package com.clone.drive.service.impl;

import com.clone.drive.dto.request.LoginRequest;
import com.clone.drive.dto.request.RefreshTokenRequest;
import com.clone.drive.dto.request.RegisterRequest;
import com.clone.drive.dto.response.JwtResponse;
import com.clone.drive.dto.response.RegisterResponse;
import com.clone.drive.dto.response.UserDto;
import com.clone.drive.dto.response.UserProfileResponse;
import com.clone.drive.entity.RefreshToken;
import com.clone.drive.entity.User;
import com.clone.drive.exception.BadRequestException;
import com.clone.drive.exception.ResourceNotFoundException;
import com.clone.drive.exception.TokenRefreshException;
import com.clone.drive.exception.UserAlreadyExistsException;
import com.clone.drive.mapper.UserMapper;
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
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserMapper userMapper;

    @Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

   

    public AuthServiceImpl(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
			PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService,
			UserDetailsServiceImpl userDetailsService, UserMapper userMapper) {
		this.userRepository = userRepository;
		this.refreshTokenRepository = refreshTokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
		this.userDetailsService = userDetailsService;
		this.userMapper = userMapper;
	}

    
	@Override
    @Transactional
    public RegisterResponse registerUser(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User already exists with email: " + request.getEmail());
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = userMapper.toEntity(request, encodedPassword);
        User savedUser = userRepository.save(user);

        return userMapper.toRegisterResponse(savedUser);
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

        String accessToken = jwtService.generateToken(userDetails, user.getId());
        RefreshToken refreshToken = createOrUpdateRefreshToken(user);

        UserDto userDto = userMapper.toUserDto(user);

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
        String newAccessToken = jwtService.generateToken(userDetails, user.getId());

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

        return userMapper.toUserProfileResponse(user);
    }

    private RefreshToken createOrUpdateRefreshToken(User user) {
        RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
                .orElseGet(() -> new RefreshToken(user, UUID.randomUUID().toString(), Instant.now().plusMillis(refreshExpirationMs)));

        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpirationMs));

        return refreshTokenRepository.save(refreshToken);
    }
}
