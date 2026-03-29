package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostAdminDTO {
    private Long id;
    private String content;
    private String authorNickname;
    private String topicName;
    private String topicCode;
    private LocalDateTime createdAt;
    private Long likeCount;
    private Long commentCount;
    private String firstImageUrl;
}
