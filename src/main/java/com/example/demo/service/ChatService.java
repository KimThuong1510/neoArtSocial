package com.example.demo.service;

import com.example.demo.dto.ChatUserSearchDto;
import com.example.demo.dto.ConversationDto;
import com.example.demo.dto.CreateGroupRequest;
import com.example.demo.dto.GroupChatDto;
import com.example.demo.dto.GroupMemberDto;
import com.example.demo.dto.GroupMessageRequest;
import com.example.demo.dto.MessageDto;
import com.example.demo.dto.SendMessageRequest;
import com.example.demo.dto.UnreadSummaryDto;

import java.util.List;

public interface ChatService {
    List<ChatUserSearchDto> searchUsers(String q, String currentUsername);

    List<ConversationDto> listDirectConversations(String currentUsername);

    List<ConversationDto> listRequestConversations(String currentUsername);

    ConversationDto getOrCreateConversation(String currentUsername, Long otherUserId);

    List<MessageDto> listMessages(String currentUsername, Long conversationId);

    MessageDto sendMessage(String currentUsername, SendMessageRequest request);

    ConversationDto acceptRequest(String currentUsername, Long conversationId);

    void rejectRequest(String currentUsername, Long conversationId);

    int markConversationRead(String currentUsername, Long conversationId);

    long totalUnreadCount(String currentUsername);

    List<ChatUserSearchDto> searchFriendUsersForGroup(String q, String currentUsername);
    List<ChatUserSearchDto> searchAddableFriendUsersForGroup(Long groupId, String q, String currentUsername);
    GroupChatDto createGroup(String currentUsername, CreateGroupRequest request);
    List<GroupChatDto> listGroups(String currentUsername);
    List<MessageDto> listGroupMessages(String currentUsername, Long groupId);
    MessageDto sendGroupMessage(String currentUsername, GroupMessageRequest request);
    List<GroupMemberDto> listGroupMembers(String currentUsername, Long groupId);
    void addGroupMembers(String currentUsername, Long groupId, List<Long> userIds);
    void removeGroupMember(String currentUsername, Long groupId, Long userId);
    GroupChatDto updateGroupName(String currentUsername, Long groupId, String name);
    GroupChatDto updateGroupAvatar(String currentUsername, Long groupId, String avatar);
    void deleteOrLeaveGroup(String currentUsername, Long groupId, Long transferAdminToUserId);
    int markGroupRead(String currentUsername, Long groupId);
    UnreadSummaryDto unreadSummary(String currentUsername);
}

