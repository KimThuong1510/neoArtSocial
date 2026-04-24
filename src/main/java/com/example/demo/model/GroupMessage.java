package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_messages",
        indexes = @Index(name = "idx_group_msg_group_created", columnList = "group_id,created_at"))
@Data
public class GroupMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private GroupChat group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_id", nullable = true)
    private User sender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private MessageType type = MessageType.TEXT;

    @Lob
    @Column(nullable = false)
    private String contentEnc;

    @Column(nullable = false, length = 64)
    private String contentIv;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}

