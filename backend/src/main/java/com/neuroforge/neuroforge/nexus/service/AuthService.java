package com.neuroforge.neuroforge.nexus.service;

import com.neuroforge.neuroforge.nexus.dto.request.SignupRequest;
import com.neuroforge.neuroforge.nexus.dto.response.SignupResponse;

public interface AuthService {
    SignupResponse signup(SignupRequest signupRequest);
}
