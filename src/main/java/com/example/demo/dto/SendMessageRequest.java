package com.example.demo.dto;

import com.example.demo.model.MessageType;
import lombok.Data;

@Data
public class SendMessageRequest {
    /**
     * For existing conversation.
     */
    private Long conversationId;
    /**
     * For creating / finding 1-1 conversation.
     */
    private Long toUserId;

    private MessageType type = MessageType.TEXT;
    private String content;
}

