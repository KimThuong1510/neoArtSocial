package com.example.demo.dto;

import com.example.demo.model.MessageType;
import lombok.Data;

@Data
public class GroupMessageRequest {
    private Long groupId;
    private MessageType type = MessageType.TEXT;
    private String content;
}

