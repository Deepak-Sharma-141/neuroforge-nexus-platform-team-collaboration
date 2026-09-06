package com.neuroforge.neuroforge.nexus.dto.response;

import jakarta.validation.constraints.NotBlank;

public record ChatResponse(
        String message
) {
}
