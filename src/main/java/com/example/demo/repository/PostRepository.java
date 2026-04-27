package com.example.demo.repository;

import com.example.demo.model.Post;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUser(User user);

    @Query("SELECT p FROM Post p WHERE " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.topic.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.user.username) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Post> searchPosts(@Param("keyword") String keyword);
    List<Post> findByUserAndTopicCode(User user, String topicCode);
    long countByTopicId(Long topicId);
    long countByUser(User user);
    List<Post> findByTopicIdAndIdNot(Long topicId, Long postId);

    @Query("SELECT new com.example.demo.dto.FeaturedPostDto(p.id, MIN(i.filePath), COUNT(DISTINCT l.id)) " +
           "FROM Post p " +
           "LEFT JOIN p.images i " +
           "LEFT JOIN PostLike l ON p.id = l.post.id " +
           "GROUP BY p.id " +
           "HAVING COUNT(i) > 0 " +
           "ORDER BY COUNT(DISTINCT l.id) DESC, p.id DESC")
    List<com.example.demo.dto.FeaturedPostDto> findTopFeaturedPosts(org.springframework.data.domain.Pageable pageable);
}
