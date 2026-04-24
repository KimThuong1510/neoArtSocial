package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.model.Comment;
import com.example.demo.model.Post;
import com.example.demo.model.PostLike;
import com.example.demo.model.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostLikeRepository;
import com.example.demo.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostInteractionService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public PostSocialStateDto getSocialState(Long postId, User currentUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        long likeCount = postLikeRepository.countByPost(post);
        boolean liked = currentUser != null
                && postLikeRepository.existsByPostAndUser(post, currentUser);
        List<Comment> roots = commentRepository.findByPostAndParentIsNullOrderByCreatedAtAsc(post);
        List<CommentResponse> tree = roots.stream()
                .map(this::mapCommentTree)
                .collect(Collectors.toList());
        return PostSocialStateDto.builder()
                .likeCount(likeCount)
                .likedByCurrentUser(liked)
                .comments(tree)
                .build();
    }

    @Transactional
    public LikeToggleResponse toggleLike(Long postId, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        if (postLikeRepository.existsByPostAndUser(post, user)) {
            postLikeRepository.deleteByPostAndUser(post, user);
        } else {
            PostLike like = new PostLike();
            like.setPost(post);
            like.setUser(user);
            postLikeRepository.save(like);
            notificationService.notifyPostLiked(user, post);
        }
        long count = postLikeRepository.countByPost(post);
        boolean liked = postLikeRepository.existsByPostAndUser(post, user);
        return new LikeToggleResponse(liked, count);
    }

    @Transactional
    public CommentResponse addComment(Long postId, User user, AddCommentRequest req) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        Comment c = new Comment();
        c.setPost(post);
        c.setUser(user);
        c.setContent(req.getContent().trim());
        if (req.getParentId() != null) {
            Comment parent = commentRepository.findById(req.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent comment not found"));
            if (!parent.getPost().getId().equals(postId)) {
                throw new IllegalArgumentException("Parent belongs to another post");
            }
            c.setParent(parent);
        }
        c = commentRepository.save(c);
        notificationService.notifyPostCommented(user, post, c.getContent());
        CommentResponse dto = mapComment(c);
        dto.setReplies(new ArrayList<>());

        messagingTemplate.convertAndSend("/topic/post." + postId, new WsPostEvent("NEW_COMMENT", dto));
        return dto;
    }

    @Transactional(readOnly = true)
    public List<LikerDto> listLikers(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        return postLikeRepository.findByPostOrderByCreatedAtAsc(post).stream()
                .map(pl -> {
                    User u = pl.getUser();
                    return new LikerDto(u.getUsername(), u.getNickname(), u.getAvatar());
                })
                .collect(Collectors.toList());
    }

    private CommentResponse mapCommentTree(Comment c) {
        CommentResponse dto = mapComment(c);
        List<Comment> replies = commentRepository.findByParentOrderByCreatedAtAsc(c);
        dto.setReplies(replies.stream().map(this::mapCommentTree).collect(Collectors.toList()));
        return dto;
    }

    private CommentResponse mapComment(Comment c) {
        User u = c.getUser();
        return CommentResponse.builder()
                .id(c.getId())
                .postId(c.getPost().getId())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .authorUsername(u.getUsername())
                .authorNickname(u.getNickname())
                .authorAvatar(u.getAvatar())
                .replies(new ArrayList<>())
                .build();
    }
}
