package com.example.demo.controller;

import com.example.demo.dto.PasswordChangeRequest;
import com.example.demo.model.Post;
import com.example.demo.model.SavedCollection;
import com.example.demo.model.SavedPost;
import com.example.demo.model.User;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.TopicRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.SavedCollectionService;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;

@Controller
@RequestMapping("/profile")
public class ProfileController {

    private static final String AVATAR_DIR = "uploads/avatar/";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private SavedCollectionService savedCollectionService;

    @GetMapping("")
    public String profilePage(Authentication authentication,
                               @RequestParam(value = "category", required = false) String category,
                               Model model) {
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return "redirect:/logout";
        }
        User user = userOpt.get();
        if (user.getAvatar() != null && !avatarFileExists(user.getAvatar())) {
            user.setAvatar(null);
        }

        List<Post> myPosts;
        if (category != null && !category.trim().isEmpty()) {
            myPosts = postRepository.findByUserAndTopicCode(user, category);
            model.addAttribute("selectedCategory", category);
        } else {
            myPosts = postRepository.findByUser(user);
        }

        List<SavedCollection> collections = savedCollectionService.getUserCollections(username);

        List<Map<String, Object>> savedCollections = collections.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            String coverImage = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"; // Default
            if (c.getSavedPosts() != null && !c.getSavedPosts().isEmpty()) {
                Optional<SavedPost> firstSavedNotOwn = c.getSavedPosts().stream()
                        .filter(sp -> !sp.getPost().getUser().getId().equals(user.getId()))
                        .findFirst();
                if (firstSavedNotOwn.isPresent()) {
                    Post post = firstSavedNotOwn.get().getPost();
                    if (post.getImages() != null && !post.getImages().isEmpty()) {
                        coverImage = post.getImages().get(0).getFilePath();
                    }
                }
            }
            map.put("coverImage", coverImage);
            return map;
        }).toList();

        model.addAttribute("user", user);
        model.addAttribute("myPosts", myPosts);
        model.addAttribute("savedCollections", savedCollections);
        model.addAttribute("topics", topicRepository.findAll());

        return "profilePage/profilePage";
    }

    private boolean avatarFileExists(String avatarPath) {
        if (avatarPath == null || !avatarPath.startsWith("/uploads/")) {
            return false;
        }

        String relativeUploadPath = avatarPath.substring("/uploads/".length());
        Path currentUploads = Paths.get("uploads").resolve(relativeUploadPath).toAbsolutePath().normalize();
        Path parentUploads = Paths.get("..", "uploads").resolve(relativeUploadPath).toAbsolutePath().normalize();

        return Files.exists(currentUploads) || Files.exists(parentUploads);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateProfile(Authentication authentication,
                                           @RequestParam String nickname,
                                           @RequestParam String birthDate,
                                           @RequestParam(required = false) MultipartFile avatar) {
        String currentUsername = authentication.getName();
        User user = userRepository.findByUsername(currentUsername).orElseThrow();

        Map<String, String> response = new HashMap<>();

        if (!user.getNickname().equals(nickname) && userRepository.existsByNicknameAndIdNot(nickname, user.getId())) {
            response.put("error", "Biệt danh đã tồn tại!");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            user.setNickname(nickname);
            user.setBirthDate(LocalDate.parse(birthDate));

            if (avatar != null && !avatar.isEmpty()) {
                String fileName = UUID.randomUUID() + "_" + avatar.getOriginalFilename();
                Path uploadPath = Paths.get(AVATAR_DIR);

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Path filePath = uploadPath.resolve(fileName);
                Files.write(filePath, avatar.getBytes());
                user.setAvatar("/uploads/avatar/" + fileName);
            }

            userRepository.save(user);

            response.put("message", "Cập nhật thông tin thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Đã xảy ra lỗi khi cập nhật!");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(Authentication authentication,
                                          @RequestParam("avatar") MultipartFile avatar) {
        Map<String, String> response = new HashMap<>();
        try {
            if (avatar == null || avatar.isEmpty()) {
                response.put("error", "Vui lòng chọn ảnh avatar.");
                return ResponseEntity.badRequest().body(response);
            }

            String currentUsername = authentication.getName();
            User user = userRepository.findByUsername(currentUsername).orElseThrow();

            String fileName = UUID.randomUUID() + "_" + avatar.getOriginalFilename();
            Path uploadPath = Paths.get(AVATAR_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, avatar.getBytes());

            String avatarUrl = "/uploads/avatar/" + fileName;
            user.setAvatar(avatarUrl);
            userRepository.save(user);

            response.put("message", "Cập nhật avatar thành công!");
            response.put("avatarUrl", avatarUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Không thể tải avatar lên. Vui lòng thử lại.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication authentication, @RequestBody PasswordChangeRequest request) {
        Map<String, String> response = new HashMap<>();
        try {
            userService.changePassword(authentication.getName(), request);
            response.put("message", "Thay đổi mật khẩu thành công");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("error", "Đã xảy ra lỗi hệ thống!");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}

