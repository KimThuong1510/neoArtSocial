package com.example.demo.repository;

import com.example.demo.model.GroupMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {
    @Query("""
            select gm from GroupMessage gm
            where gm.group.id = :groupId
            order by gm.createdAt asc
            """)
    List<GroupMessage> findByGroupIdOrderByCreatedAtAsc(@Param("groupId") Long groupId);

    @Query("""
            select gm from GroupMessage gm
            where gm.group.id = :groupId
              and (:before is null or gm.createdAt <= :before)
            order by gm.createdAt asc
            """)
    List<GroupMessage> findByGroupIdBefore(@Param("groupId") Long groupId, @Param("before") LocalDateTime before);

    @Query("""
            select count(gm) from GroupMessage gm
            where gm.group.id = :groupId
              and gm.sender.id <> :userId
              and gm.createdAt > :lastReadAt
            """)
    long countUnreadForUser(@Param("groupId") Long groupId, @Param("userId") Long userId, @Param("lastReadAt") LocalDateTime lastReadAt);

    void deleteByGroup_Id(Long groupId);
}

