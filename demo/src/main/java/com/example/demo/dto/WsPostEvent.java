package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload broadcast to /topic/post.{postId} subscribers.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WsPostEvent {
    private String type;
    private CommentResponse comment;
}
