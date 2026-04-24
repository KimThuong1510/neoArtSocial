package com.example.demo.service.impl;

import com.example.demo.dto.*;
import com.example.demo.model.Conversation;
import com.example.demo.model.ConversationStatus;
import com.example.demo.model.GroupChat;
import com.example.demo.model.GroupMember;
import com.example.demo.model.GroupMessage;
import com.example.demo.model.GroupStatus;
import com.example.demo.model.Message;
import com.example.demo.model.MessageType;
import com.example.demo.model.User;
import com.example.demo.repository.ConversationRepository;
import com.example.demo.repository.GroupChatRepository;
import com.example.demo.repository.GroupMemberRepository;
import com.example.demo.repository.GroupMessageRepository;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ChatService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final GroupChatRepository groupChatRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupMessageRepository groupMessageRepository;
    private final ChatCryptoService cryptoService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public List<ChatUserSearchDto> searchUsers(String q, String currentUsername) {
        String query = q == null ? "" : q.trim();

        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        List<User> users = userRepository.searchNonAdminUsers(query, me.getId());

        return users.stream().limit(15).map(u -> {
            Optional<Conversation> conv = findConversationBetween(me.getId(), u.getId());
            boolean isFriend = conv.isPresent() && conv.get().getStatus() == ConversationStatus.ACCEPTED;
            return new ChatUserSearchDto(
                    u.getId(),
                    u.getUsername(),
                    u.getNickname(),
                    u.getAvatar(),
                    isFriend ? "Bạn bè" : "Người lạ"
            );
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationDto> listDirectConversations(String currentUsername) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        return conversationRepository.findForUserByStatus(me.getId(), ConversationStatus.ACCEPTED)
                .stream()
                .map(c -> toDto(c, me.getId()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationDto> listRequestConversations(String currentUsername) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        return conversationRepository.findRequestsForUser(me.getId())
                .stream()
                .map(c -> toDto(c, me.getId()))
                .toList();
    }

    @Override
    @Transactional
    public ConversationDto getOrCreateConversation(String currentUsername, Long otherUserId) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        if (otherUserId == null) throw new IllegalArgumentException("otherUserId required");
        if (me.getId().equals(otherUserId)) throw new IllegalArgumentException("Cannot chat yourself");
        User other = userRepository.findById(otherUserId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        if ("ROLE_ADMIN".equalsIgnoreCase(other.getRole()) || "ADMIN".equalsIgnoreCase(other.getRole())) {
            throw new IllegalArgumentException("Cannot chat ADMIN");
        }

        Conversation c = findConversationBetween(me.getId(), otherUserId).orElseGet(() -> {
            Conversation created = new Conversation();
            if (me.getId() < other.getId()) {
                created.setUserA(me);
                created.setUserB(other);
            } else {
                created.setUserA(other);
                created.setUserB(me);
            }
            created.setStatus(ConversationStatus.REQUEST);
            created.setRequestedBy(me);
            created.setLastMessageAt(null);
            created.setLastMessagePreview(null);
            return conversationRepository.save(created);
        });

        if (!c.involvesUser(me.getId())) throw new IllegalStateException("Forbidden");
        return toDto(c, me.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageDto> listMessages(String currentUsername, Long conversationId) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        Conversation c = conversationRepository.findById(conversationId).orElseThrow(() -> new EntityNotFoundException("Conversation not found"));
        if (!c.involvesUser(me.getId())) throw new IllegalStateException("Forbidden");

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(m -> toDto(m))
                .toList();
    }

    @Override
    @Transactional
    public MessageDto sendMessage(String currentUsername, SendMessageRequest request) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        if (request == null) throw new IllegalArgumentException("request required");
        MessageType type = request.getType() == null ? MessageType.TEXT : request.getType();
        String content = request.getContent() == null ? "" : request.getContent().trim();

        boolean contentRequired = type != MessageType.IMAGE;
        if (contentRequired && content.isEmpty()) throw new IllegalArgumentException("Empty message");
        if (type == MessageType.IMAGE && content.isEmpty()) throw new IllegalArgumentException("Image URL required");

        Conversation c;
        if (request.getConversationId() != null) {
            c = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));
        } else if (request.getToUserId() != null) {
            c = conversationRepository.findById(getOrCreateConversation(currentUsername, request.getToUserId()).getId())
                    .orElseThrow();
        } else {
            throw new IllegalArgumentException("conversationId or toUserId required");
        }

        if (!c.involvesUser(me.getId())) throw new IllegalStateException("Forbidden");
        if (c.getStatus() == ConversationStatus.REJECTED) throw new IllegalStateException("Conversation rejected");

        if (c.getStatus() == ConversationStatus.REQUEST
                && c.getRequestedBy() != null
                && !c.getRequestedBy().getId().equals(me.getId())) {
            throw new IllegalStateException("Request not accepted");
        }

        LocalDateTime now = LocalDateTime.now();
        ChatCryptoService.Enc enc = cryptoService.encryptToBase64(content);

        Message m = new Message();
        m.setConversation(c);
        m.setSender(me);
        m.setType(type);
        m.setContentEnc(enc.cipherTextB64());
        m.setContentIv(enc.ivB64());
        m.setRead(false);
        m.setReadAt(null);
        Message saved = messageRepository.save(m);

        c.setLastMessageAt(now);
        c.setLastMessagePreview(buildPreview(type, content));
        conversationRepository.save(c);

        return toDto(saved);
    }

    @Override
    @Transactional
    public ConversationDto acceptRequest(String currentUsername, Long conversationId) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        Conversation c = conversationRepository.findById(conversationId).orElseThrow(() -> new EntityNotFoundException("Conversation not found"));
        if (!c.involvesUser(me.getId())) throw new IllegalStateException("Forbidden");
        if (c.getStatus() != ConversationStatus.REQUEST) return toDto(c, me.getId());
        if (c.getRequestedBy() != null && c.getRequestedBy().getId().equals(me.getId())) {
            throw new IllegalStateException("Requester cannot accept");
        }
        c.setStatus(ConversationStatus.ACCEPTED);
        Conversation saved = conversationRepository.save(c);
        return toDto(saved, me.getId());
    }

    @Override
    @Transactional
    public void rejectRequest(String currentUsername, Long conversationId) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        Conversation c = conversationRepository.findById(conversationId).orElseThrow(() -> new EntityNotFoundException("Conversation not found"));
        if (!c.involvesUser(me.getId())) throw new IllegalStateException("Forbidden");
        if (c.getStatus() != ConversationStatus.REQUEST) throw new IllegalStateException("Not a request");
        if (c.getRequestedBy() != null && c.getRequestedBy().getId().equals(me.getId())) {
            throw new IllegalStateException("Requester cannot reject");
        }
        messageRepository.deleteByConversation_Id(conversationId);
        conversationRepository.delete(c);
    }

    @Override
    @Transactional
    public int markConversationRead(String currentUsername, Long conversationId) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        Conversation c = conversationRepository.findById(conversationId).orElseThrow(() -> new EntityNotFoundException("Conversation not found"));
        if (!c.involvesUser(me.getId())) throw new IllegalStateException("Forbidden");
        return messageRepository.markConversationRead(conversationId, me.getId(), LocalDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public long totalUnreadCount(String currentUsername) {
        return unreadSummary(currentUsername).getTotalUnread();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatUserSearchDto> searchFriendUsersForGroup(String q, String currentUsername) {
        String query = q == null ? "" : q.trim().toLowerCase();
        User me = userRepository.findByUsername(currentUsername).orElseThrow();

        // Lấy tất cả bạn bè (Accepted conversations)
        List<Conversation> friends = conversationRepository.findForUserByStatus(me.getId(), ConversationStatus.ACCEPTED);

        return friends.stream()
                .map(c -> c.otherParticipant(me.getId()))
                .filter(u -> query.isEmpty() ||
                        u.getUsername().toLowerCase().contains(query) ||
                        (u.getNickname() != null && u.getNickname().toLowerCase().contains(query)))
                .map(u -> new ChatUserSearchDto(
                        u.getId(),
                        u.getUsername(),
                        u.getNickname(),
                        u.getAvatar(),
                        "Bạn bè"
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatUserSearchDto> searchAddableFriendUsersForGroup(Long groupId, String q, String currentUsername) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        assertGroupMember(groupId, me.getId(), true);
        var existing = groupMemberRepository.findActiveByGroup(groupId).stream().map(gm -> gm.getUser().getId()).collect(java.util.stream.Collectors.toSet());
        return searchFriendUsersForGroup(q, currentUsername).stream()
                .filter(u -> !existing.contains(u.getId()))
                .toList();
    }

    @Override
    @Transactional
    public GroupChatDto createGroup(String currentUsername, CreateGroupRequest request) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        String name = request == null || request.getName() == null ? "" : request.getName().trim();
        if (name.isEmpty()) throw new IllegalArgumentException("Group name required");
        List<Long> memberIds = request.getMemberIds() == null ? List.of() : request.getMemberIds().stream().distinct().toList();
        if (memberIds.size() < 2) throw new IllegalArgumentException("Group must have at least 3 members including admin");

        GroupChat g = new GroupChat();
        g.setName(name);
        g.setAdmin(me);
        g.setStatus(GroupStatus.ACTIVE);
        GroupChat saved = groupChatRepository.save(g);

        GroupMember meMember = new GroupMember();
        meMember.setGroup(saved);
        meMember.setUser(me);
        meMember.setActive(true);
        meMember.setRemovedByAdmin(false);
        meMember.setLastReadAt(LocalDateTime.now());
        groupMemberRepository.save(meMember);

        List<Long> friendIds = searchFriendUsersForGroup("", currentUsername).stream().map(ChatUserSearchDto::getId).toList();
        for (Long uid : memberIds) {
            if (uid == null || uid.equals(me.getId())) continue;
            if (!friendIds.contains(uid)) continue;
            User u = userRepository.findById(uid).orElse(null);
            if (u == null) continue;
            GroupMember gm = new GroupMember();
            gm.setGroup(saved);
            gm.setUser(u);
            gm.setActive(true);
            gm.setRemovedByAdmin(false);
            gm.setLastReadAt(LocalDateTime.now());
            groupMemberRepository.save(gm);
        }
        return toGroupDto(saved, me.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupChatDto> listGroups(String currentUsername) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        return groupChatRepository.findVisibleForUser(me.getId()).stream().map(g -> toGroupDto(g, me.getId())).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageDto> listGroupMessages(String currentUsername, Long groupId) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        assertGroupMember(groupId, me.getId(), false);
        GroupMember gm = groupMemberRepository.findByGroup_IdAndUser_Id(groupId, me.getId()).orElseThrow();
        LocalDateTime before = gm.isActive() ? null : gm.getLeftAt();
        return groupMessageRepository.findByGroupIdBefore(groupId, before).stream().map(this::toGroupMsgDto).toList();
    }

    @Override
    @Transactional
    public MessageDto sendGroupMessage(String currentUsername, GroupMessageRequest request) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        GroupMember gm = groupMemberRepository.findByGroup_IdAndUser_Id(request.getGroupId(), me.getId()).orElseThrow(() -> new IllegalStateException("Not a group member"));
        if (!gm.isActive()) throw new IllegalStateException("Bạn đã bị quản trị xóa ra khỏi nhóm");
        GroupChat group = gm.getGroup();
        if (group.getStatus() == GroupStatus.INACTIVE) throw new IllegalStateException("Bạn không thể nhắn tin trong nhóm này được");
        String content = request.getContent() == null ? "" : request.getContent().trim();
        if (content.isEmpty()) throw new IllegalArgumentException("Empty message");

        ChatCryptoService.Enc enc = cryptoService.encryptToBase64(content);
        GroupMessage m = new GroupMessage();
        m.setGroup(group);
        m.setSender(me);
        m.setType(request.getType() == null ? MessageType.TEXT : request.getType());
        m.setContentEnc(enc.cipherTextB64());
        m.setContentIv(enc.ivB64());
        GroupMessage saved = groupMessageRepository.save(m);

        group.setLastMessageAt(LocalDateTime.now());
        group.setLastMessagePreview(buildPreview(m.getType(), content));
        groupChatRepository.save(group);
        return toGroupMsgDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupMemberDto> listGroupMembers(String currentUsername, Long groupId) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        assertGroupMember(groupId, me.getId(), true);
        return groupMemberRepository.findActiveByGroup(groupId).stream().map(this::toGroupMemberDto).toList();
    }

    @Override
    @Transactional
    public void addGroupMembers(String currentUsername, Long groupId, List<Long> userIds) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        GroupChat g = groupChatRepository.findById(groupId).orElseThrow();
        if (!g.getAdmin().getId().equals(me.getId())) throw new IllegalStateException("Only admin can add members");
        if (userIds == null || userIds.isEmpty()) return;

        for (Long uid : userIds) {
            GroupMember gm = groupMemberRepository.findByGroup_IdAndUser_Id(groupId, uid).orElse(null);
            if (gm == null) {
                gm = new GroupMember();
                gm.setGroup(g);
                gm.setUser(userRepository.findById(uid).orElseThrow());
            }
            gm.setActive(true);
            gm.setRemovedByAdmin(false);
            gm.setLeftAt(null);
            gm.setLastReadAt(LocalDateTime.now());
            groupMemberRepository.saveAndFlush(gm); // Force flush

            sendSystemMessage(g, (gm.getUser().getNickname() != null ? gm.getUser().getNickname() : gm.getUser().getUsername()) + " đã được thêm vào nhóm", null);
        }
    }

    @Override
    @Transactional
    public void removeGroupMember(String currentUsername, Long groupId, Long userId) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        GroupChat g = groupChatRepository.findById(groupId).orElseThrow();
        if (!g.getAdmin().getId().equals(me.getId())) throw new IllegalStateException("Only admin can remove members");
        GroupMember gm = groupMemberRepository.findByGroup_IdAndUser_Id(groupId, userId).orElseThrow();
        gm.setActive(false);
        gm.setRemovedByAdmin(true);
        gm.setLeftAt(LocalDateTime.now());
        groupMemberRepository.save(gm);

        sendSystemMessage(g, "Quản trị viên đã xóa " + (gm.getUser().getNickname() != null ? gm.getUser().getNickname() : gm.getUser().getUsername()) + " khỏi nhóm", List.of(userId));
    }

    @Override
    @Transactional
    public GroupChatDto updateGroupName(String currentUsername, Long groupId, String name) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        GroupChat g = groupChatRepository.findById(groupId).orElseThrow();
        if (!g.getAdmin().getId().equals(me.getId())) throw new IllegalStateException("Only admin can update group");
        g.setName(name == null ? g.getName() : name.trim());
        return toGroupDto(groupChatRepository.save(g), me.getId());
    }

    @Override
    @Transactional
    public GroupChatDto updateGroupAvatar(String currentUsername, Long groupId, String avatar) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        GroupChat g = groupChatRepository.findById(groupId).orElseThrow();
        if (!g.getAdmin().getId().equals(me.getId())) throw new IllegalStateException("Only admin can update group");
        g.setAvatar(avatar);
        return toGroupDto(groupChatRepository.save(g), me.getId());
    }

    @Override
    @Transactional
    public void deleteOrLeaveGroup(String currentUsername, Long groupId, Long transferAdminToUserId) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        GroupChat g = groupChatRepository.findById(groupId).orElseThrow();
        if (!g.getAdmin().getId().equals(me.getId())) {
            GroupMember gm = groupMemberRepository.findByGroup_IdAndUser_Id(groupId, me.getId()).orElseThrow();
            gm.setActive(false);
            gm.setRemovedByAdmin(false);
            gm.setLeftAt(LocalDateTime.now());
            groupMemberRepository.save(gm);
            sendSystemMessage(g, (me.getNickname() != null ? me.getNickname() : me.getUsername()) + " đã rời nhóm", List.of(me.getId()));
            return;
        }
        if (transferAdminToUserId != null) {
            GroupMember target = groupMemberRepository.findByGroup_IdAndUser_Id(groupId, transferAdminToUserId).orElseThrow();
            if (!target.isActive()) throw new IllegalStateException("Target admin must be active");
            g.setAdmin(target.getUser());
            groupChatRepository.save(g);
            GroupMember meMem = groupMemberRepository.findByGroup_IdAndUser_Id(groupId, me.getId()).orElseThrow();
            meMem.setActive(false);
            meMem.setLeftAt(LocalDateTime.now());
            groupMemberRepository.save(meMem);
            sendSystemMessage(g, (me.getNickname() != null ? me.getNickname() : me.getUsername()) + " đã rời nhóm. " + (target.getUser().getNickname() != null ? target.getUser().getNickname() : target.getUser().getUsername()) + " đã trở thành quản trị viên mới.", List.of(me.getId()));
        } else {
            // Admin xóa nhóm: xóa cứng dữ liệu nhóm khỏi DB.
            groupMessageRepository.deleteByGroup_Id(groupId);
            groupMemberRepository.deleteByGroup_Id(groupId);
            groupChatRepository.delete(g);
        }
    }

    @Override
    @Transactional
    public int markGroupRead(String currentUsername, Long groupId) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        assertGroupMember(groupId, me.getId(), true);
        return groupMemberRepository.markRead(groupId, me.getId(), LocalDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public UnreadSummaryDto unreadSummary(String currentUsername) {
        User me = userRepository.findByUsername(currentUsername).orElseThrow();
        long direct = conversationRepository.findForUserByStatus(me.getId(), ConversationStatus.ACCEPTED)
                .stream().mapToLong(c -> messageRepository.countUnreadForConversationAndUser(c.getId(), me.getId())).sum();
        long req = conversationRepository.findRequestsForUser(me.getId())
                .stream().mapToLong(c -> messageRepository.countUnreadForConversationAndUser(c.getId(), me.getId())).sum();
        long group = groupChatRepository.findVisibleForUser(me.getId()).stream().mapToLong(g -> {
            GroupMember gm = groupMemberRepository.findByGroup_IdAndUser_Id(g.getId(), me.getId()).orElse(null);
            if (gm == null || !gm.isActive()) return 0;
            return groupMessageRepository.countUnreadForUser(g.getId(), me.getId(),
                    gm.getLastReadAt() == null ? LocalDateTime.of(1970,1,1,0,0) : gm.getLastReadAt());
        }).sum();
        return new UnreadSummaryDto(direct, req, group, direct + req + group);
    }

    private Optional<Conversation> findConversationBetween(Long userId1, Long userId2) {
        long a = Math.min(userId1, userId2);
        long b = Math.max(userId1, userId2);
        return conversationRepository.findByUserA_IdAndUserB_Id(a, b);
    }

    private ConversationDto toDto(Conversation c, Long currentUserId) {
        User other = c.otherParticipant(currentUserId);
        long unread = messageRepository.countUnreadForConversationAndUser(c.getId(), currentUserId);
        return new ConversationDto(
                c.getId(),
                c.getStatus(),
                c.getRequestedBy() != null ? c.getRequestedBy().getId() : null,
                other != null ? other.getId() : null,
                other != null ? other.getUsername() : null,
                other != null ? other.getNickname() : null,
                other != null ? other.getAvatar() : null,
                c.getLastMessagePreview(),
                c.getLastMessageAt(),
                unread
        );
    }
    private MessageDto toDto(Message m) {
        String plain = cryptoService.decryptFromBase64(m.getContentEnc(), m.getContentIv());
        return new MessageDto(
                m.getId(),
                m.getConversation() != null ? m.getConversation().getId() : null,
                m.getSender() != null ? m.getSender().getId() : null,
                m.getType(),
                plain,
                m.isRead(),
                m.getReadAt(),
                m.getCreatedAt(),
                m.getSender() != null ? (m.getSender().getNickname() != null ? m.getSender().getNickname() : m.getSender().getUsername()) : null,
                m.getSender() != null ? m.getSender().getAvatar() : null
        );
    }

    private String buildPreview(MessageType type, String content) {
        if (type == MessageType.IMAGE) return "📷 Ảnh";
        if (type == MessageType.FILE) return "📎 Tệp đính kèm";
        if (type == MessageType.EMOJI) return content;
        String s = content == null ? "" : content;
        if (s.length() > 120) s = s.substring(0, 120) + "...";
        return s;
    }

    private void assertGroupMember(Long groupId, Long userId, boolean requireActive) {
        GroupMember gm = groupMemberRepository.findByGroup_IdAndUser_Id(groupId, userId).orElseThrow(() -> new IllegalStateException("Not a group member"));
        if (requireActive && !gm.isActive()) {
            throw new IllegalStateException("Bạn không còn là thành viên của nhóm này");
        }
    }



    private void sendSystemMessage(GroupChat group, String text, List<Long> additionalNotifyIds) {
        ChatCryptoService.Enc enc = cryptoService.encryptToBase64(text);
        GroupMessage m = new GroupMessage();
        m.setGroup(group);
        // DB hiện đang ràng buộc sender_user_id NOT NULL, nên system message
        // phải có sender hợp lệ để tránh lỗi DataIntegrityViolationException.
        m.setSender(group.getAdmin());
        m.setType(MessageType.SYSTEM);
        m.setContentEnc(enc.cipherTextB64());
        m.setContentIv(enc.ivB64());
        GroupMessage saved = groupMessageRepository.save(m);

        group.setLastMessageAt(LocalDateTime.now());
        group.setLastMessagePreview(text);
        groupChatRepository.save(group);

        MessageDto dto = toGroupMsgDto(saved);

        // Use TransactionSynchronization to ensure WS is sent AFTER DB commit
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    broadcastSystemMessage(group, dto, additionalNotifyIds);
                }
            });
        } else {
            broadcastSystemMessage(group, dto, additionalNotifyIds);
        }
    }

    private void broadcastSystemMessage(GroupChat group, MessageDto dto, List<Long> additionalNotifyIds) {
        messagingTemplate.convertAndSend("/topic/group." + group.getId(),
                new ChatEventDto(ChatEventDto.Type.GROUP_MESSAGE, dto, null, null, null, group.getId(), null));

        // Notify each active member
        java.util.Set<Long> toNotify = groupMemberRepository.findActiveByGroup(group.getId())
                .stream().map(gm -> gm.getUser().getId()).collect(java.util.stream.Collectors.toSet());

        if (additionalNotifyIds != null) toNotify.addAll(additionalNotifyIds);

        for (Long uid : toNotify) {
            messagingTemplate.convertAndSend("/topic/chat." + uid,
                    new ChatEventDto(ChatEventDto.Type.GROUP_STATE, null, null, null, null, group.getId(), null));
        }
    }

    private GroupChatDto toGroupDto(GroupChat g, Long userId) {
        GroupChatDto dto = new GroupChatDto();
        dto.setId(g.getId());
        dto.setName(g.getName());
        dto.setAvatar(g.getAvatar());
        dto.setAdminUserId(g.getAdmin().getId());
        dto.setStatus(g.getStatus());
        dto.setLastMessagePreview(g.getLastMessagePreview());
        dto.setLastMessageAt(g.getLastMessageAt());
        GroupMember gm = groupMemberRepository.findByGroup_IdAndUser_Id(g.getId(), userId).orElse(null);
        dto.setCurrentUserActiveMember(gm != null && gm.isActive());
        dto.setCurrentUserRemovedByAdmin(gm != null && gm.isRemovedByAdmin() && !gm.isActive());
        LocalDateTime lr = gm == null || gm.getLastReadAt() == null ? LocalDateTime.of(1970,1,1,0,0) : gm.getLastReadAt();
        dto.setUnreadCount(groupMessageRepository.countUnreadForUser(g.getId(), userId, lr));
        dto.setMemberCount(groupMemberRepository.countByGroup_IdAndActiveTrue(g.getId()));
        return dto;
    }

    private MessageDto toGroupMsgDto(GroupMessage m) {
        return new MessageDto(
                m.getId(),
                m.getGroup().getId(),
                m.getSender() != null ? m.getSender().getId() : null,
                m.getType(),
                cryptoService.decryptFromBase64(m.getContentEnc(), m.getContentIv()),
                true,
                null,
                m.getCreatedAt(),
                m.getSender() != null ? (m.getSender().getNickname() != null ? m.getSender().getNickname() : m.getSender().getUsername()) : null,
                m.getSender() != null ? m.getSender().getAvatar() : null
        );
    }

    private GroupMemberDto toGroupMemberDto(GroupMember gm) {
        GroupMemberDto dto = new GroupMemberDto();
        dto.setUserId(gm.getUser().getId());
        dto.setUsername(gm.getUser().getUsername());
        dto.setNickname(gm.getUser().getNickname());
        dto.setAvatar(gm.getUser().getAvatar());
        dto.setActive(gm.isActive());
        dto.setRemovedByAdmin(gm.isRemovedByAdmin());
        return dto;
    }
}

