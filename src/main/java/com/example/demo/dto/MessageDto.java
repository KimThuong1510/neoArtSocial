package com.example.demo.dto;

import com.example.demo.model.MessageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private MessageType type;
    private String content;
    private boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private String senderNickname;
    private String senderAvatar;
}

