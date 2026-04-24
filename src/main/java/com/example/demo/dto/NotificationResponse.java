package com.example.demo.dto;

import com.example.demo.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long postId;
    private NotificationType type;
    private String content;
    private boolean read;
    private LocalDateTime createdAt;
    private String senderUsername;
    private String senderNickname;
    private String senderAvatar;
}
