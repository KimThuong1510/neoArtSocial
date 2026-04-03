package com.example.demo.service;

import com.example.demo.dto.TopicDTO;
import com.example.demo.model.Topic;

import java.util.List;

public interface TopicService {
    List<TopicDTO> getAllTopicsWithCount();
    Topic saveTopic(Topic topic);
    Topic updateTopic(Long id, Topic topicDetails);
    void deleteTopic(Long id);
    Topic getTopicById(Long id);
}
