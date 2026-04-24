package com.example.demo.repository;

import com.example.demo.model.User;
import com.example.demo.model.UserNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {

    Page<UserNotification> findByReceiverOrderByCreatedAtDesc(User receiver, Pageable pageable);

    long countByReceiverAndSeenIsFalse(User receiver);

    @Modifying
    @Query("UPDATE UserNotification n SET n.seen = true WHERE n.receiver = :receiver AND n.seen = false")
    int markAllReadForReceiver(@Param("receiver") User receiver);
}
