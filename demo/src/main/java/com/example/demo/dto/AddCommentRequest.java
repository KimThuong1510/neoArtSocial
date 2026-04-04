package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddCommentRequest {
    @NotBlank
    @Size(max = 5000)
    private String content;
    /** If set, this comment is a reply to the given comment id */
    private Long parentId;
}
