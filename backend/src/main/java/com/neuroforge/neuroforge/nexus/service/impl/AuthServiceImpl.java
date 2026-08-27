package com.neuroforge.neuroforge.nexus.service.impl;

import com.neuroforge.neuroforge.nexus.dto.request.SignupRequest;
import com.neuroforge.neuroforge.nexus.dto.response.SignupResponse;
import com.neuroforge.neuroforge.nexus.entities.enums.Role;
import com.neuroforge.neuroforge.nexus.entities.User;
import com.neuroforge.neuroforge.nexus.repository.UserRepository;
import com.neuroforge.neuroforge.nexus.service.AuthService;
import com.neuroforge.neuroforge.nexus.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.neuroforge.neuroforge.nexus.mapper.UserMapper;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {

    UserRepository userRepository;
    UserMapper userMapper;

    @Override
    public SignupResponse signup(SignupRequest signupRequest) {

        if (userRepository.existsByEmail(signupRequest.email())) {
            log.error("User already exists with email {}", signupRequest.email());
            throw new RuntimeException("Email already registered");
        }
        log.info("Signup success with email: {}", signupRequest.email());
        User user = userMapper.toEntity(signupRequest);
        user.setRole(Role.DEVELOPER);
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }
}
