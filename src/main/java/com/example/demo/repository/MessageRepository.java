package com.example.demo.repository;

import com.example.demo.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
            select m from Message m
            where m.conversation.id = :conversationId
            order by m.createdAt asc
            """)
    List<Message> findByConversationIdOrderByCreatedAtAsc(@Param("conversationId") Long conversationId);

    @Query("""
            select count(m) from Message m
            where m.conversation.id = :conversationId
              and m.isRead = false
              and m.sender.id <> :userId
            """)
    long countUnreadForConversationAndUser(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    @Query("""
            select count(m) from Message m
            where (m.conversation.userA.id = :userId or m.conversation.userB.id = :userId)
              and m.isRead = false
              and m.sender.id <> :userId
            """)
    long countTotalUnreadForUser(@Param("userId") Long userId);

    @Modifying
    @Query("""
            update Message m
            set m.isRead = true, m.readAt = :readAt
            where m.conversation.id = :conversationId
              and m.isRead = false
              and m.sender.id <> :userId
            """)
    int markConversationRead(@Param("conversationId") Long conversationId,
                             @Param("userId") Long userId,
                             @Param("readAt") LocalDateTime readAt);

    void deleteByConversation_Id(Long conversationId);
}

