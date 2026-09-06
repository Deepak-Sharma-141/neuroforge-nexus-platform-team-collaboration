package com.neuroforge.neuroforge.nexus.service.impl;

import com.neuroforge.neuroforge.nexus.service.ChatService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class ChatServiceImpl implements ChatService {

    private final ChatClient chatClient;

    public ChatServiceImpl(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String ask(String message) {

        return chatClient
                .prompt()
                .user(message)
                .call()
                .content();
    }
}
