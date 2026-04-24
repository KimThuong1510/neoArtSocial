package com.example.demo.repository;

import com.example.demo.model.GroupChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupChatRepository extends JpaRepository<GroupChat, Long> {
    @Query("""
            select g from GroupChat g
            join GroupMember gm on gm.group.id = g.id
            where gm.user.id = :userId and gm.active = true
            order by coalesce(g.lastMessageAt, g.createdAt) desc
            """)
    List<GroupChat> findVisibleForUser(@Param("userId") Long userId);
}

