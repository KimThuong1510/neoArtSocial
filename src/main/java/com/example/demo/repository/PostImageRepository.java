package com.example.demo.repository;

import com.example.demo.model.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PostImageRepository extends JpaRepository<PostImage, Long> {
    @Query("""
            select pi
            from PostImage pi
            where pi.post is not null
            order by coalesce(pi.likesCount, 0) desc, pi.id desc
            """)
    List<PostImage> findTopFeatured(org.springframework.data.domain.Pageable pageable);
}
