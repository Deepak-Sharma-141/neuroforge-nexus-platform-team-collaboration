package com.neuroforge.neuroforge.nexus.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record SignupRequest(
        @NotBlank
        String name,

        @Email
        String email,

        @NotEmpty
        String password
) {
}
