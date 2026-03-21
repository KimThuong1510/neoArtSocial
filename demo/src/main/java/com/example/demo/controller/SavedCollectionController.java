package com.example.demo.controller;

import com.example.demo.model.SavedCollection;
import com.example.demo.service.SavedCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/collections")
public class SavedCollectionController {

    @Autowired
    private SavedCollectionService collectionService;

    @GetMapping
    public ResponseEntity<?> getUserCollections(Authentication authentication, @RequestParam(required = false) Long postId) {
        try {
            String username = authentication.getName();
            List<SavedCollection> collections = collectionService.getUserCollections(username);

            List<Map<String, Object>> response = collections.stream().map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("name", c.getName());
                if (postId != null) {
                    map.put("isSaved", collectionService.isPostSavedInCollection(c.getId(), postId));
                }
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createCollection(Authentication authentication, @RequestBody Map<String, String> request) {
        try {
            String username = authentication.getName();
            String name = request.get("name");
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tên thư mục không được để trống"));
            }
            SavedCollection newCollection = collectionService.createCollection(username, name);
            return ResponseEntity.ok(Map.of(
                    "id", newCollection.getId(),
                    "name", newCollection.getName(),
                    "message", "Đã tạo thư mục thành công"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{collectionId}/toggle")
    public ResponseEntity<?> togglePostInCollection(Authentication authentication,
                                                    @PathVariable Long collectionId,
                                                    @RequestBody Map<String, Long> request) {
        try {
            String username = authentication.getName();
            Long postId = request.get("postId");
            if (postId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu ID bài viết"));
            }
            collectionService.togglePostInCollection(username, collectionId, postId);

            boolean isSavedNow = collectionService.isPostSavedInCollection(collectionId, postId);
            String message = isSavedNow ? "Đã lưu vào thư mục" : "Đã xoá khỏi thư mục";

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "isSaved", isSavedNow,
                    "message", message
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{collectionId}/posts")
    public ResponseEntity<?> getPostsByCollectionId(Authentication authentication, @PathVariable Long collectionId) {
        try {
            String username = authentication.getName();
            List<com.example.demo.model.Post> posts = collectionService.getPostsByCollectionId(collectionId, username);

            List<Map<String, Object>> response = posts.stream().map(post -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", post.getId());
                map.put("content", post.getContent());

                if (post.getUser() != null) {
                    Map<String, Object> authorMap = new HashMap<>();
                    authorMap.put("username", post.getUser().getUsername());
                    authorMap.put("avatar", post.getUser().getAvatar() != null ? post.getUser().getAvatar() : "https://i.pravatar.cc/150?u=9");
                    map.put("author", authorMap);
                }

                if (post.getImages() != null && !post.getImages().isEmpty()) {
                    List<Map<String, Object>> imagesData = new java.util.ArrayList<>();
                    for (int i = 0; i < post.getImages().size(); i++) {
                        Map<String, Object> imgMap = new HashMap<>();
                        imgMap.put("url", post.getImages().get(i).getFilePath());
                        imgMap.put("likes", 130 + (i * 7));
                        imgMap.put("comments", 30 + (i * 5));
                        imagesData.add(imgMap);
                    }
                    map.put("images", imagesData);
                    map.put("image", post.getImages().get(0).getFilePath());

                    map.put("likes", 130);
                    map.put("comments", 30);
                } else {
                    map.put("image", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee");
                    map.put("images", java.util.List.of(Map.of("url", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee", "likes", 130, "comments", 30)));
                    map.put("likes", 130);
                    map.put("comments", 30);
                }

                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
