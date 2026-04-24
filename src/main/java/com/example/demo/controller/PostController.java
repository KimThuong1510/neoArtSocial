package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

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
            @RequestParam(required = false) String content,
            @RequestParam String topic,
            @RequestParam("images") List<MultipartFile> images,
            Authentication authentication) {

        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return "redirect:/logout";
        }
        User user = userOpt.get();
        postService.createPost(content, topic, images, user);
        return "redirect:/feed";
    }

    @PostMapping("/update")
    @ResponseBody
    public ResponseEntity<?> updatePost(
            @RequestParam Long postId,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String content,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication) {

        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("User not authenticated or not found");
            }
            User user = userOpt.get();
            postService.updatePost(postId, topic, content, images, user);
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
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("User not authenticated or not found");
            }
            User user = userOpt.get();

            postService.deletePost(postId, user);
            return ResponseEntity.ok("success");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting post: " + e.getMessage());
        }
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadImage(@RequestParam("imageUrl") String imageUrl) {
        try {
            String cleanPath = imageUrl;
            if (cleanPath.startsWith("/")) {
                cleanPath = cleanPath.substring(1);
            }

            Path filePath = Paths.get(cleanPath).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                String filename = filePath.getFileName().toString();
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}

