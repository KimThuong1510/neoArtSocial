package com.example.demo.repository;

import com.example.demo.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    Optional<GroupMember> findByGroup_IdAndUser_Id(Long groupId, Long userId);

    List<GroupMember> findByGroup_Id(Long groupId);

    @Query("""
            select gm from GroupMember gm
            where gm.group.id = :groupId and gm.active = true
            """)
    List<GroupMember> findActiveByGroup(@Param("groupId") Long groupId);

    long countByGroup_IdAndActiveTrue(Long groupId);

    @Modifying
    @Query("""
            update GroupMember gm
            set gm.lastReadAt = :readAt
            where gm.group.id = :groupId and gm.user.id = :userId and gm.active = true
            """)
    int markRead(@Param("groupId") Long groupId, @Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);

    void deleteByGroup_Id(Long groupId);
}

