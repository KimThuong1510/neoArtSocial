package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.model.User;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    boolean existsByNicknameAndIdNot(String nickname, Long id);
    Optional<User> findByUsername(String username);

    @Query("""
            select u from User u
            where u.id <> :currentUserId
              and lower(u.role) not like '%admin%'
              and (lower(u.username) like lower(concat('%', :q, '%'))
                   or lower(u.nickname) like lower(concat('%', :q, '%')))
            order by u.username asc
            """)
    List<User> searchNonAdminUsers(@Param("q") String q, @Param("currentUserId") Long currentUserId);
}
