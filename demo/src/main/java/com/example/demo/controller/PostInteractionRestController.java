package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.PostInteractionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostInteractionRestController {

    private final PostInteractionService postInteractionService;
    private final UserRepository userRepository;

    @GetMapping("/{postId}/social")
    public ResponseEntity<PostSocialStateDto> getSocial(
            @PathVariable Long postId,
            Authentication authentication) {
        User user = null;
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            user = userRepository.findByUsername(authentication.getName()).orElse(null);
        }
        return ResponseEntity.ok(postInteractionService.getSocialState(postId, user));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<LikeToggleResponse> toggleLike(
            @PathVariable Long postId,
            Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
        return ResponseEntity.ok(postInteractionService.toggleLike(postId, user));
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody AddCommentRequest request,
            Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
        return ResponseEntity.ok(postInteractionService.addComment(postId, user, request));
    }

    @GetMapping("/{postId}/likers")
    public ResponseEntity<List<LikerDto>> likers(@PathVariable Long postId) {
        return ResponseEntity.ok(postInteractionService.listLikers(postId));
    }
}
