package com.example.demo.controller;

import com.example.demo.model.Post;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.SavedPostRepository;
import com.example.demo.repository.TopicRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
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

    @Autowired
    private UserRepository userRepository;

    @GetMapping("")
    public String feed(@RequestParam(value = "keyword", required = false) String keyword, Model model, Authentication authentication) {
        List<Post> posts;
        if (keyword != null && !keyword.trim().isEmpty()) {
            posts = postRepository.searchPosts(keyword);
            model.addAttribute("keyword", keyword);
        } else {
            posts = postRepository.findAll();
        }
        model.addAttribute("posts", posts);
        model.addAttribute("topics", topicRepository.findAll());
        if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
            userRepository.findByUsername(authentication.getName())
                    .ifPresent(currentUser -> model.addAttribute("currentUser", currentUser));
        }
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
            userRepository.findByUsername(authentication.getName())
                    .ifPresent(currentUser -> model.addAttribute("currentUser", currentUser));
        }
        model.addAttribute("post", post);
        model.addAttribute("isSavedByUser", isSavedByUser);
        model.addAttribute("topics", topicRepository.findAll());
        
        List<Post> relatedPosts = java.util.Collections.emptyList();
        if (post.getTopic() != null) {
            relatedPosts = postRepository.findByTopicIdAndIdNot(post.getTopic().getId(), post.getId());
        }
        model.addAttribute("relatedPosts", relatedPosts);
        
        return "feedPage/feedDetail";
    }
}
