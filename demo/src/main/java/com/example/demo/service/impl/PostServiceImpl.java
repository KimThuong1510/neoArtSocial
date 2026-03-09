package com.example.demo.service.impl;

import com.example.demo.model.Post;
import com.example.demo.model.PostImage;
import com.example.demo.model.User;
import com.example.demo.repository.PostImageRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.TopicRepository;
import com.example.demo.service.PostService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;


@Service
@Transactional
public class PostServiceImpl implements PostService {
    private static final String UPLOAD_DIR = "uploads/posts/";

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostImageRepository postImageRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Override
    @Transactional
    public void createPost(
            String content,
            String topicCode,
            List<MultipartFile> files,
            User user) {

        // 1. Lưu post
        Post post = new Post();
        post.setUser(user);
        post.setContent(content);
        // Tìm Topic dựa vào mã topic gửi từ client và gán cho Post
        if (topicCode != null && !topicCode.isEmpty()) {
            topicRepository.findByCode(topicCode).ifPresent(post::setTopic);
        }
        post = postRepository.save(post);

        // 2. Lưu file ảnh
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                try {

                    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                    Path uploadPath = Paths.get(UPLOAD_DIR);

                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                    }

                    Path filePath = uploadPath.resolve(fileName);
                    Files.write(filePath, file.getBytes());

                    PostImage image = new PostImage();
                    image.setFileName(fileName);
                    image.setFilePath("/uploads/posts/" + fileName);
                    image.setPost(post);

                    postImageRepository.save(image);

                } catch (IOException e) {
                    throw new RuntimeException("Upload file failed", e);
                }
            }
            postRepository.save(post);
        }
    }


    @Override
    @Transactional
    public void updatePost(Long postId, String topicCode, String content, List<MultipartFile> images, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Kiểm tra quyền
        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to edit this post");
        }

        if (topicCode != null && !topicCode.isEmpty()) {
            topicRepository.findByCode(topicCode).ifPresent(post::setTopic);
        }

        if (content != null) {
            post.setContent(content);
        }

        if (images != null && !images.isEmpty() && images.stream().anyMatch(f -> !f.isEmpty())) {
            post.getImages().clear();
            for (MultipartFile file : images) {
                if (file.isEmpty()) continue;
                try {
                    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                    Path uploadPath = Paths.get(UPLOAD_DIR);

                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                    }

                    Path filePath = uploadPath.resolve(fileName);
                    Files.write(filePath, file.getBytes());

                    PostImage image = new PostImage();
                    image.setFileName(fileName);
                    image.setFilePath("/uploads/posts/" + fileName);
                    image.setPost(post);

                    post.getImages().add(image);
                } catch (IOException e) {
                    throw new RuntimeException("Upload file failed", e);
                }
            }
        }

        postRepository.save(post);
    }

    @Override
    @Transactional
    public void deletePost(Long postId, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this post");
        }

        postRepository.delete(post);
    }
}
