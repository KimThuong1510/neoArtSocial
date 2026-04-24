package com.example.demo.dto;

import lombok.Data;

@Data
public class GroupMemberDto {
    private Long userId;
    private String username;
    private String nickname;
    private String avatar;
    private boolean active;
    private boolean removedByAdmin;
}

