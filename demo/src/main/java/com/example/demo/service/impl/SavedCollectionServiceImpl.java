package com.example.demo.service.impl;

import com.example.demo.model.Post;
import com.example.demo.model.SavedCollection;
import com.example.demo.model.SavedPost;
import com.example.demo.model.User;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.SavedCollectionRepository;
import com.example.demo.repository.SavedPostRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.SavedCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SavedCollectionServiceImpl implements SavedCollectionService {

    @Autowired
    private SavedCollectionRepository collectionRepository;

    @Autowired
    private SavedPostRepository savedPostRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Override
    public List<SavedCollection> getUserCollections(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        return collectionRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Override
    public SavedCollection createCollection(String username, String name) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        SavedCollection collection = new SavedCollection();
        collection.setName(name);
        collection.setUser(user);
        return collectionRepository.save(collection);
    }

    @Override
    public void togglePostInCollection(String username, Long collectionId, Long postId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        SavedCollection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Thư mục không tồn tại"));

        if (!collection.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Không có quyền thao tác trên thư mục này");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại"));

        if (post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không thể lưu bài viết của chính mình");
        }

        Optional<SavedPost> existingSavedPost = savedPostRepository.findByCollectionAndPost(collection, post);

        if (existingSavedPost.isPresent()) {
            savedPostRepository.delete(existingSavedPost.get());
        } else {
            SavedPost savedPost = new SavedPost();
            savedPost.setCollection(collection);
            savedPost.setPost(post);
            savedPostRepository.save(savedPost);
        }
    }

    @Override
    public boolean isPostSavedInCollection(Long collectionId, Long postId) {
        SavedCollection collection = collectionRepository.findById(collectionId).orElse(null);
        Post post = postRepository.findById(postId).orElse(null);
        if (collection == null || post == null) return false;
        return savedPostRepository.existsByCollectionAndPost(collection, post);
    }

    @Override
    public List<Post> getPostsByCollectionId(Long collectionId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        SavedCollection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Thư mục không tồn tại"));

        if (!collection.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Không có quyền xem thư mục này");
        }

        return collection.getSavedPosts().stream()
                .map(SavedPost::getPost)
                .filter(post -> !post.getUser().getId().equals(user.getId()))
                .toList();
    }
}

