
    /**
     * ==========================================
     * BACKEND-POWERED 1-1 CHAT (DM + Requests)
     * Groups remain mock for now.
     * ==========================================
     */
    const CURRENT_USER_ID = document.body && document.body.getAttribute("data-user-id");

    const API = {
        async getJson(url, opts = {}) {
            const res = await fetch(url, { credentials: "same-origin", ...opts });
            if (!res.ok) {
                let msg = `HTTP ${res.status}`;
                try {
                    const data = await res.json();
                    if (data && data.message) msg = data.message;
                    else if (data && data.error) msg = data.error;
                } catch (e) {
                    try {
                        const txt = await res.text();
                        if (txt) msg = txt;
                    } catch (ignored) {}
                }
                throw new Error(msg);
            }
            return await res.json();
        },
        async postJson(url, body) {
            return await this.getJson(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body || {}),
            });
        },
        async searchUsers(q) {
            return await this.getJson(`/api/chat/users/search?q=${encodeURIComponent(q || "")}`);
        },
        async listConversations(tab) {
            return await this.getJson(`/api/chat/conversations?tab=${encodeURIComponent(tab)}`);
        },
        async getOrCreateWith(otherUserId) {
            return await this.getJson(`/api/chat/conversations/with/${encodeURIComponent(otherUserId)}`);
        },
        async listMessages(conversationId) {
            return await this.getJson(`/api/chat/conversations/${encodeURIComponent(conversationId)}/messages`);
        },
        async markRead(conversationId) {
            return await this.postJson(`/api/chat/conversations/${encodeURIComponent(conversationId)}/read`, {});
        },
        async accept(conversationId) {
            return await this.postJson(`/api/chat/conversations/${encodeURIComponent(conversationId)}/accept`, {});
        },
        async reject(conversationId) {
            const res = await fetch(`/api/chat/conversations/${encodeURIComponent(conversationId)}/reject`, {
                method: "POST",
                credentials: "same-origin",
            });
            if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
            return true;
        },
        async uploadChatImage(file) {
            const fd = new FormData();
            fd.append("image", file);
            const res = await fetch("/api/chat/upload-image", { method: "POST", body: fd, credentials: "same-origin" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json(); // {url}
        },
        async unreadCount() {
            return await this.getJson("/api/chat/unread-count");
        },
        async unreadSummary() {
            return await this.getJson("/api/chat/unread-summary");
        },
        async listGroups() {
            return await this.getJson("/api/chat/groups");
        },
        async listGroupMessages(groupId) {
            return await this.getJson(`/api/chat/groups/${encodeURIComponent(groupId)}/messages`);
        },
        async createGroup(payload) {
            return await this.postJson("/api/chat/groups", payload);
        },
        async searchFriendUsers(q) {
            return await this.getJson(`/api/chat/groups/friends/search?q=${encodeURIComponent(q || "")}`);
        },
        async sendGroupMessage(payload) {
            return await this.postJson("/api/chat/groups/messages", payload);
        },
        async markGroupRead(groupId) {
            const res = await fetch(`/api/chat/groups/${encodeURIComponent(groupId)}/read`, { method: "POST", credentials: "same-origin" });
            return res.ok;
        },
        async renameGroup(groupId, name) {
            return await this.getJson(`/api/chat/groups/${encodeURIComponent(groupId)}/name`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });
        },
        async updateGroupAvatar(groupId, avatar) {
            return await this.getJson(`/api/chat/groups/${encodeURIComponent(groupId)}/avatar`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatar })
            });
        },
        async uploadGroupAvatar(groupId, file) {
            const fd = new FormData();
            fd.append("avatar", file);
            const res = await fetch(`/api/chat/groups/${encodeURIComponent(groupId)}/avatar-upload`, {
                method: "POST",
                body: fd,
                credentials: "same-origin"
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(txt || `HTTP ${res.status}`);
            }
            return await res.json();
        },
        async addGroupMembers(groupId, userIds) {
            const res = await fetch(`/api/chat/groups/${encodeURIComponent(groupId)}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userIds }),
                credentials: "same-origin"
            });
            return res.ok;
        },
        async removeGroupMember(groupId, userId) {
            const res = await fetch(`/api/chat/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(userId)}`, {
                method: "DELETE",
                credentials: "same-origin"
            });
            return res.ok;
        },
        async leaveOrDeleteGroup(groupId, transferTo) {
            const res = await fetch(`/api/chat/groups/${encodeURIComponent(groupId)}/leave-or-delete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transferAdminToUserId: transferTo }),
                credentials: "same-origin"
            });
            return res.ok;
        },
        async listGroupMembers(groupId) {
            return await this.getJson(`/api/chat/groups/${encodeURIComponent(groupId)}/members`);
        }
    };

    const MOCK_DATA = {
        directMessages: [],
        groups: [
            { id: 'g1', name: 'Nhóm Dự Án A', avatar: 'https://i.pravatar.cc/150?img=20', lastMessage: 'Hoàng: Đã hoàn thành task', timestamp: Date.now() - 600000, unreadCount: 3, members: ['1', '2', '3'], createdBy: 'me' },
            { id: 'g2', name: 'Team Marketing', avatar: 'https://i.pravatar.cc/150?img=21', lastMessage: 'Lan: Chiến dịch mới cần review', timestamp: Date.now() - 3600000, unreadCount: 0, members: ['2', '4'], createdBy: '2' }
        ],
        messageRequests: [],
        conversations: {
            '1': [
                { id: 'm1', senderId: '1', content: 'Chào bạn!', timestamp: Date.now() - 600000, type: 'incoming' },
                { id: 'm2', senderId: 'me', content: 'Chào, khỏe không?', timestamp: Date.now() - 540000, type: 'outgoing' },
                { id: 'm3', senderId: '1', content: 'Mình khỏe, cảm ơn bạn', timestamp: Date.now() - 480000, type: 'incoming' },
                { id: 'm4', senderId: '1', content: 'Hôm nay thế nào?', timestamp: Date.now() - 300000, type: 'incoming' }
            ],
            '2': [
                { id: 'm5', senderId: 'me', content: 'File đã gửi chưa?', timestamp: Date.now() - 7200000, type: 'outgoing' },
                { id: 'm6', senderId: '2', content: 'Okay, cảm ơn bạn nhé!', timestamp: Date.now() - 3600000, type: 'incoming' },
                /* ── Sample ảnh test lightbox ── */
                { id: 'm6b', senderId: '2', content: 'https://picsum.photos/seed/chat1/800/600', messageType: 'image', timestamp: Date.now() - 1800000, type: 'incoming' },
                { id: 'm6c', senderId: 'me', content: 'https://picsum.photos/seed/chat2/600/800', messageType: 'image', timestamp: Date.now() - 900000, type: 'outgoing' }
            ],
            'g1': [
                { id: 'm7', senderId: '3', senderName: 'Lê Văn C', content: 'Mọi người đã xong task chưa?', timestamp: Date.now() - 900000, type: 'incoming' },
                { id: 'm8', senderId: 'me', content: 'Mình đã hoàn thành rồi', timestamp: Date.now() - 700000, type: 'outgoing' },
                { id: 'm9', senderId: '1', senderName: 'Nguyễn Văn A', content: 'Tuyệt vời, mình cũng xong rồi!', timestamp: Date.now() - 600000, type: 'incoming' }
            ],
            /* ── Sample ảnh để test lightbox ── */
            '1_extra': [],
            /* ảnh được nhúng sẵn vào conversation '1' bên dưới qua patch */
            '_img_seed': true
        },
        availableMembers: [
            { id: '1', name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?img=1' },
            { id: '2', name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?img=5' },
            { id: '3', name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?img=3' },
            { id: '4', name: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?img=9' },
            { id: '5', name: 'Hoàng Văn E', avatar: 'https://i.pravatar.cc/150?img=11' },
            { id: '6', name: 'Vũ Thị F', avatar: 'https://i.pravatar.cc/150?img=15' }
        ]
    };

    /**
     * ==========================================
     * CHAT SOCKET MANAGER CLASS
     * ==========================================
     */
    class ChatSocketManager {
        constructor() {
            this.isConnected = false;
            this.stompClient = null;
            this.groupSubscription = null;
        }

        connect() {
            if (!CURRENT_USER_ID) return;
            if (typeof SockJS === "undefined" || typeof Stomp === "undefined") return;
            const socket = new SockJS("/ws");
            this.stompClient = Stomp.over(socket);
            this.stompClient.debug = null;

            this.stompClient.connect(
                {},
                () => {
                    this.isConnected = true;
                    this.stompClient.subscribe(`/topic/chat.${CURRENT_USER_ID}`, (message) => {
                        try {
                            const payload = JSON.parse(message.body);
                            chatApp && chatApp.handleChatEvent(payload);
                        } catch (e) {
                            console.error(e);
                        }
                    });
                    this.stompClient.subscribe(`/topic/chat.unread.${CURRENT_USER_ID}`, (message) => {
                        try {
                            const payload = JSON.parse(message.body);
                            chatApp && chatApp.handleChatEvent(payload);
                        } catch (e) {
                            console.error(e);
                        }
                    });
                },
                (err) => {
                    console.error("[Socket] STOMP error", err);
                    this.isConnected = false;
                }
            );
        }

        subscribeGroup(groupId) {
            if (!this.stompClient || !this.isConnected || !groupId) return;
            if (this.groupSubscription) {
                try { this.groupSubscription.unsubscribe(); } catch (e) {}
            }
            this.groupSubscription = this.stompClient.subscribe(`/topic/group.${groupId}`, (message) => {
                try {
                    const payload = JSON.parse(message.body);
                    chatApp && chatApp.handleChatEvent(payload);
                } catch (e) {}
            });
        }

        sendDirectMessage(data) {
            if (!this.stompClient || !this.isConnected) return;
            this.stompClient.send("/app/chat.send", {}, JSON.stringify(data || {}));
        }

        sendGroupMessage(data) {
            if (!this.stompClient || !this.isConnected) return;
            this.stompClient.send("/app/chat.group.send", {}, JSON.stringify(data || {}));
        }

        markRead(conversationId) {
            if (!this.stompClient || !this.isConnected) return;
            this.stompClient.send("/app/chat.read", {}, JSON.stringify({ conversationId }));
        }

        accept(conversationId) {
            if (!this.stompClient || !this.isConnected) return;
            this.stompClient.send("/app/chat.accept", {}, JSON.stringify({ conversationId }));
        }

        reject(conversationId) {
            if (!this.stompClient || !this.isConnected) return;
            this.stompClient.send("/app/chat.reject", {}, JSON.stringify({ conversationId }));
        }
    }

    /**
     * ==========================================
     * SIDEBAR MANAGER CLASS
     * ==========================================
     */
    class SidebarManager {
        constructor() {
            this.currentTab = 'direct';
            this.selectedChatId = null;
            this.conversationCache = new Map(); // conversationId -> dto
            this.init();
        }

        init() {
            this.renderDirectMessages();
            this.renderGroups();
            this.renderMessageRequests();
            this.setupTabs();
            this.setupUserSearch();
        }

        setupTabs() {
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.switchTab(tab.dataset.tab);
                });
            });
        }

        switchTab(tabName) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            document.getElementById(`tab-${tabName}`).classList.add('active');
            this.currentTab = tabName;
        }

        renderDirectMessages() {
            const container = document.getElementById('direct-messages-list');
            API.listConversations("direct")
                .then((convs) => {
                    container.innerHTML = '';
                    MOCK_DATA.directMessages = (convs || []).map((c) => this.dtoToChatItem(c));
                    MOCK_DATA.directMessages.forEach(chat => container.appendChild(this.createChatItem(chat)));
                    this.restoreSelectionHighlight();
                })
                .catch(() => {
                    container.innerHTML = '<div style="padding:12px;color:#777;">Không tải được cuộc trò chuyện.</div>';
                });
        }

        renderGroups() {
            const container = document.getElementById('groups-list');
            API.listGroups().then((groups) => {
                container.innerHTML = '';
                MOCK_DATA.groups = (groups || []).map((g) => ({
                    id: String(g.id),
                    groupId: g.id,
                    name: g.name,
                    avatar: g.avatar || `https://i.pravatar.cc/150?u=group-${g.id}`,
                    lastMessage: g.lastMessagePreview || "",
                    timestamp: g.lastMessageAt ? new Date(g.lastMessageAt).getTime() : Date.now(),
                    unreadCount: g.unreadCount || 0,
                    status: g.status,
                    currentUserActiveMember: g.currentUserActiveMember,
                    currentUserRemovedByAdmin: g.currentUserRemovedByAdmin,
                    adminUserId: g.adminUserId,
                    memberCount: g.memberCount,
                    members: []
                }));
                MOCK_DATA.groups.forEach(group => container.appendChild(this.createChatItem(group, true)));
                this.restoreSelectionHighlight();
            }).catch(() => {
                container.innerHTML = '<div style="padding:12px;color:#777;">Không tải được nhóm.</div>';
            });
        }

        renderMessageRequests() {
            const container = document.getElementById('requests-list');
            API.listConversations("requests")
                .then((convs) => {
                    container.innerHTML = '';
                    MOCK_DATA.messageRequests = convs || [];
                    MOCK_DATA.messageRequests.forEach(c => container.appendChild(this.createRequestItem(c)));
                    this.restoreSelectionHighlight();
                })
                .catch(() => {
                    container.innerHTML = '<div style="padding:12px;color:#777;">Không tải được tin nhắn chờ.</div>';
                });
        }

        dtoToChatItem(c) {
            const displayName = c.otherNickname || c.otherUsername || "User";
            const avatar = c.otherAvatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(String(c.otherUserId || ""))}`;
            const ts = c.lastMessageAt ? new Date(c.lastMessageAt).getTime() : Date.now();
            const chat = {
                id: String(c.id),
                conversationId: c.id,
                otherUserId: c.otherUserId,
                username: displayName,
                avatar,
                lastMessage: c.lastMessagePreview || "",
                timestamp: ts,
                unreadCount: c.unreadCount || 0,
                status: c.status,
                requestedByUserId: c.requestedByUserId || null,
                isOnline: false
            };
            this.conversationCache.set(String(c.id), c);
            return chat;
        }

        restoreSelectionHighlight() {
            if (!this.selectedChatId) return;
            const el = document.querySelector(`[data-chat-id="${this.selectedChatId}"]`);
            if (el) el.classList.add("selected");
        }

        setupUserSearch() {
            const input = document.querySelector(".search-input");
            const dropdown = document.getElementById("user-search-dropdown");
            if (!input || !dropdown) return;

            let timer = null;
            const hide = () => { dropdown.style.display = "none"; dropdown.innerHTML = ""; };

            input.addEventListener("input", () => {
                const q = input.value.trim();
                if (timer) clearTimeout(timer);
                if (!q) { hide(); return; }
                timer = setTimeout(async () => {
                    try {
                        const results = await API.searchUsers(q);
                        dropdown.innerHTML = "";
                        if (!results || results.length === 0) {
                            dropdown.innerHTML = `<div class="search-empty">Không tìm thấy người dùng</div>`;
                            dropdown.style.display = "block";
                            return;
                        }
                        results.forEach((u) => {
                            const item = document.createElement("div");
                            item.className = "search-item";
                            const avatar = u.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(String(u.id))}`;
                            const name = u.nickname || u.username || "User";
                            item.innerHTML = `
                                <img class="search-avatar" src="${avatar}" alt="">
                                <div class="search-main">
                                    <div class="search-name">${this.escapeHtml(name)}</div>
                                    <div class="search-sub">
                                        <span>@${this.escapeHtml(u.username || "")}</span>
                                        <span class="search-rel">${this.escapeHtml(u.relationshipLabel || "")}</span>
                                    </div>
                                </div>
                            `;
                            item.addEventListener("click", async () => {
                                hide();
                                input.value = "";
                                try {
                                    const conv = await API.getOrCreateWith(u.id);
                                    this.openConversationFromDto(conv);
                                } catch (e) {
                                    console.warn(e);
                                }
                            });
                            dropdown.appendChild(item);
                        });
                        dropdown.style.display = "block";
                    } catch (e) {
                        hide();
                    }
                }, 250);
            });

            document.addEventListener("click", (e) => {
                if (!e.target.closest(".search-container")) hide();
            });
        }

        escapeHtml(s) {
            if (!s) return "";
            const d = document.createElement("div");
            d.textContent = s;
            return d.innerHTML;
        }

        openConversationFromDto(convDto) {
            if (!convDto || !convDto.id) return;
            const tab = convDto.status === "ACCEPTED" ? "direct" : "requests";
            this.switchTab(tab);
            this.renderDirectMessages();
            this.renderMessageRequests();

            const chat = this.dtoToChatItem(convDto);
            this.selectChat(String(convDto.id), chat, false);
        }

        createChatItem(chat, isGroup = false) {
            const item = document.createElement('div');
            item.className = 'chat-item';
            item.dataset.chatId = chat.id;
            const timeStr = this.formatTime(chat.timestamp);

            const isInactive = isGroup && chat.currentUserActiveMember === false;
            const statusLabel = isInactive ? (chat.currentUserRemovedByAdmin ? ' (Bị xóa)' : ' (Đã rời)') : '';

            item.innerHTML = `
                <img src="${chat.avatar}" alt="${chat.username || chat.name}" class="chat-avatar ${isGroup ? '' : ''}" ${isGroup ? `data-user-id="${chat.id}"` : ''}>
                <div class="chat-info" style="${isInactive ? 'opacity:0.7;' : ''}">
                    <div class="chat-header-row">
                        <span class="chat-name">${this.escapeHtml(chat.username || chat.name)}${statusLabel}</span>
                        <span class="chat-time">${timeStr}</span>
                    </div>
                    <div class="chat-message-row">
                        <span class="chat-last-message">${isInactive ? (chat.currentUserRemovedByAdmin ? 'Bạn đã bị quản trị mời ra khỏi nhóm' : 'Bạn đã rời nhóm') : this.escapeHtml(chat.lastMessage)}</span>
                        ${chat.unreadCount > 0 ? `<span class="unread-badge">${chat.unreadCount}</span>` : ''}
                    </div>
                </div>
            `;

            // Avatar click → profile (groups mock only)
            const avatar = item.querySelector('.chat-avatar');
            if (isGroup && avatar) {
                avatar.classList.add("clickable-avatar");
                avatar.style.cursor = "pointer";
                avatar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.location.href = `/profile.html?id=${chat.id}`;
                });
            }

            item.addEventListener('click', () => {
                this.selectChat(chat.id, chat, isGroup);
            });

            return item;
        }

        createRequestItem(request) {
            const item = document.createElement('div');
            item.className = 'request-item';
            item.dataset.requestId = String(request.id);

            const displayName = request.otherNickname || request.otherUsername || "User";
            const avatar = request.otherAvatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(String(request.otherUserId || ""))}`;
            const preview = request.lastMessagePreview || "";
            const canRespond = String(request.requestedByUserId || "") !== String(CURRENT_USER_ID || "");

            item.innerHTML = `
                <img src="${avatar}" alt="${displayName}" class="chat-avatar">
                <div class="request-info">
                    <span class="request-name">${displayName}</span>
                    <span class="request-preview">${preview}</span>
                    ${canRespond ? `
                        <div class="request-actions">
                            <button class="btn btn-accept" data-request-id="${request.id}">Chấp nhận</button>
                            <button class="btn btn-reject" data-request-id="${request.id}">Từ chối</button>
                        </div>
                    ` : `<div class="request-actions"><span style="color:#777;font-size:13px;">Đang chờ phản hồi</span></div>`}
                </div>
            `;

            const acceptBtn = item.querySelector('.btn-accept');
            const rejectBtn = item.querySelector('.btn-reject');
            if (acceptBtn) {
                acceptBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleRequestAction(String(request.id), 'accept');
                });
            }
            if (rejectBtn) {
                rejectBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleRequestAction(String(request.id), 'reject');
                });
            }

            item.addEventListener("click", () => {
                const chat = this.dtoToChatItem(request);
                this.selectChat(String(request.id), chat, false);
            });

            return item;
        }

        handleRequestAction(requestId, action) {
            if (action === 'accept') this.handleAcceptRequest(requestId);
            else this.handleRejectRequest(requestId);
        }

        handleRejectRequest(requestId) {
            API.reject(Number(requestId)).then(() => {
                this.renderMessageRequests();
                if (chatApp.chatWindowManager.currentChatId === String(requestId)) {
                    document.getElementById('chat-container').style.display = 'none';
                    document.getElementById('empty-state').style.display = 'flex';
                    chatApp.chatWindowManager.currentChatId = null;
                    chatApp.chatWindowManager.currentChatData = null;
                    chatApp.chatWindowManager.isGroup = false;
                }
                if (chatApp.socketManager && chatApp.socketManager.isConnected) {
                    chatApp.socketManager.reject(Number(requestId));
                }
            }).catch(() => {});
        }

        handleAcceptRequest(requestId) {
            API.accept(Number(requestId)).then((conv) => {
                // open accepted conversation immediately and keep current chat-container state
                this.renderDirectMessages();
                this.renderMessageRequests();
                this.switchTab('direct');
                if (conv && conv.id) {
                    const chat = this.dtoToChatItem(conv);
                    this.selectChat(String(conv.id), chat, false);
                    chatApp.socketManager.markRead(Number(conv.id));
                }
                if (chatApp.socketManager && chatApp.socketManager.isConnected) {
                    chatApp.socketManager.accept(Number(requestId));
                }
            }).catch(() => {});
        }

        selectChat(chatId, chatData, isGroup = false) {
            document.querySelectorAll('.chat-item, .request-item').forEach(item => item.classList.remove('selected'));
            const selectedEl = document.querySelector(`[data-chat-id="${chatId}"], [data-request-id="${chatId}"]`);
            if (selectedEl) selectedEl.classList.add('selected');
            this.selectedChatId = chatId;
            this.resetUnreadCount(chatId, isGroup);
            chatApp.chatWindowManager.loadChat(chatId, chatData, isGroup);
        }

        resetUnreadCount(chatId, isGroup) {
            const dataArray = isGroup ? MOCK_DATA.groups : MOCK_DATA.directMessages;
            const chat = dataArray.find(c => c.id === chatId);
            if (chat && chat.unreadCount > 0) {
                chat.unreadCount = 0;
                const chatItem = document.querySelector(`[data-chat-id="${chatId}"]`);
                const badge = chatItem && chatItem.querySelector('.unread-badge');
                if (badge) {
                    badge.style.opacity = '0';
                    badge.style.transform = 'scale(0)';
                    setTimeout(() => badge.remove(), 200);
                }
            }
        }

        formatTime(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            if (diffMins < 1) return 'Vừa xong';
            if (diffMins < 60) return `${diffMins} phút`;
            if (diffHours < 24) return `${diffHours} giờ`;
            if (diffDays < 7) return `${diffDays} ngày`;
            return date.toLocaleDateString('vi-VN');
        }
    }

    /**
     * ==========================================
     * CHAT WINDOW MANAGER CLASS
     * ==========================================
     */
    class ChatWindowManager {
        constructor() {
            this.currentChatId = null;
            this.currentChatData = null;
            this.isGroup = false;
            this.pendingImageDataUrl = null;
            this.init();
        }

        init() {
            this.setupMessageInput();
            this.setupDropdownMenu();
            this.setupImageUpload();
            this.setupEmojiPicker();
            this.setupPasteImage();
        }

        setupMessageInput() {
            const input = document.getElementById('message-input');
            const sendBtn = document.getElementById('send-btn');
            sendBtn.addEventListener('click', () => this.sendMessage());
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }

        setupDropdownMenu() {
            const menuBtn = document.getElementById('menu-btn');
            const dropdownMenu = document.getElementById('dropdown-menu');

            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.menu-container')) {
                    dropdownMenu.classList.remove('show');
                }
            });

            document.getElementById('manage-members-btn').addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
                chatApp.modalManager.openManageMembersModal();
            });

            document.getElementById('rename-group-btn').addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
                chatApp.modalManager.openRenameGroupModal();
            });

            document.getElementById('change-group-avatar-btn').addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
                chatApp.modalManager.openChangeAvatarModal();
            });

            document.getElementById('delete-group-btn').addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
                chatApp.modalManager.openDeleteGroupModal();
            });

            document.getElementById('leave-group-btn').addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
                chatApp.modalManager.confirmLeaveGroup();
            });
        }

        setupImageUpload() {
            const uploadBtn = document.getElementById('image-upload-btn');
            const uploadInput = document.getElementById('image-upload-input');
            const removePreviewBtn = document.getElementById('remove-preview-btn');

            uploadBtn.addEventListener('click', () => {
                if (!this.currentChatId) return;
                uploadInput.click();
            });

            uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.showImagePreview(file);
                uploadInput.value = '';
            });

            removePreviewBtn.addEventListener('click', () => this.clearImagePreview());
        }

        setupPasteImage() {
            document.addEventListener('paste', (e) => {
                if (!this.currentChatId) return;
                const items = e.clipboardData && e.clipboardData.items;
                if (!items) return;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        const file = items[i].getAsFile();
                        this.showImagePreview(file);
                        break;
                    }
                }
            });
        }

        setupEmojiPicker() {
            const emojiBtn = document.getElementById('emoji-btn');
            const emojiPicker = document.getElementById('emoji-picker');

            const emojis = [
                '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊',
                '😋','😎','😍','😘','🥰','😗','😙','😚','🙂','🤗',
                '🤔','😐','😑','😶','😏','😣','😥','😮','🤐','😯',
                '😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒',
                '😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞',
                '😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬',
                '😰','😱','🥵','🥶','😳','🤪','😵','🥴','😠','😡',
                '🤬','😷','🤒','🤕','🤢','🤮','🤧','😇','🥳','🥸',
                '🤠','🥺','🤡','🤥','🤫','🤭','🧐','🤓','😈','👿',
                '👋','🤚','🖐️','✋','🖖','👌','🤏','✌️','🤞','🤟',
                '🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎',
                '✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏',
                '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔',
                '🎉','🎊','🎈','🎁','🎀','🏆','🥇','🌟','⭐','💫',
                '🔥','💥','✨','🌈','☀️','🌤️','⛅','🌥️','🌦️','🌧️'
            ];

            // Build emoji grid
            emojis.forEach(emoji => {
                const span = document.createElement('span');
                span.className = 'emoji-item';
                span.textContent = emoji;
                span.addEventListener('click', () => {
                    const input = document.getElementById('message-input');
                    const pos = input.selectionStart || input.value.length;
                    input.value = input.value.slice(0, pos) + emoji + input.value.slice(pos);
                    input.focus();
                    const newPos = pos + emoji.length;
                    input.setSelectionRange(newPos, newPos);
                    emojiPicker.style.display = 'none';
                });
                emojiPicker.appendChild(span);
            });

            emojiBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this.currentChatId) return;
                const isVisible = emojiPicker.style.display === 'grid';
                emojiPicker.style.display = isVisible ? 'none' : 'grid';
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('#emoji-btn') && !e.target.closest('#emoji-picker')) {
                    emojiPicker.style.display = 'none';
                }
            });
        }

        showImagePreview(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.pendingImageDataUrl = e.target.result;
                this.pendingImageFile = file || null;
                document.getElementById('image-preview-thumb').src = e.target.result;
                document.getElementById('image-preview-area').style.display = 'flex';
            };
            reader.readAsDataURL(file);
        }

        clearImagePreview() {
            this.pendingImageDataUrl = null;
            this.pendingImageFile = null;
            document.getElementById('image-preview-area').style.display = 'none';
            document.getElementById('image-preview-thumb').src = '';
        }

        escapeHtml(s) {
            if (!s) return "";
            const d = document.createElement("div");
            d.textContent = s;
            return d.innerHTML;
        }

        loadChat(chatId, chatData, isGroup = false) {
            this.currentChatId = chatId;
            this.currentChatData = chatData;
            this.isGroup = isGroup;

            document.getElementById('empty-state').style.display = 'none';
            document.getElementById('chat-container').style.display = 'flex';

            this.updateHeader(chatData);

            const inputArea = document.querySelector('.input-area');
            const lockedNotice = document.getElementById('locked-notice-area');
            const lockedText = document.getElementById('locked-notice-text');
            const menuBtn = document.getElementById('menu-btn');

            const menuContainer = document.getElementById('menu-container');

            if (isGroup && chatData.currentUserActiveMember === false) {
                inputArea.style.display = 'none';
                lockedNotice.style.display = 'block';
                lockedText.textContent = chatData.currentUserRemovedByAdmin
                    ? 'Bạn đã bị quản trị viên mời ra khỏi nhóm này.'
                    : 'Bạn không còn là thành viên của nhóm này.';
                menuContainer.style.display = 'none';
            } else {
                inputArea.style.display = 'flex';
                lockedNotice.style.display = 'none';
                menuContainer.style.display = isGroup ? 'block' : 'none';
            }

            this.loadMessages(chatId);
            this.clearImagePreview();
            document.getElementById('emoji-picker').style.display = 'none';
        }

        updateHeader(chatData) {
            const avatar = document.getElementById('header-avatar');
            const name = document.getElementById('header-name');
            const status = document.getElementById('header-status');

            avatar.src = chatData.avatar;
            avatar.alt = chatData.username || chatData.name;
            avatar.dataset.userId = chatData.id;
            name.textContent = chatData.username || chatData.name;

            if (this.isGroup) {
                status.textContent = `${chatData.memberCount || 0} thành viên`;
                status.className = 'status';

                // Toggle Delete/Leave buttons
                const isMeAdmin = String(chatData.adminUserId) === String(CURRENT_USER_ID);
                document.getElementById('delete-group-btn').style.display = isMeAdmin ? 'flex' : 'none';
                document.getElementById('leave-group-btn').style.display = isMeAdmin ? 'none' : 'flex';
            } else {
                status.textContent = chatData.isOnline ? 'Đang hoạt động' : 'Không hoạt động';
                status.className = chatData.isOnline ? 'status online' : 'status offline';
            }

            // Avatar click → profile (for DM)
            avatar.onclick = () => {
                if (!this.isGroup) {
                    window.location.href = `/profile.html?id=${chatData.id}`;
                } else {
                    // Group info logic could go here
                }
            };
        }

        loadMessages(chatId) {
            const messagesArea = document.getElementById('messages-area');
            messagesArea.innerHTML = '';
            if (this.isGroup) {
                API.listGroupMessages(Number(chatId)).then((msgs) => {
                    (msgs || []).forEach((m) => {
                        const type = String(m.senderId) === String(CURRENT_USER_ID) ? "outgoing" : "incoming";
                        messagesArea.appendChild(this.createMessageElement({
                            id: String(m.id),
                            senderId: String(m.senderId),
                            content: m.content,
                            messageType: (m.type || "TEXT").toLowerCase(),
                            timestamp: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
                            senderName: m.senderNickname,
                            avatar: m.senderAvatar,
                            type
                        }));
                    });
                    this.scrollToBottom();
                    if (this.currentChatData && this.currentChatData.currentUserActiveMember !== false) {
                        chatApp.socketManager.subscribeGroup(Number(chatId));
                        API.markGroupRead(Number(chatId));
                    }
                }).catch(() => {
                    messagesArea.innerHTML = '<div style="padding:12px;color:#777;">Không tải được tin nhắn nhóm.</div>';
                });
                return;
            }

            const conversationId = Number(chatId);
            API.listMessages(conversationId)
                .then((msgs) => {
                    (msgs || []).forEach((m) => {
                        const type = String(m.senderId) === String(CURRENT_USER_ID) ? "outgoing" : "incoming";
                        messagesArea.appendChild(this.createMessageElement({
                            id: String(m.id),
                            senderId: String(m.senderId),
                            content: m.content,
                            messageType: (m.type || "TEXT").toLowerCase(),
                            timestamp: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
                            senderName: m.senderNickname,
                            avatar: m.senderAvatar,
                            type
                        }));
                    });
                    this.scrollToBottom();

                    chatApp.socketManager.markRead(conversationId);
                })
                .catch(() => {
                    messagesArea.innerHTML = '<div style="padding:12px;color:#777;">Không tải được tin nhắn.</div>';
                });
        }

        createMessageElement(message) {
            const messageDiv = document.createElement('div');

            // Handle System Message
            if (message.messageType === 'system') {
                messageDiv.className = 'message system-message';
                messageDiv.innerHTML = `<div class="system-message-content">${this.escapeHtml(message.content)}</div>`;
                return messageDiv;
            }

            messageDiv.className = `message ${message.type}`;
            const time = new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                hour: '2-digit', minute: '2-digit'
            });

            let avatarHTML = '';
            let nameHTML = '';

            if (message.type === 'incoming' && this.isGroup && message.senderName) {
                const senderAvatar = message.avatar || `https://i.pravatar.cc/150?u=${message.senderId}`;
                const senderId = message.senderId;
                avatarHTML = `<img src="${senderAvatar}" alt="" class="message-avatar clickable-avatar" data-user-id="${senderId}" style="cursor:pointer;">`;
                nameHTML = `<div class="message-sender">${message.senderName}</div>`;
            }

            let contentHTML = '';
            if (message.messageType === 'image') {
                // data-lightbox="true" là marker để ImageLightbox nhận biết
                contentHTML = `<img src="${message.content}" alt="Ảnh" class="message-image" data-lightbox="true">`;
            } else {
                contentHTML = `<p class="message-text">${message.content}</p>`;
            }

            messageDiv.innerHTML = `
                ${avatarHTML}
                <div class="message-content-wrapper">
                    ${nameHTML}
                    <div class="message-bubble">
                        ${contentHTML}
                        <span class="message-time">${time}</span>
                    </div>
                </div>
            `;

            // Clickable avatars in messages
            const clickableAvatar = messageDiv.querySelector('.clickable-avatar');
            if (clickableAvatar) {
                clickableAvatar.addEventListener('click', () => {
                    window.location.href = `/profile.html?id=${clickableAvatar.dataset.userId}`;
                });
            }

            // Ảnh trong tin nhắn → mở lightbox khi click
            const msgImage = messageDiv.querySelector('.message-image[data-lightbox]');
            if (msgImage) {
                msgImage.addEventListener('click', () => {
                    if (window.imageLightbox) {
                        window.imageLightbox.open(msgImage.src);
                    }
                });
            }

            return messageDiv;
        }

        sendMessage() {
            const input = document.getElementById('message-input');
            const content = input.value.trim();
            if (!this.currentChatId) return;

            const groupId = this.isGroup ? Number(this.currentChatId) : null;
            const conversationId = !this.isGroup ? Number(this.currentChatId) : null;

            const appendOutgoing = (payload) => {
                document.getElementById('messages-area').appendChild(this.createMessageElement(payload));
                this.scrollToBottom();
            };

            const sendPayload = (type, contentValue) => {
                if (this.isGroup) {
                    chatApp.socketManager.sendGroupMessage({ groupId, type, content: contentValue });
                } else {
                    chatApp.socketManager.sendDirectMessage({ conversationId, type, content: contentValue });
                }
            };

            // Image handling
            if (this.pendingImageDataUrl) {
                const dataUrl = this.pendingImageDataUrl;
                const file = this.pendingImageFile;
                this.clearImagePreview();

                appendOutgoing({
                    id: 'tmp_' + Date.now(),
                    senderId: String(CURRENT_USER_ID),
                    content: dataUrl,
                    messageType: 'image',
                    timestamp: Date.now(),
                    type: 'outgoing'
                });

                if (file) {
                    API.uploadChatImage(file)
                        .then(r => sendPayload("IMAGE", r.url || dataUrl))
                        .catch(() => sendPayload("IMAGE", dataUrl));
                } else {
                    sendPayload("IMAGE", dataUrl);
                }
            }

            // Text handling
            if (content) {
                appendOutgoing({
                    id: 'tmp_' + Date.now(),
                    senderId: String(CURRENT_USER_ID),
                    content: content,
                    messageType: 'text',
                    timestamp: Date.now(),
                    type: 'outgoing'
                });
                input.value = '';
                sendPayload("TEXT", content);
            }
        }

        scrollToBottom() {
            const messagesArea = document.getElementById('messages-area');
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }

        addIncomingMessage(message) {
            if (message.chatId !== this.currentChatId) return;
            document.getElementById('messages-area').appendChild(
                this.createMessageElement({ ...message, type: 'incoming' })
            );
            this.scrollToBottom();
        }
    }

    /**
     * ==========================================
     * MODAL MANAGER CLASS
     * ==========================================
     */
    class ModalManager {
        constructor() {
            this.selectedMembers = [];
            this.selectedAddMembers = [];
            this.newGroupAvatarDataUrl = null;
            this.newGroupAvatarFile = null;
            this.init();
        }

        init() {
            this.setupModals();
            this.setupCreateGroupButton();
            this.setupHeaderAvatarClick();
        }

        setupHeaderAvatarClick() {
            const headerAvatar = document.getElementById('header-avatar');
            headerAvatar.style.cursor = 'pointer';
        }

        setupModals() {
            // Close buttons
            document.querySelectorAll('.close-modal, [data-modal]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const modalId = btn.dataset.modal;
                    if (modalId) this.closeModal(modalId);
                });
            });

            // Click outside modal to close
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) this.closeModal(modal.id);
                });
            });

            // Create Group
            document.getElementById('submit-group-btn').addEventListener('click', () => this.createGroup());
            document.getElementById('member-search-input').addEventListener('input', (e) => {
                this.renderCreateMembersList(e.target.value);
            });

            // Rename Group
            document.getElementById('submit-rename-btn').addEventListener('click', () => this.renameGroup());
            document.getElementById('rename-group-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.renameGroup();
            });

            // Change Avatar
            document.getElementById('choose-avatar-btn').addEventListener('click', () => {
                document.getElementById('group-avatar-input').click();
            });
            document.getElementById('avatar-upload-area').addEventListener('dragover', (e) => {
                e.preventDefault();
                e.currentTarget.classList.add('drag-over');
            });
            document.getElementById('avatar-upload-area').addEventListener('dragleave', (e) => {
                e.currentTarget.classList.remove('drag-over');
            });
            document.getElementById('avatar-upload-area').addEventListener('drop', (e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) this.previewGroupAvatar(file);
            });
            document.getElementById('group-avatar-input').addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.previewGroupAvatar(file);
            });
            document.getElementById('submit-avatar-btn').addEventListener('click', () => this.saveGroupAvatar());

            // Manage Members
            document.getElementById('submit-manage-members-btn').addEventListener('click', () => this.saveManagedMembers());
            document.getElementById('manage-member-search-input').addEventListener('input', async (e) => {
                const q = e.target.value.toLowerCase();
                const groupId = Number(chatApp.chatWindowManager.currentChatId);
                const addable = await API.getJson(`/api/chat/groups/${groupId}/members/search?q=${encodeURIComponent(q)}`);
                const container = document.getElementById('add-members-list');
                container.innerHTML = '';
                (addable || []).forEach(u => {
                    container.appendChild(this.createMemberItem(u, 'add', this.selectedAddMembers.includes(u.id)));
                });
            });

            // Delete Group
            document.getElementById('submit-delete-btn').addEventListener('click', () => this.confirmDeleteGroup());
            document.getElementById('delete-confirm-input').addEventListener('input', (e) => {
                const group = MOCK_DATA.groups.find(g => g.id === chatApp.chatWindowManager.currentChatId);
                const errorMsg = document.getElementById('delete-error-msg');
                if (group && e.target.value === group.name) {
                    errorMsg.style.display = 'none';
                    document.getElementById('submit-delete-btn').classList.add('ready');
                } else {
                    document.getElementById('submit-delete-btn').classList.remove('ready');
                }
            });
        }

        setupCreateGroupButton() {
            document.getElementById('create-group-icon-btn').addEventListener('click', () => {
                this.openModal('create-group-modal');
                this.selectedMembers = [];
                document.getElementById('group-name-input').value = '';
                document.getElementById('member-search-input').value = '';
                this.renderCreateMembersList('');
            });
        }

        async renderCreateMembersList(q) {
            const container = document.getElementById('members-list');
            container.innerHTML = '';
            const users = await API.searchFriendUsers(q || '');
            (users || []).forEach((u) => {
                const selected = this.selectedMembers.includes(u.id);
                const item = document.createElement('div');
                item.className = `member-item ${selected ? 'selected' : ''}`;
                item.innerHTML = `
                    <input type="checkbox" ${selected ? 'checked' : ''}>
                    <img src="${u.avatar || 'https://i.pravatar.cc/150?u=' + u.id}" alt="" class="member-avatar">
                    <label>${u.nickname || u.username} (@${u.username})</label>
                `;
                const checkbox = item.querySelector('input');
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) this.selectedMembers.push(u.id);
                    else this.selectedMembers = this.selectedMembers.filter(id => id !== u.id);
                    item.classList.toggle('selected', e.target.checked);
                });
                container.appendChild(item);
            });
        }

        openModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.style.display = 'flex';
            requestAnimationFrame(() => modal.classList.add('visible'));
        }

        closeModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.remove('visible');
            setTimeout(() => { modal.style.display = 'none'; }, 250);
        }

        openRenameGroupModal() {
            const group = MOCK_DATA.groups.find(g => g.id === chatApp.chatWindowManager.currentChatId);
            if (!group) return;
            document.getElementById('rename-group-input').value = group.name;
            this.openModal('rename-group-modal');
            setTimeout(() => document.getElementById('rename-group-input').focus(), 300);
        }

        openChangeAvatarModal() {
            this.newGroupAvatarDataUrl = null;
            this.newGroupAvatarFile = null;
            document.getElementById('avatar-preview-img').style.display = 'none';
            document.getElementById('avatar-placeholder').style.display = 'flex';
            document.getElementById('submit-avatar-btn').disabled = true;
            document.getElementById('group-avatar-input').value = '';
            this.openModal('change-avatar-modal');
        }

        openDeleteGroupModal() {
            const groupId = chatApp.chatWindowManager.currentChatId;
            const groupData = chatApp.chatWindowManager.currentChatData;
            if (!groupData) return;

            // Kiểm tra nếu current user là admin của nhóm (lấy từ Header hoặc ChatData)
            if (String(groupData.adminUserId) !== String(CURRENT_USER_ID)) {
                this.showToast('Chỉ quản trị viên mới có quyền xóa nhóm', 'error');
                return;
            }

            document.getElementById('delete-group-name-hint').textContent = `"${groupData.name}"`;
            document.getElementById('delete-confirm-input').value = '';
            document.getElementById('delete-error-msg').style.display = 'none';
            document.getElementById('submit-delete-btn').classList.remove('ready');
            this.openModal('delete-group-modal');
            setTimeout(() => document.getElementById('delete-confirm-input').focus(), 300);
        }

        async openManageMembersModal() {
            const groupId = Number(chatApp.chatWindowManager.currentChatId);
            try {
                const members = await API.listGroupMembers(groupId);
                this.selectedAddMembers = [];
                this.renderCurrentMembersList(groupId, members);

                // Load addable friends
                const addable = await API.getJson(`/api/chat/groups/${groupId}/members/search?q=`);
                const container = document.getElementById('add-members-list');
                container.innerHTML = '';
                (addable || []).forEach(u => {
                    container.appendChild(this.createMemberItem(u, 'add', false));
                });

                document.getElementById('manage-member-search-input').value = '';
                this.openModal('manage-members-modal');
            } catch (e) {
                this.showToast('Không thể tải danh sách thành viên', 'error');
            }
        }

        renderCurrentMembersList(groupId, members) {
            const container = document.getElementById('current-members-list');
            container.innerHTML = '';

            const adminId = String(chatApp.chatWindowManager.currentChatData.adminUserId);
            const isMeAdmin = adminId === String(CURRENT_USER_ID);

            const sortedMembers = (members || []).sort((a, b) => {
                if (String(a.userId) === adminId) return -1;
                if (String(b.userId) === adminId) return 1;
                return 0;
            });

            sortedMembers.forEach(m => {
                const memberUserId = String(m.userId);
                const isMe = memberUserId === String(CURRENT_USER_ID);
                const isAdmin = memberUserId === adminId;

                const item = document.createElement('div');
                item.className = 'current-member-item';
                item.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px; flex:1;">
                        <img src="${m.avatar || `https://i.pravatar.cc/150?u=${m.userId}`}" alt="" class="member-avatar">
                        <div style="display:flex; flex-direction:column;">
                            <span class="member-name">${m.nickname || m.username}${isMe ? ' (Bạn)' : ''}</span>
                            ${isAdmin ? '<span style="font-size:10px; color:#42ADE2; font-weight:bold;">Quản trị viên</span>' : ''}
                        </div>
                    </div>
                    ${(isMeAdmin && !isMe) ? `
                    <button class="remove-member-btn" title="Xóa khỏi nhóm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>` : ''}
                `;

                if (isMeAdmin && !isMe) {
                    item.querySelector('.remove-member-btn').addEventListener('click', async () => {
                        if (confirm(`Xóa ${m.nickname || m.username} khỏi nhóm?`)) {
                            try {
                                await API.removeGroupMember(groupId, m.userId);
                                item.remove();
                                this.showToast('Đã xóa thành viên', 'success');
                                chatApp.sidebarManager.renderGroups();
                            } catch (e) {
                                this.showToast('Không thể xóa thành viên', 'error');
                            }
                        }
                    });
                }

                container.appendChild(item);
            });
        }

        createMemberItem(member, type, isSelected = false) {
            const item = document.createElement('div');
            item.className = `member-item ${isSelected ? 'selected' : ''}`;
            const displayName = member.nickname || member.username;
            item.dataset.memberName = displayName.toLowerCase();

            item.innerHTML = `
                <input type="checkbox" id="${type}-member-${member.id}" ${isSelected ? 'checked' : ''}>
                <img src="${member.avatar || `https://i.pravatar.cc/150?u=${member.id}`}" alt="" class="member-avatar">
                <label for="${type}-member-${member.id}">${displayName}</label>
            `;

            const checkbox = item.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                if (type === 'create') {
                    if (e.target.checked) this.selectedMembers.push(member.id);
                    else this.selectedMembers = this.selectedMembers.filter(id => id !== member.id);
                } else {
                    if (e.target.checked) this.selectedAddMembers.push(member.id);
                    else this.selectedAddMembers = this.selectedAddMembers.filter(id => id !== member.id);
                }
                item.classList.toggle('selected', e.target.checked);
            });

            return item;
        }

        filterMembers(searchTerm, containerId) {
            const container = document.getElementById(containerId);
            const items = container.querySelectorAll('.member-item');
            const search = searchTerm.toLowerCase();
            items.forEach(item => {
                item.style.display = item.dataset.memberName.includes(search) ? 'flex' : 'none';
            });
        }

        previewGroupAvatar(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.newGroupAvatarDataUrl = e.target.result;
                this.newGroupAvatarFile = file;
                document.getElementById('avatar-preview-img').src = e.target.result;
                document.getElementById('avatar-preview-img').style.display = 'block';
                document.getElementById('avatar-placeholder').style.display = 'none';
                document.getElementById('submit-avatar-btn').disabled = false;
            };
            reader.readAsDataURL(file);
        }

        async saveGroupAvatar() {
            if (!this.newGroupAvatarFile) return;
            const groupId = chatApp.chatWindowManager.currentChatId;
            try {
                const updated = await API.uploadGroupAvatar(Number(groupId), this.newGroupAvatarFile);
                document.getElementById('header-avatar').src = updated.avatar || this.newGroupAvatarDataUrl;
                chatApp.sidebarManager.renderGroups();
                this.closeModal('change-avatar-modal');
                this.showToast('Ảnh đại diện đã được cập nhật!', 'success');
            } catch (e) {
                this.showToast(e.message || 'Không thể cập nhật ảnh đại diện', 'error');
            }
        }

        async saveManagedMembers() {
            const groupId = Number(chatApp.chatWindowManager.currentChatId);
            if (this.selectedAddMembers.length === 0) {
                this.showToast('Vui lòng chọn ít nhất một thành viên để thêm', 'warning');
                return;
            }
            try {
                // Ensure IDs are numbers
                const userIds = this.selectedAddMembers.map(id => Number(id));
                await API.addGroupMembers(groupId, userIds);

                this.selectedAddMembers = []; // Clear after success
                chatApp.sidebarManager.renderGroups();
                chatApp.chatWindowManager.loadChat(String(groupId), chatApp.chatWindowManager.currentChatData, true);
                this.closeModal('manage-members-modal');
                this.showToast('Đã cập nhật thành viên nhóm!', 'success');
            } catch (e) {
                this.showToast('Không thể cập nhật thành viên', 'error');
            }
        }

        async createGroup() {
            const groupName = document.getElementById('group-name-input').value.trim();
            if (!groupName) { this.showToast('Vui lòng nhập tên nhóm', 'error'); return; }
            if (this.selectedMembers.length < 2) {
                this.showToast('Nhóm cần ít nhất 3 thành viên (bao gồm bạn)', 'error');
                return;
            }
            try {
                await API.createGroup({ name: groupName, memberIds: this.selectedMembers });
                chatApp.sidebarManager.renderGroups();
                this.closeModal('create-group-modal');
                chatApp.sidebarManager.switchTab('groups');
                this.showToast(`Đã tạo nhóm "${groupName}"!`, 'success');
            } catch (e) {
                this.showToast(e.message || 'Không thể tạo nhóm', 'error');
            }
        }

        async renameGroup() {
            const newName = document.getElementById('rename-group-input').value.trim();
            if (!newName) { this.showToast('Vui lòng nhập tên nhóm mới', 'error'); return; }

            const groupId = Number(chatApp.chatWindowManager.currentChatId);
            try {
                await API.renameGroup(groupId, newName);
                document.getElementById('header-name').textContent = newName;
                chatApp.sidebarManager.renderGroups();
                this.closeModal('rename-group-modal');
                this.showToast(`Đã đổi tên nhóm thành "${newName}"!`, 'success');
            } catch (e) {
                this.showToast('Không thể đổi tên nhóm', 'error');
            }
        }

        async confirmDeleteGroup() {
            const groupId = Number(chatApp.chatWindowManager.currentChatId);
            const currentName = document.getElementById('header-name').textContent;
            const inputVal = document.getElementById('delete-confirm-input').value;

            if (inputVal !== currentName) {
                const inputEl = document.getElementById('delete-confirm-input');
                document.getElementById('delete-error-msg').style.display = 'block';
                inputEl.classList.add('shake');
                setTimeout(() => inputEl.classList.remove('shake'), 500);
                return;
            }

            try {
                await API.leaveOrDeleteGroup(groupId, null);
                chatApp.sidebarManager.renderGroups();
                document.getElementById('chat-container').style.display = 'none';
                document.getElementById('empty-state').style.display = 'flex';
                chatApp.chatWindowManager.currentChatId = null;
                chatApp.chatWindowManager.currentChatData = null;
                chatApp.chatWindowManager.isGroup = false;
                this.closeModal('delete-group-modal');
                this.showToast(`Đã giải tán/rời nhóm "${currentName}"`, 'success');
            } catch (e) {
                this.showToast(e.message || 'Thao tác thất bại', 'error');
            }
        }

        async confirmLeaveGroup() {
            const groupId = Number(chatApp.chatWindowManager.currentChatId);
            const currentName = document.getElementById('header-name').textContent;

            if (!confirm(`Bạn có chắc chắn muốn rời khỏi nhóm "${currentName}"?`)) return;

            try {
                // Đối với thành viên, transferAdminToUserId là null
                await API.leaveOrDeleteGroup(groupId, null);
                chatApp.sidebarManager.renderGroups();
                document.getElementById('chat-container').style.display = 'none';
                document.getElementById('empty-state').style.display = 'flex';
                chatApp.chatWindowManager.currentChatId = null;
                chatApp.chatWindowManager.currentChatData = null;
                chatApp.chatWindowManager.isGroup = false;
                this.showToast(`Đã rời khỏi nhóm "${currentName}"`, 'success');
            } catch (e) {
                this.showToast(e.message || 'Thao tác thất bại', 'error');
            }
        }

        showToast(message, type = 'success') {
            const existing = document.querySelector('.toast-notification');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.className = `toast-notification toast-${type}`;
            toast.innerHTML = `
                <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
                <span>${message}</span>
            `;
            document.body.appendChild(toast);
            requestAnimationFrame(() => toast.classList.add('visible'));
            setTimeout(() => {
                toast.classList.remove('visible');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }

    /**
     * ==========================================
     * IMAGE LIGHTBOX CLASS
     * Xử lý toàn bộ logic phóng to ảnh:
     *   - open / close với animation
     *   - zoom bằng scroll wheel
     *   - zoom bằng double-click
     *   - drag để pan khi đã zoom
     *   - nút zoom in / zoom out / reset
     *   - đóng khi click backdrop hoặc nhấn Esc
     * ==========================================
     */
    class ImageLightbox {
        constructor() {
            // ── Elements ──
            this.$lb         = document.getElementById('image-lightbox');
            this.$backdrop   = document.getElementById('lightbox-backdrop');
            this.$container  = document.getElementById('lightbox-img-container');
            this.$img        = document.getElementById('lightbox-img');
            this.$closeBtn   = document.getElementById('lightbox-close');
            this.$zoomIn     = document.getElementById('lightbox-zoom-in');
            this.$zoomOut    = document.getElementById('lightbox-zoom-out');
            this.$zoomReset  = document.getElementById('lightbox-zoom-reset');
            this.$zoomLabel  = document.getElementById('lightbox-zoom-label');
            this.$hint       = document.getElementById('lightbox-hint');

            // ── Zoom state ──
            this.scale       = 1;
            this.minScale    = 0.5;
            this.maxScale    = 5;
            this.scaleStep   = 0.25;

            // ── Pan / drag state ──
            this.panX        = 0;
            this.panY        = 0;
            this.isDragging  = false;
            this.dragStartX  = 0;
            this.dragStartY  = 0;
            this.panStartX   = 0;
            this.panStartY   = 0;

            this._isOpen     = false;
            this._closeTimer = null;

            this._bindEvents();
        }

        /* ──────────────── PUBLIC API ──────────────── */

        open(src) {
            if (this._isOpen) this._resetTransform();

            this.$img.src = '';          // flash clear
            this.$img.src = src;
            this._resetTransform();

            // Hiển thị overlay
            this.$lb.style.display = 'flex';
            // Cần 1 frame để transition hoạt động
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.$lb.classList.add('lightbox--open');
                });
            });
            this._isOpen = true;
            document.body.style.overflow = 'hidden';   // Chặn scroll page

            // Ẩn hint sau 3 giây
            clearTimeout(this._hintTimer);
            this.$hint.classList.remove('lightbox-hint--hide');
            this._hintTimer = setTimeout(() => {
                this.$hint.classList.add('lightbox-hint--hide');
            }, 3000);
        }

        close() {
            if (!this._isOpen) return;
            this.$lb.classList.remove('lightbox--open');
            this._isOpen = false;
            document.body.style.overflow = '';

            // Đợi animation fade-out xong rồi ẩn hẳn
            clearTimeout(this._closeTimer);
            this._closeTimer = setTimeout(() => {
                this.$lb.style.display = 'none';
                this.$img.src = '';
                this._resetTransform();
            }, 300);
        }

        /* ──────────────── PRIVATE ──────────────── */

        _resetTransform() {
            this.scale = 1;
            this.panX  = 0;
            this.panY  = 0;
            this._applyTransform();
            this._updateZoomLabel();
        }

        _applyTransform() {
            this.$img.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
            // Con trỏ: grab khi đang zoom, default khi scale = 1
            this.$img.style.cursor = this.scale > 1
                ? (this.isDragging ? 'grabbing' : 'grab')
                : 'default';
        }

        _updateZoomLabel() {
            this.$zoomLabel.textContent = Math.round(this.scale * 100) + '%';
        }

        _zoom(delta, originX, originY) {
            const prevScale = this.scale;
            this.scale = Math.min(this.maxScale, Math.max(this.minScale, this.scale + delta));
            if (this.scale === prevScale) return;

            // Giữ điểm zoom cố định (zoom-to-point)
            if (originX !== undefined && originY !== undefined) {
                const rect = this.$img.getBoundingClientRect();
                const imgCenterX = rect.left + rect.width  / 2;
                const imgCenterY = rect.top  + rect.height / 2;
                const dx = originX - imgCenterX;
                const dy = originY - imgCenterY;
                const ratio = this.scale / prevScale;
                this.panX = this.panX * ratio + dx * (ratio - 1);
                this.panY = this.panY * ratio + dy * (ratio - 1);
            }

            this._applyTransform();
            this._updateZoomLabel();
        }

        _bindEvents() {
            /* ── Nút đóng ── */
            this.$closeBtn.addEventListener('click', () => this.close());

            /* ── Click backdrop (bên ngoài ảnh) → đóng ── */
            this.$backdrop.addEventListener('click', (e) => {
                // Chỉ đóng khi click đúng backdrop, không phải img hay container
                if (e.target === this.$backdrop) this.close();
            });

            /* ── Phím tắt ── */
            document.addEventListener('keydown', (e) => {
                if (!this._isOpen) return;
                if (e.key === 'Escape')   this.close();
                if (e.key === '+' || e.key === '=') this._zoom(+this.scaleStep);
                if (e.key === '-')        this._zoom(-this.scaleStep);
                if (e.key === '0')        this._resetTransform();
            });

            /* ── Scroll wheel → zoom ── */
            this.$container.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY < 0 ? +this.scaleStep : -this.scaleStep;
                this._zoom(delta, e.clientX, e.clientY);
            }, { passive: false });

            /* ── Double-click → toggle zoom 2x ── */
            this.$img.addEventListener('dblclick', (e) => {
                if (this.scale !== 1) {
                    this._resetTransform();
                } else {
                    this._zoom(1, e.clientX, e.clientY);   // zoom lên 2×
                }
            });

            /* ── Drag to pan ── */
            this.$img.addEventListener('mousedown', (e) => {
                if (this.scale <= 1) return;
                e.preventDefault();
                this.isDragging = true;
                this.dragStartX = e.clientX;
                this.dragStartY = e.clientY;
                this.panStartX  = this.panX;
                this.panStartY  = this.panY;
                this.$img.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', (e) => {
                if (!this.isDragging) return;
                this.panX = this.panStartX + (e.clientX - this.dragStartX);
                this.panY = this.panStartY + (e.clientY - this.dragStartY);
                this._applyTransform();
            });

            document.addEventListener('mouseup', () => {
                if (!this.isDragging) return;
                this.isDragging = false;
                this._applyTransform();
            });

            /* ── Touch drag (mobile) ── */
            let touchStartX = 0, touchStartY = 0;
            let pinchStartDist = 0, pinchStartScale = 1;

            this.$img.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1 && this.scale > 1) {
                    this.isDragging = true;
                    this.dragStartX = e.touches[0].clientX;
                    this.dragStartY = e.touches[0].clientY;
                    this.panStartX  = this.panX;
                    this.panStartY  = this.panY;
                } else if (e.touches.length === 2) {
                    // Pinch zoom
                    pinchStartDist  = this._touchDist(e.touches);
                    pinchStartScale = this.scale;
                }
            }, { passive: true });

            this.$img.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (e.touches.length === 1 && this.isDragging) {
                    this.panX = this.panStartX + (e.touches[0].clientX - this.dragStartX);
                    this.panY = this.panStartY + (e.touches[0].clientY - this.dragStartY);
                    this._applyTransform();
                } else if (e.touches.length === 2) {
                    const dist  = this._touchDist(e.touches);
                    const ratio = dist / pinchStartDist;
                    this.scale  = Math.min(this.maxScale, Math.max(this.minScale, pinchStartScale * ratio));
                    this._applyTransform();
                    this._updateZoomLabel();
                }
            }, { passive: false });

            this.$img.addEventListener('touchend', () => {
                this.isDragging = false;
            });

            /* ── Nút toolbar ── */
            this.$zoomIn.addEventListener('click',    () => this._zoom(+this.scaleStep));
            this.$zoomOut.addEventListener('click',   () => this._zoom(-this.scaleStep));
            this.$zoomReset.addEventListener('click', () => this._resetTransform());
        }

        _touchDist(touches) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        }
    }

    /**
     * ==========================================
     * MAIN CHAT APP CLASS
     * ==========================================
     */
    class ChatApp {
        constructor() {
            this.socketManager = new ChatSocketManager();
            this.sidebarManager = new SidebarManager();
            this.chatWindowManager = new ChatWindowManager();
            this.modalManager = new ModalManager();
            // Khởi tạo lightbox — gắn vào window để ChatWindowManager truy cập
            window.imageLightbox = new ImageLightbox();
            this.init();
        }

        init() {
            console.log('[ChatApp] Initializing...');
            this.socketManager.connect();
            this.bootstrapUnread();
            console.log('[ChatApp] Ready!');
        }

        async bootstrapUnread() {
            if (!CURRENT_USER_ID) return;
            try {
                const r = await API.unreadSummary();
                this.applyUnreadDot((r && r.totalUnread) || 0);
                this.applyTabUnread(r || {});
            } catch (e) {}
        }

        handleChatEvent(evt) {
            if (!evt || !evt.type) return;

            if (evt.type === "UNREAD_COUNT") {
                this.applyUnreadDot(Number(evt.totalUnread || 0));
                return;
            }

            if (evt.type === "CONVERSATION_STATUS") {
                // refresh both lists; if rejected and currently open -> clear chat
                const convId = evt.conversationId ? String(evt.conversationId) : null;
                if (convId && this.chatWindowManager.currentChatId === convId && !evt.conversationStatus) {
                    // rejected/deleted
                    document.getElementById('chat-container').style.display = 'none';
                    document.getElementById('empty-state').style.display = 'flex';
                    this.chatWindowManager.currentChatId = null;
                    this.chatWindowManager.currentChatData = null;
                    this.chatWindowManager.isGroup = false;
                }
                this.sidebarManager.renderDirectMessages();
                this.sidebarManager.renderMessageRequests();
                this.bootstrapUnread();
                return;
            }

            if (evt.type === "MESSAGE" && evt.message) {
                const m = evt.message;
                const convId = String(m.conversationId);
                const fromMe = String(m.senderId) === String(CURRENT_USER_ID || "");

                // If this conversation is currently open, append and mark read.
                if (this.chatWindowManager.currentChatId === convId && !this.chatWindowManager.isGroup) {
                    if (fromMe) return;
                    this.chatWindowManager.addIncomingMessage({
                        chatId: convId,
                        senderId: String(m.senderId),
                        content: m.content,
                        messageType: (m.type || "TEXT").toLowerCase(),
                        timestamp: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
                        senderName: m.senderNickname,
                        avatar: m.senderAvatar,
                    });
                    this.socketManager.markRead(Number(convId));
                } else {
                    // refresh lists to update preview + unread
                    this.sidebarManager.renderDirectMessages();
                    this.sidebarManager.renderMessageRequests();
                    this.bootstrapUnread();
                }
            }

            if (evt.type === "GROUP_STATE") {
                this.sidebarManager.renderGroups();
                this.bootstrapUnread();
                // Nếu đang mở đúng nhóm này, cần refresh lại dữ liệu để mở khóa UI
                const gid = evt.groupId ? String(evt.groupId) : null;
                if (gid && this.chatWindowManager.currentChatId === gid && this.chatWindowManager.isGroup) {
                    API.listGroups().then(groups => {
                        const updated = groups.find(g => String(g.id) === gid);
                        if (updated) {
                            const chatData = {
                                id: String(updated.id),
                                name: updated.name,
                                avatar: updated.avatar || `https://i.pravatar.cc/150?u=group-${updated.id}`,
                                lastMessage: updated.lastMessagePreview || "",
                                timestamp: updated.lastMessageAt ? new Date(updated.lastMessageAt).getTime() : Date.now(),
                                unreadCount: updated.unreadCount || 0,
                                currentUserActiveMember: updated.currentUserActiveMember,
                                currentUserRemovedByAdmin: updated.currentUserRemovedByAdmin,
                                adminUserId: updated.adminUserId,
                                memberCount: updated.memberCount
                            };
                            this.chatWindowManager.loadChat(gid, chatData, true);
                        }
                    });
                }
                return;
            }

            if (evt.type === "GROUP_MESSAGE" && evt.message) {
                const m = evt.message;
                const groupId = String(evt.groupId || m.conversationId);
                const fromMe = String(m.senderId) === String(CURRENT_USER_ID || "");
                if (this.chatWindowManager.currentChatId === groupId && this.chatWindowManager.isGroup && !fromMe) {
                    this.chatWindowManager.addIncomingMessage({
                        chatId: groupId,
                        senderId: String(m.senderId),
                        content: m.content,
                        messageType: (m.type || "TEXT").toLowerCase(),
                        timestamp: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
                        senderName: m.senderNickname,
                        avatar: m.senderAvatar,
                    });
                    API.markGroupRead(Number(groupId));
                }
                this.sidebarManager.renderGroups();
                this.bootstrapUnread();
            }
        }

        applyUnreadDot(totalUnread) {
            const hasUnread = Number(totalUnread || 0) > 0;
            const el = document.getElementById("chatUnreadDot");
            if (el) {
                el.style.display = hasUnread ? "inline-block" : "none";
                el.setAttribute("aria-hidden", hasUnread ? "false" : "true");
            }
        }

        applyTabUnread(summary) {
            const setLabel = (tab, count) => {
                const btn = document.querySelector(`.tab[data-tab="${tab}"]`);
                if (!btn) return;
                const base = tab === "direct" ? "Nhắn tin" : (tab === "groups" ? "Nhóm" : "Tin nhắn chờ");
                btn.textContent = count > 0 ? `${base} (${count})` : base;
            };
            setLabel("direct", Number(summary.directUnread || 0));
            setLabel("groups", Number(summary.groupUnread || 0));
            setLabel("requests", Number(summary.requestUnread || 0));
        }
    }

    /**
     * ==========================================
     * INITIALIZE APP
     * ==========================================
     */
    let chatApp;
    document.addEventListener('DOMContentLoaded', () => {
        chatApp = new ChatApp();
    });
