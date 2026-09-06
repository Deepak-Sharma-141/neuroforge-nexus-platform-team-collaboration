package com.neuroforge.neuroforge.nexus.controllers;

import com.neuroforge.neuroforge.nexus.dto.request.ChatRequest;
import com.neuroforge.neuroforge.nexus.dto.response.ChatResponse;
import com.neuroforge.neuroforge.nexus.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ChatResponse chat(
            @RequestBody ChatRequest request,
            Authentication authentication
    ) {

        // The currently logged-in user
        String username = authentication.getName();

        System.out.println("Chat request from user: " + username);

        String response = chatService.ask(request.message());

        return new ChatResponse(response);
    }
}