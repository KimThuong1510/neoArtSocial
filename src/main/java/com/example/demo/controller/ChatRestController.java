package com.example.demo.controller;

import com.example.demo.dto.ChatUserSearchDto;
import com.example.demo.dto.ConversationDto;
import com.example.demo.dto.CreateGroupRequest;
import com.example.demo.dto.GroupChatDto;
import com.example.demo.dto.GroupMessageRequest;
import com.example.demo.dto.MessageDto;
import com.example.demo.dto.SendMessageRequest;
import com.example.demo.dto.UnreadSummaryDto;
import com.example.demo.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {
    private static final String CHAT_UPLOAD_DIR = "uploads/chat/";
    private static final String GROUP_AVATAR_UPLOAD_DIR = "uploads/chat/group-avatar/";

    private final ChatService chatService;

    @GetMapping("/users/search")
    public ResponseEntity<List<ChatUserSearchDto>> searchUsers(@RequestParam("q") String q, Authentication authentication) {
        return ResponseEntity.ok(chatService.searchUsers(q, authentication.getName()));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDto>> listConversations(@RequestParam("tab") String tab, Authentication authentication) {
        if ("direct".equalsIgnoreCase(tab)) {
            return ResponseEntity.ok(chatService.listDirectConversations(authentication.getName()));
        }
        if ("requests".equalsIgnoreCase(tab)) {
            return ResponseEntity.ok(chatService.listRequestConversations(authentication.getName()));
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/conversations/with/{otherUserId}")
    public ResponseEntity<ConversationDto> getOrCreate(@PathVariable Long otherUserId, Authentication authentication) {
        return ResponseEntity.ok(chatService.getOrCreateConversation(authentication.getName(), otherUserId));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<MessageDto>> listMessages(@PathVariable Long conversationId, Authentication authentication) {
        return ResponseEntity.ok(chatService.listMessages(authentication.getName(), conversationId));
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageDto> send(@RequestBody SendMessageRequest req, Authentication authentication) {
        return ResponseEntity.ok(chatService.sendMessage(authentication.getName(), req));
    }

    @PostMapping("/conversations/{conversationId}/accept")
    public ResponseEntity<ConversationDto> accept(@PathVariable Long conversationId, Authentication authentication) {
        return ResponseEntity.ok(chatService.acceptRequest(authentication.getName(), conversationId));
    }

    @PostMapping("/conversations/{conversationId}/reject")
    public ResponseEntity<Void> reject(@PathVariable Long conversationId, Authentication authentication) {
        chatService.rejectRequest(authentication.getName(), conversationId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Map<String, Object>> markRead(@PathVariable Long conversationId, Authentication authentication) {
        int marked = chatService.markConversationRead(authentication.getName(), conversationId);
        long totalUnread = chatService.totalUnreadCount(authentication.getName());
        return ResponseEntity.ok(Map.of("marked", marked, "totalUnread", totalUnread));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> totalUnread(Authentication authentication) {
        return ResponseEntity.ok(Map.of("totalUnread", chatService.totalUnreadCount(authentication.getName())));
    }

    @GetMapping("/unread-summary")
    public ResponseEntity<UnreadSummaryDto> unreadSummary(Authentication authentication) {
        return ResponseEntity.ok(chatService.unreadSummary(authentication.getName()));
    }

    @GetMapping("/groups")
    public ResponseEntity<List<GroupChatDto>> listGroups(Authentication authentication) {
        return ResponseEntity.ok(chatService.listGroups(authentication.getName()));
    }

    @GetMapping("/groups/{groupId}/messages")
    public ResponseEntity<List<MessageDto>> groupMessages(@PathVariable Long groupId, Authentication authentication) {
        return ResponseEntity.ok(chatService.listGroupMessages(authentication.getName(), groupId));
    }

    @PostMapping("/groups")
    public ResponseEntity<GroupChatDto> createGroup(@RequestBody CreateGroupRequest request, Authentication authentication) {
        return ResponseEntity.ok(chatService.createGroup(authentication.getName(), request));
    }

    @GetMapping("/groups/friends/search")
    public ResponseEntity<List<ChatUserSearchDto>> searchFriends(@RequestParam("q") String q, Authentication authentication) {
        return ResponseEntity.ok(chatService.searchFriendUsersForGroup(q, authentication.getName()));
    }

    @GetMapping("/groups/{groupId}/members/search")
    public ResponseEntity<List<ChatUserSearchDto>> searchAddable(@PathVariable Long groupId, @RequestParam("q") String q, Authentication authentication) {
        return ResponseEntity.ok(chatService.searchAddableFriendUsersForGroup(groupId, q, authentication.getName()));
    }

    @GetMapping("/groups/{groupId}/members")
    public ResponseEntity<?> listMembers(@PathVariable Long groupId, Authentication authentication) {
        return ResponseEntity.ok(chatService.listGroupMembers(authentication.getName(), groupId));
    }

    @PostMapping("/groups/{groupId}/members")
    public ResponseEntity<Void> addMembers(@PathVariable Long groupId, @RequestBody Map<String, List<Long>> body, Authentication authentication) {
        chatService.addGroupMembers(authentication.getName(), groupId, body.getOrDefault("userIds", List.of()));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/groups/{groupId}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long groupId, @PathVariable Long userId, Authentication authentication) {
        chatService.removeGroupMember(authentication.getName(), groupId, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/groups/{groupId}/name")
    public ResponseEntity<GroupChatDto> renameGroup(@PathVariable Long groupId, @RequestBody Map<String, String> body, Authentication authentication) {
        return ResponseEntity.ok(chatService.updateGroupName(authentication.getName(), groupId, body.get("name")));
    }

    @PatchMapping("/groups/{groupId}/avatar")
    public ResponseEntity<GroupChatDto> updateGroupAvatar(@PathVariable Long groupId, @RequestBody Map<String, String> body, Authentication authentication) {
        return ResponseEntity.ok(chatService.updateGroupAvatar(authentication.getName(), groupId, body.get("avatar")));
    }

    @PostMapping("/groups/{groupId}/avatar-upload")
    public ResponseEntity<GroupChatDto> uploadGroupAvatar(@PathVariable Long groupId,
                                                          @RequestParam("avatar") MultipartFile avatar,
                                                          Authentication authentication) {
        try {
            if (avatar == null || avatar.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            String original = avatar.getOriginalFilename();
            String ext = StringUtils.getFilenameExtension(original);
            String fileName = UUID.randomUUID() + (ext != null && !ext.isBlank() ? ("." + ext) : "");

            Path uploadPath = Paths.get(GROUP_AVATAR_UPLOAD_DIR);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, avatar.getBytes());

            String avatarUrl = "/uploads/chat/group-avatar/" + fileName;
            return ResponseEntity.ok(chatService.updateGroupAvatar(authentication.getName(), groupId, avatarUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/groups/{groupId}/leave-or-delete")
    public ResponseEntity<Void> leaveOrDelete(@PathVariable Long groupId, @RequestBody(required = false) Map<String, Long> body, Authentication authentication) {
        Long transferTo = body == null ? null : body.get("transferAdminToUserId");
        chatService.deleteOrLeaveGroup(authentication.getName(), groupId, transferTo);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/groups/{groupId}/read")
    public ResponseEntity<Void> markGroupRead(@PathVariable Long groupId, Authentication authentication) {
        chatService.markGroupRead(authentication.getName(), groupId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/groups/messages")
    public ResponseEntity<MessageDto> sendGroupMessage(@RequestBody GroupMessageRequest req, Authentication authentication) {
        return ResponseEntity.ok(chatService.sendGroupMessage(authentication.getName(), req));
    }

    @PostMapping("/upload-media")
    public ResponseEntity<Map<String, String>> uploadMedia(@RequestParam("file") MultipartFile image) {
        try {
            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Empty file"));
            }
            String original = image.getOriginalFilename();
            String ext = StringUtils.getFilenameExtension(original);
            String fileName = UUID.randomUUID() + (ext != null && !ext.isBlank() ? ("." + ext) : "");

            Path uploadPath = Paths.get(CHAT_UPLOAD_DIR);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, image.getBytes());

            return ResponseEntity.ok(Map.of("url", "/uploads/chat/" + fileName));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Upload failed"));
        }
    }

    // Backward compatible for current image sender
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("image") MultipartFile image) {
        return uploadMedia(image);
    }
}

