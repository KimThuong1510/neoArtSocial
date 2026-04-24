package com.example.demo.dto;

import com.example.demo.model.GroupStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GroupChatDto {
    private Long id;
    private String name;
    private String avatar;
    private Long adminUserId;
    private GroupStatus status;
    private String lastMessagePreview;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
    private boolean currentUserActiveMember;
    private boolean currentUserRemovedByAdmin;
    private long memberCount;
}

