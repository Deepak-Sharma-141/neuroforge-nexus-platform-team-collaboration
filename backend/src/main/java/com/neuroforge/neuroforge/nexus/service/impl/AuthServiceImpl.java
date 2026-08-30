package com.neuroforge.neuroforge.nexus.service.impl;

import com.neuroforge.neuroforge.nexus.dto.request.LoginRequest;
import com.neuroforge.neuroforge.nexus.dto.request.SignupRequest;
import com.neuroforge.neuroforge.nexus.dto.response.LoginResponse;
import com.neuroforge.neuroforge.nexus.dto.response.SignupResponse;
import com.neuroforge.neuroforge.nexus.entities.enums.Role;
import com.neuroforge.neuroforge.nexus.entities.User;
import com.neuroforge.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.neuroforge.nexus.repository.UserRepository;
import com.neuroforge.neuroforge.nexus.security.JwtUtil;
import com.neuroforge.neuroforge.nexus.service.AuthService;
import com.neuroforge.neuroforge.nexus.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.neuroforge.neuroforge.nexus.mapper.UserMapper;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {

    UserRepository userRepository;
    UserMapper userMapper;
    AuthenticationManager authenticationManager;
    JwtUtil jwtUtil;
    PasswordEncoder passwordEncoder;
    UserService userService;

    @Override
    public SignupResponse signup(SignupRequest signupRequest) {

        if (userRepository.existsByEmail(signupRequest.email())) {
            log.error("User already exists with email {}", signupRequest.email());
            throw new RuntimeException("Email already registered");
        }
        User user = userMapper.toEntity(signupRequest);
        user.setUserId(UUID.randomUUID());
        user.setPassword(passwordEncoder.encode(signupRequest.password()));
        user.setRole(Role.DEVELOPER);

        User savedUser = userRepository.save(user);
        log.info("Signup success with email: {}", signupRequest.email());

        return userMapper.toResponse(savedUser);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found with email: "+request.email()));

        UUID userId = user.getUserId();
        String accessToken = jwtUtil.generateAccessToken(
                request.email(),
                user.getUserId(),
                user.getRole().name()
        );

        String refreshToken = jwtUtil.generateRefreshToken(userId);

        return new LoginResponse(userId, accessToken, refreshToken);

    }

    @Override
    public SignupResponse createUserWithRole(SignupRequest signupRequest, Role role) {
        if (userRepository.existsByEmail(signupRequest.email())) {
            log.error("User already exists with email {}", signupRequest.email());
            throw new RuntimeException("Email already registered");
        }
        User user = userMapper.toEntity(signupRequest);
        user.setUserId(UUID.randomUUID());
        user.setPassword(passwordEncoder.encode(signupRequest.password()));
        user.setRole(role);   // caller-supplied, not client-supplied

        User savedUser = userRepository.save(user);
        log.info("User created with role {} for email: {}", role, signupRequest.email());

        return userMapper.toResponse(savedUser);
    }

    @Override
    public LoginResponse refresh(String refreshToken) {
        jwtUtil.verifyRefreshToken(refreshToken);

        UUID userId = jwtUtil.getUserIdFromToken(refreshToken);
        User user = userRepository.findUserByUserId(userId).orElseThrow(() ->
                new ResourceNotFoundException("user not found"));

        String newAccessToken = jwtUtil.generateAccessToken(user.getEmail(), userId, user.getRole().toString());
        String newRefreshToken = jwtUtil.generateRefreshToken(userId);

        log.info("Refresh successful for user {}", user.getEmail());
        return new LoginResponse(userId, newAccessToken, newRefreshToken);
    }
}
