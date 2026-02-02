package com.example.demo.service;

import com.example.demo.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


public interface PostService {
    void createPost(
            String content,
            String category,
            List<MultipartFile> files,
            User user
    );
}
