package com.neuroforge.neuroforge.nexus.service.impl;

import com.neuroforge.neuroforge.nexus.dto.response.SignupResponse;
import com.neuroforge.neuroforge.nexus.entities.User;
import com.neuroforge.neuroforge.nexus.mapper.UserMapper;
import com.neuroforge.neuroforge.nexus.repository.UserRepository;
import com.neuroforge.neuroforge.nexus.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public List<SignupResponse> getAllUsers() {
        return userMapper.toAllResponse(userRepository.findAll());
    }

    @Override
    public SignupResponse getUserById(String id) {
        User user = userRepository.findById(id).orElseThrow(() ->
                new RuntimeException("User with id: "+id+ " not found"));
        return userMapper.toResponse(user);
    }

    @Override
    public void removeUser(String id) {
        userRepository.deleteById(id);
    }

    @Override
    public List<SignupResponse> getUserByRole(String role) {
        List<User> users = userRepository.findAllByRole(role);  // repository returns a list
        if (users.isEmpty()) {
            throw new RuntimeException("No users found with role: " + role);
        }
        return userMapper.toAllResponse(users);
    }
}
