package com.example.demo.controller;

import com.example.demo.dto.TopicDTO;
import com.example.demo.model.Topic;
import com.example.demo.service.TopicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/topics")
public class TopicRestController {

    @Autowired
    private TopicService topicService;

    @GetMapping("")
    public List<TopicDTO> getAllTopics() {
        return topicService.getAllTopicsWithCount();
    }

    @PostMapping("")
    public Topic createTopic(@RequestBody Topic topic) {
        return topicService.saveTopic(topic);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Topic> updateTopic(@PathVariable Long id, @RequestBody Topic topicDetails) {
        try {
            Topic updatedTopic = topicService.updateTopic(id, topicDetails);
            return ResponseEntity.ok(updatedTopic);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTopic(@PathVariable Long id) {
        try {
            topicService.deleteTopic(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
