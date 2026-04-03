package com.example.demo.controller;

import com.example.demo.dto.PostAdminDTO;
import com.example.demo.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private PostService postService;

    @GetMapping("")
    public String adminPage(Model model) {
        List<PostAdminDTO> posts = postService.getAllPostsForAdmin();
        model.addAttribute("posts", posts);
        model.addAttribute("totalPosts", posts.size());
        return "admin/home";
    }

    @GetMapping("/topic")
    public String topicPage() {
        return "admin/topic";
    }
}
