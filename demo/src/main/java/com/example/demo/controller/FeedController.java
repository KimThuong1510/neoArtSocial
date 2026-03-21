package com.example.demo.controller;

import com.example.demo.model.Post;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.SavedPostRepository;
import com.example.demo.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
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

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private SavedPostRepository savedPostRepository;

    @GetMapping("")
    public String feed(Model model) {
        model.addAttribute("posts", postRepository.findAll());
        model.addAttribute("topics", topicRepository.findAll());
        return "feedPage/feedHome";
    }

    @GetMapping("/{postId}")
    public String feedDetail(@PathVariable Long postId, Model model, Authentication authentication) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) {
            return "redirect:/feed";
        }
        Post post = postOpt.get();
        boolean isSavedByUser = false;
        if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
            isSavedByUser = savedPostRepository.existsByCollectionUserUsernameAndPostId(authentication.getName(), postId);
        }
        model.addAttribute("post", post);
        model.addAttribute("isSavedByUser", isSavedByUser);
        return "feedPage/feedDetail";
    }
}
