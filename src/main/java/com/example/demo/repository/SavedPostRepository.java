package com.example.demo.repository;

import com.example.demo.model.Post;
import com.example.demo.model.SavedCollection;
import com.example.demo.model.SavedPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {
    boolean existsByCollectionAndPost(SavedCollection collection, Post post);
    Optional<SavedPost> findByCollectionAndPost(SavedCollection collection, Post post);
    boolean existsByCollectionUserUsernameAndPostId(String username, Long postId);
    void deleteByPost_Id(Long postId);
}
