package com.neuroforge.neuroforge.nexus.service;

import com.neuroforge.neuroforge.nexus.dto.response.SignupResponse;
import com.neuroforge.neuroforge.nexus.entities.User;
import com.neuroforge.neuroforge.nexus.entities.enums.Role;

import java.util.List;

public interface UserService {
    List<SignupResponse> getAllUsers();

    SignupResponse getUserById(String id);

    void removeUser(String id);

    List<SignupResponse> getUserByRole(String role);

    SignupResponse updateRole(String id, Role role);
}
