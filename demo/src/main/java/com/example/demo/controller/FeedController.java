package com.example.demo.controller;

import com.example.demo.model.Post;
import com.example.demo.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Optional;

@Controller
@RequestMapping("/feed")
public class FeedController {
    @Autowired
    private PostRepository postRepository;

    @GetMapping("")
    public String feed(Model model) {
        model.addAttribute("posts", postRepository.findAll());
        return "feedPage/feedHome";
    }

    @GetMapping("/{postId}")
    public String feedDetail(@PathVariable Long postId, Model model) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) {
            return "redirect:/feed";
        }
        Post post = postOpt.get();
        model.addAttribute("post", post);
        return "feedPage/feedDetail";
    }
}
