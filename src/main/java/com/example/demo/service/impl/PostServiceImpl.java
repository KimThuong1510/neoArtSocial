package com.example.demo.service.impl;

import com.example.demo.model.Post;
import com.example.demo.model.PostImage;
import com.example.demo.model.User;
import com.example.demo.dto.PostAdminDTO;
import com.example.demo.dto.PostImageAdminDTO;
import com.example.demo.repository.PostImageRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.SavedPostRepository;
import com.example.demo.repository.TopicRepository;
import com.example.demo.service.PostService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
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
    @Autowired
    private SavedPostRepository savedPostRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;
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

        savedPostRepository.deleteByPost_Id(postId);
        jdbcTemplate.update("DELETE FROM post_likes WHERE post_id = ?", postId);
        // Xoa comment theo thu tu tu la len goc de tranh loi FK parent_id -> comments.id
        while (true) {
            int deleted = jdbcTemplate.update(
                    """
                    DELETE c
                    FROM comments c
                    LEFT JOIN comments child ON child.parent_id = c.id
                    WHERE c.post_id = ?
                      AND child.id IS NULL
                    """,
                    postId
            );
            if (deleted == 0) {
                break;
            }
        }

        postRepository.delete(post);
    }
    @Override
    public List<PostAdminDTO> getAllPostsForAdmin() {
        List<Post> posts = postRepository.findAll();
        return posts.stream().map(post -> {
            PostAdminDTO dto = new PostAdminDTO();
            dto.setId(post.getId());
            dto.setContent(post.getContent());
            dto.setAuthorNickname(post.getUser() != null ? post.getUser().getNickname() : "Unknown");
            dto.setTopicName(post.getTopic() != null ? post.getTopic().getName() : "Không chủ đề");
            dto.setTopicCode(post.getTopic() != null ? post.getTopic().getCode() : "tag-default");
            dto.setCreatedAt(post.getCreatedAt());

            List<PostImageAdminDTO> imageDTOs = post.getImages().stream().map(img -> {
                PostImageAdminDTO imgDto = new PostImageAdminDTO();
                imgDto.setId(img.getId());
                imgDto.setUrl(img.getFilePath());
                imgDto.setLikes(img.getLikesCount() != null ? img.getLikesCount() : 0L);
                imgDto.setComments(img.getCommentsCount() != null ? img.getCommentsCount() : 0L);
                return imgDto;
            }).collect(java.util.stream.Collectors.toList());
            dto.setImages(imageDTOs);
            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }
}
