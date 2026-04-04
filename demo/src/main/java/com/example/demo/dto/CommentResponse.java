package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private Long postId;
    private Long parentId;
    private String content;
    private LocalDateTime createdAt;
    private String authorUsername;
    private String authorNickname;
    private String authorAvatar;
    @Builder.Default
    private List<CommentResponse> replies = new ArrayList<>();
}
