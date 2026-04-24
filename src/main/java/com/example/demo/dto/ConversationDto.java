package com.example.demo.dto;

import com.example.demo.model.ConversationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {
    private Long id;
    private ConversationStatus status;

    private Long requestedByUserId;

    private Long otherUserId;
    private String otherUsername;
    private String otherNickname;
    private String otherAvatar;

    private String lastMessagePreview;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
}

