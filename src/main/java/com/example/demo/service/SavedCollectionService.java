package com.example.demo.service;

import com.example.demo.model.Post;
import com.example.demo.model.SavedCollection;
import org.springframework.stereotype.Service;

import java.util.List;

public interface SavedCollectionService {
    List<SavedCollection> getUserCollections(String username);
    SavedCollection createCollection(String username, String name);
    void togglePostInCollection(String username, Long collectionId, Long postId);
    boolean isPostSavedInCollection(Long collectionId, Long postId);
    List<Post> getPostsByCollectionId(Long collectionId, String username);
}
