package com.example.demo.dto;

import com.example.demo.model.ConversationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatEventDto {
    public enum Type {
        MESSAGE,
        CONVERSATION_STATUS,
        UNREAD_COUNT,
        GROUP_MESSAGE,
        GROUP_STATE
    }

    private Type type;

    private MessageDto message;

    private Long conversationId;
    private ConversationStatus conversationStatus;

    private Long totalUnread;

    private Long groupId;

    private String notice;
}

