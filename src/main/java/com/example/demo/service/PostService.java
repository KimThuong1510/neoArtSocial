package com.example.demo.service;

import com.example.demo.dto.PostAdminDTO;
import com.example.demo.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PostService {
        void createPost(
                        String content,
                        String topicCode,
                        List<MultipartFile> files,
                        User user);

        void updatePost(
                        Long postId,
                        String topicCode,
                        String content,
                        List<MultipartFile> images,
                        User user);

        void deletePost(Long postId, User user);

        List<PostAdminDTO> getAllPostsForAdmin();
}
