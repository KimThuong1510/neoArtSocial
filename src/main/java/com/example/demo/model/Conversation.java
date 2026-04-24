package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "conversations",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_conversation_user_pair", columnNames = {"user_a_id", "user_b_id"})
        },
        indexes = {
                @Index(name = "idx_conversation_user_a_status", columnList = "user_a_id,status"),
                @Index(name = "idx_conversation_user_b_status", columnList = "user_b_id,status"),
                @Index(name = "idx_conversation_last_message_at", columnList = "last_message_at")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Canonical participant ordering to enforce uniqueness:
     * userA.id < userB.id
     */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_a_id", nullable = false)
    private User userA;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_b_id", nullable = false)
    private User userB;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ConversationStatus status = ConversationStatus.REQUEST;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_user_id")
    private User requestedBy;

    @Column(name = "last_message_preview", length = 500)
    private String lastMessagePreview;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public boolean involvesUser(Long userId) {
        if (userId == null) return false;
        return (userA != null && userA.getId().equals(userId)) || (userB != null && userB.getId().equals(userId));
    }

    public User otherParticipant(Long userId) {
        if (userId == null) return null;
        if (userA != null && userA.getId().equals(userId)) return userB;
        if (userB != null && userB.getId().equals(userId)) return userA;
        return null;
    }
}

