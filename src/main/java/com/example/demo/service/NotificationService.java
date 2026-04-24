package com.example.demo.service;

import com.example.demo.dto.NotificationResponse;
import com.example.demo.model.*;
import com.example.demo.repository.UserNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final UserNotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static String actorLabel(User user) {
        if (user.getNickname() != null && !user.getNickname().isBlank()) {
            return user.getNickname();
        }
        return user.getUsername();
    }

    @Transactional
    public void notifyPostLiked(User liker, Post post) {
        User owner = post.getUser();
        if (owner == null || owner.getId().equals(liker.getId())) {
            return;
        }
        String content = actorLabel(liker) + " liked your post";
        saveAndPush(liker, owner, post.getId(), NotificationType.LIKE, content);
    }

    @Transactional
    public void notifyPostCommented(User commenter, Post post, String commentPreview) {
        User owner = post.getUser();
        if (owner == null || owner.getId().equals(commenter.getId())) {
            return;
        }
        String preview = commentPreview == null ? "" : commentPreview.trim();
        if (preview.length() > 120) {
            preview = preview.substring(0, 117) + "...";
        }
        String content = actorLabel(commenter) + " commented on your post";
        if (!preview.isEmpty()) {
            content += ": " + preview;
        }
        saveAndPush(commenter, owner, post.getId(), NotificationType.COMMENT, content);
    }

    private void saveAndPush(User sender, User receiver, Long postId, NotificationType type, String content) {
        UserNotification n = new UserNotification();
        n.setSender(sender);
        n.setReceiver(receiver);
        n.setPostId(postId);
        n.setType(type);
        n.setContent(content);
        n.setSeen(false);
        n = notificationRepository.save(n);
        NotificationResponse dto = toDto(n);
        messagingTemplate.convertAndSend("/topic/notifications." + receiver.getId(), dto);
    }

    @Transactional(readOnly = true)
    public long unreadCount(User receiver) {
        return notificationRepository.countByReceiverAndSeenIsFalse(receiver);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> listForUser(User receiver, int page, int size) {
        return notificationRepository
                .findByReceiverOrderByCreatedAtDesc(receiver, PageRequest.of(page, size))
                .map(this::toDto);
    }

    @Transactional
    public void markRead(Long notificationId, User currentUser) {
        UserNotification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!n.getReceiver().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Forbidden");
        }
        n.setSeen(true);
    }

    @Transactional
    public int markAllRead(User currentUser) {
        return notificationRepository.markAllReadForReceiver(currentUser);
    }

    private NotificationResponse toDto(UserNotification n) {
        User s = n.getSender();
        return NotificationResponse.builder()
                .id(n.getId())
                .postId(n.getPostId())
                .type(n.getType())
                .content(n.getContent())
                .read(n.isSeen())
                .createdAt(n.getCreatedAt())
                .senderUsername(s.getUsername())
                .senderNickname(s.getNickname())
                .senderAvatar(s.getAvatar())
                .build();
    }
}
