package com.example.demo.controller;

import com.example.demo.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

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
}
