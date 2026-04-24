package com.example.demo.repository;

import com.example.demo.model.Post;
import com.example.demo.model.PostLike;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    long countByPost(Post post);
    boolean existsByPostAndUser(Post post, User user);
    Optional<PostLike> findByPostAndUser(Post post, User user);
    void deleteByPostAndUser(Post post, User user);
    List<PostLike> findByPostOrderByCreatedAtAsc(Post post);
}
