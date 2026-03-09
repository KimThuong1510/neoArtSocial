package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Controller
@RequestMapping("/posts")
public class PostController {


    @Autowired
    private PostService postService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @PostMapping("/create")
    public String createPost(
            @RequestParam String content,
            @RequestParam String category,
            @RequestParam("images") List<MultipartFile> images,
            Authentication authentication) {

        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow();

        postService.createPost(content, category, images, user);

        return "redirect:/feed";}

    @PostMapping("/update")
    @ResponseBody
    public ResponseEntity<?> updatePost(
            @RequestParam Long postId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String content,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication) {

        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username).orElseThrow();

            postService.updatePost(postId, category, content, images, user);
            return ResponseEntity.ok("success");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating post: " + e.getMessage());
        }
    }

    @PostMapping("/delete")
    @ResponseBody
    public ResponseEntity<?> deletePost(@RequestParam Long postId, Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username).orElseThrow();

            postService.deletePost(postId, user);
            return ResponseEntity.ok("success");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting post: " + e.getMessage());
        }
    }

}

