package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatUserSearchDto {
    private Long id;
    private String username;
    private String nickname;
    private String avatar;
    /**
     * "Bạn bè" if ever chatted before, else "Người lạ"
     */
    private String relationshipLabel;
}

