package com.example.demo.service.impl;

import com.example.demo.dto.TopicDTO;
import com.example.demo.model.Topic;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.TopicRepository;
import com.example.demo.service.TopicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TopicServiceImpl implements TopicService {

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private PostRepository postRepository;

    @Override
    public List<TopicDTO> getAllTopicsWithCount() {
        return topicRepository.findAll().stream().map(topic -> {
            long count = postRepository.countByTopicId(topic.getId());
            return new TopicDTO(
                    topic.getId(),
                    topic.getCode(),
                    topic.getName(),
                    topic.getBadge(),
                    count
            );
        }).collect(Collectors.toList());
    }

    @Override
    public Topic saveTopic(Topic topic) {
        return topicRepository.save(topic);
    }

    @Override
    public Topic updateTopic(Long id, Topic topicDetails) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found for id: " + id));
        topic.setName(topicDetails.getName());
        topic.setBadge(topicDetails.getBadge());
        // Code usually shouldn't change as it's the identifier, but we can allow it if needed.
        // For now, let's keep it consistent with the frontend which allows editing the name and color.
        return topicRepository.save(topic);
    }

    @Override
    public void deleteTopic(Long id) {
        if (postRepository.countByTopicId(id) > 0) {
            throw new RuntimeException("Cannot delete topic with active posts");
        }
        topicRepository.deleteById(id);
    }

    @Override
    public Topic getTopicById(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found for id: " + id));
    }
}
