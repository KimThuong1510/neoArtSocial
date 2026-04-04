package com.example.demo.repository;

import com.example.demo.model.Comment;
import com.example.demo.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostAndParentIsNullOrderByCreatedAtAsc(Post post);

    List<Comment> findByParentOrderByCreatedAtAsc(Comment parent);

    long countByPost(Post post);
}
