package com.example.demo.controller;

import com.example.demo.dto.ChatEventDto;
import com.example.demo.dto.ConversationActionRequest;
import com.example.demo.dto.ConversationDto;
import com.example.demo.dto.GroupMessageRequest;
import com.example.demo.dto.MessageDto;
import com.example.demo.dto.SendMessageRequest;
import com.example.demo.model.Conversation;
import com.example.demo.model.GroupMember;
import com.example.demo.model.User;
import com.example.demo.repository.ConversationRepository;
import com.example.demo.repository.GroupMemberRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWsController {
    private final ChatService chatService;
    private final ConversationRepository conversationRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void send(SendMessageRequest req, Principal principal) {
        String username = principal.getName();
        MessageDto saved = chatService.sendMessage(username, req);
        Conversation c = conversationRepository.findById(saved.getConversationId()).orElseThrow();

        Long userAId = c.getUserA().getId();
        Long userBId = c.getUserB().getId();

        messagingTemplate.convertAndSend("/topic/chat." + userAId, new ChatEventDto(ChatEventDto.Type.MESSAGE, saved, c.getId(), c.getStatus(), null, null, null));
        messagingTemplate.convertAndSend("/topic/chat." + userBId, new ChatEventDto(ChatEventDto.Type.MESSAGE, saved, c.getId(), c.getStatus(), null, null, null));

        pushUnread(userAId);
        pushUnread(userBId);
    }

    @MessageMapping("/chat.read")
    public void read(ConversationActionRequest req, Principal principal) {
        if (req == null || req.getConversationId() == null) return;
        String username = principal.getName();
        chatService.markConversationRead(username, req.getConversationId());
        User me = userRepository.findByUsername(username).orElseThrow();
        pushUnread(me.getId());
    }

    @MessageMapping("/chat.accept")
    public void accept(ConversationActionRequest req, Principal principal) {
        if (req == null || req.getConversationId() == null) return;
        String username = principal.getName();
        ConversationDto dto = chatService.acceptRequest(username, req.getConversationId());
        Conversation c = conversationRepository.findById(dto.getId()).orElseThrow();
        Long userAId = c.getUserA().getId();
        Long userBId = c.getUserB().getId();

        messagingTemplate.convertAndSend("/topic/chat." + userAId, new ChatEventDto(ChatEventDto.Type.CONVERSATION_STATUS, null, c.getId(), c.getStatus(), null, null, null));
        messagingTemplate.convertAndSend("/topic/chat." + userBId, new ChatEventDto(ChatEventDto.Type.CONVERSATION_STATUS, null, c.getId(), c.getStatus(), null, null, null));

        pushUnread(userAId);
        pushUnread(userBId);
    }

    @MessageMapping("/chat.reject")
    public void reject(ConversationActionRequest req, Principal principal) {
        if (req == null || req.getConversationId() == null) return;
        Conversation c = conversationRepository.findById(req.getConversationId()).orElse(null);
        if (c == null) return;
        Long userAId = c.getUserA().getId();
        Long userBId = c.getUserB().getId();

        String username = principal.getName();
        chatService.rejectRequest(username, req.getConversationId());

        messagingTemplate.convertAndSend("/topic/chat." + userAId, new ChatEventDto(ChatEventDto.Type.CONVERSATION_STATUS, null, req.getConversationId(), null, null, null, null));
        messagingTemplate.convertAndSend("/topic/chat." + userBId, new ChatEventDto(ChatEventDto.Type.CONVERSATION_STATUS, null, req.getConversationId(), null, null, null, null));

        pushUnread(userAId);
        pushUnread(userBId);
    }

    @MessageMapping("/chat.group.send")
    public void sendGroup(GroupMessageRequest req, Principal principal) {
        String username = principal.getName();
        MessageDto saved = chatService.sendGroupMessage(username, req);
        Long groupId = req.getGroupId();
        messagingTemplate.convertAndSend("/topic/group." + groupId,
                new ChatEventDto(ChatEventDto.Type.GROUP_MESSAGE, saved, null, null, null, groupId, null));

        for (GroupMember gm : groupMemberRepository.findActiveByGroup(groupId)) {
            pushUnread(gm.getUser().getId());
        }
    }

    @MessageMapping("/chat.group.read")
    public void readGroup(ConversationActionRequest req, Principal principal) {
        if (req == null || req.getConversationId() == null) return;
        String username = principal.getName();
        chatService.markGroupRead(username, req.getConversationId());
        User me = userRepository.findByUsername(username).orElseThrow();
        pushUnread(me.getId());
    }

    private void pushUnread(Long userId) {
        if (userId == null) return;
        User u = userRepository.findById(userId).orElse(null);
        if (u == null) return;
        long totalUnread = chatService.totalUnreadCount(u.getUsername());
        messagingTemplate.convertAndSend("/topic/chat.unread." + userId,
                new ChatEventDto(ChatEventDto.Type.UNREAD_COUNT, null, null, null, totalUnread, null, null));
    }
}

