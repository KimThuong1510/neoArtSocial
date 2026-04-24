package com.example.demo.repository;

import com.example.demo.model.Conversation;
import com.example.demo.model.ConversationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByUserA_IdAndUserB_Id(Long userAId, Long userBId);

    @Query("""
            select c from Conversation c
            where (c.userA.id = :userId or c.userB.id = :userId)
              and c.status = :status
            order by coalesce(c.lastMessageAt, c.createdAt) desc
            """)
    List<Conversation> findForUserByStatus(@Param("userId") Long userId, @Param("status") ConversationStatus status);

    @Query("""
            select c from Conversation c
            where (c.userA.id = :userId or c.userB.id = :userId)
              and c.status = com.example.demo.model.ConversationStatus.REQUEST
            order by coalesce(c.lastMessageAt, c.createdAt) desc
            """)
    List<Conversation> findRequestsForUser(@Param("userId") Long userId);
}

