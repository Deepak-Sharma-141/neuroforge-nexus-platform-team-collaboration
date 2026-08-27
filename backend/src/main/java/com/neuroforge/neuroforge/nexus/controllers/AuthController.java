package com.neuroforge.neuroforge.nexus.controllers;

import com.neuroforge.neuroforge.nexus.dto.response.SignupResponse;
import com.neuroforge.neuroforge.nexus.service.AuthService;
import com.neuroforge.neuroforge.nexus.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.neuroforge.neuroforge.nexus.dto.request.SignupRequest;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {

    AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody SignupRequest signupRequest){
        return ResponseEntity.status(HttpStatus.OK).body(authService.signup(signupRequest));
    }
}
