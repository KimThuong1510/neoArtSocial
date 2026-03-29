
    /**
     * ==========================================
     * MOCK DATA
     * ==========================================
     */
    const MOCK_DATA = {
        directMessages: [
            { id: '1', username: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?img=1', lastMessage: 'Chào bạn, hôm nay thế nào?', timestamp: Date.now() - 300000, unreadCount: 2, isOnline: true },
            { id: '2', username: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?img=5', lastMessage: 'Okay, cảm ơn bạn nhé!', timestamp: Date.now() - 3600000, unreadCount: 0, isOnline: false },
            { id: '3', username: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?img=3', lastMessage: 'Meeting lúc 2 giờ chiều nhé', timestamp: Date.now() - 7200000, unreadCount: 5, isOnline: true },
            { id: '4', username: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?img=9', lastMessage: 'File đã gửi cho bạn rồi', timestamp: Date.now() - 86400000, unreadCount: 0, isOnline: false }
        ],
        groups: [
            { id: 'g1', name: 'Nhóm Dự Án A', avatar: 'https://i.pravatar.cc/150?img=20', lastMessage: 'Hoàng: Đã hoàn thành task', timestamp: Date.now() - 600000, unreadCount: 3, members: ['1', '2', '3'], createdBy: 'me' },
            { id: 'g2', name: 'Team Marketing', avatar: 'https://i.pravatar.cc/150?img=21', lastMessage: 'Lan: Chiến dịch mới cần review', timestamp: Date.now() - 3600000, unreadCount: 0, members: ['2', '4'], createdBy: '2' }
        ],
        messageRequests: [
            { id: 'r1', senderName: 'Người lạ 1', avatar: 'https://i.pravatar.cc/150?img=7', preview: 'Xin chào, tôi muốn kết nối với bạn' },
            { id: 'r2', senderName: 'Người lạ 2', avatar: 'https://i.pravatar.cc/150?img=8', preview: 'Chào bạn, có thể làm quen không?' }
        ],
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
        }

        connect() {
            console.log('[Socket] Connecting...');
            setTimeout(() => {
                this.isConnected = true;
                console.log('[Socket] Connected!');
            }, 1000);
        }

        sendMessage(data) {
            console.log('[Socket] Sending message:', data);
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
            this.init();
        }

        init() {
            this.renderDirectMessages();
            this.renderGroups();
            this.renderMessageRequests();
            this.setupTabs();
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
            container.innerHTML = '';
            MOCK_DATA.directMessages.forEach(chat => {
                container.appendChild(this.createChatItem(chat));
            });
        }

        renderGroups() {
            const container = document.getElementById('groups-list');
            container.innerHTML = '';
            MOCK_DATA.groups.forEach(group => {
                container.appendChild(this.createChatItem(group, true));
            });
        }

        renderMessageRequests() {
            const container = document.getElementById('requests-list');
            container.innerHTML = '';
            MOCK_DATA.messageRequests.forEach(request => {
                container.appendChild(this.createRequestItem(request));
            });
        }

        createChatItem(chat, isGroup = false) {
            const item = document.createElement('div');
            item.className = 'chat-item';
            item.dataset.chatId = chat.id;
            const timeStr = this.formatTime(chat.timestamp);

            item.innerHTML = `
                <img src="${chat.avatar}" alt="${chat.username || chat.name}" class="chat-avatar clickable-avatar" data-user-id="${chat.id}">
                <div class="chat-info">
                    <div class="chat-header-row">
                        <span class="chat-name">${chat.username || chat.name}</span>
                        <span class="chat-time">${timeStr}</span>
                    </div>
                    <div class="chat-message-row">
                        <span class="chat-last-message">${chat.lastMessage}</span>
                        ${chat.unreadCount > 0 ? `<span class="unread-badge">${chat.unreadCount}</span>` : ''}
                    </div>
                </div>
            `;

            // Avatar click → profile
            const avatar = item.querySelector('.clickable-avatar');
            avatar.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = `/profile.html?id=${chat.id}`;
            });

            item.addEventListener('click', () => {
                this.selectChat(chat.id, chat, isGroup);
            });

            return item;
        }

        createRequestItem(request) {
            const item = document.createElement('div');
            item.className = 'request-item';
            item.dataset.requestId = request.id;

            item.innerHTML = `
                <img src="${request.avatar}" alt="${request.senderName}" class="chat-avatar clickable-avatar" data-user-id="${request.id}">
                <div class="request-info">
                    <span class="request-name">${request.senderName}</span>
                    <span class="request-preview">${request.preview}</span>
                    <div class="request-actions">
                        <button class="btn btn-accept" data-request-id="${request.id}">Chấp nhận</button>
                        <button class="btn btn-reject" data-request-id="${request.id}">Từ chối</button>
                    </div>
                </div>
            `;

            item.querySelector('.clickable-avatar').addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = `/profile.html?id=${request.id}`;
            });

            item.querySelector('.btn-accept').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleRequestAction(request.id, 'accept');
            });
            item.querySelector('.btn-reject').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleRequestAction(request.id, 'reject');
            });

            return item;
        }

        handleRequestAction(requestId, action) {
            if (action === 'accept') this.handleAcceptRequest(requestId);
            else this.handleRejectRequest(requestId);
        }

        handleRejectRequest(requestId) {
            const index = MOCK_DATA.messageRequests.findIndex(req => req.id === requestId);
            if (index !== -1) MOCK_DATA.messageRequests.splice(index, 1);
            const item = document.querySelector(`[data-request-id="${requestId}"]`).closest('.request-item');
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            setTimeout(() => this.renderMessageRequests(), 300);
        }

        handleAcceptRequest(requestId) {
            const requestIndex = MOCK_DATA.messageRequests.findIndex(req => req.id === requestId);
            if (requestIndex === -1) return;
            const request = MOCK_DATA.messageRequests[requestIndex];
            const newConversation = {
                id: 'dm_' + Date.now(),
                username: request.senderName,
                avatar: request.avatar,
                lastMessage: request.preview,
                timestamp: Date.now(),
                unreadCount: 0,
                isOnline: false
            };
            MOCK_DATA.directMessages.unshift(newConversation);
            MOCK_DATA.conversations[newConversation.id] = [{
                id: 'm_' + Date.now(),
                senderId: newConversation.id,
                content: request.preview,
                timestamp: Date.now(),
                type: 'incoming'
            }];
            MOCK_DATA.messageRequests.splice(requestIndex, 1);
            this.renderDirectMessages();
            this.renderMessageRequests();
            this.switchTab('direct');
        }

        selectChat(chatId, chatData, isGroup = false) {
            document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('selected'));
            document.querySelector(`[data-chat-id="${chatId}"]`).classList.add('selected');
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
                document.getElementById('image-preview-thumb').src = e.target.result;
                document.getElementById('image-preview-area').style.display = 'flex';
            };
            reader.readAsDataURL(file);
        }

        clearImagePreview() {
            this.pendingImageDataUrl = null;
            document.getElementById('image-preview-area').style.display = 'none';
            document.getElementById('image-preview-thumb').src = '';
        }

        loadChat(chatId, chatData, isGroup = false) {
            this.currentChatId = chatId;
            this.currentChatData = chatData;
            this.isGroup = isGroup;

            document.getElementById('empty-state').style.display = 'none';
            document.getElementById('chat-container').style.display = 'flex';

            this.updateHeader(chatData);

            const menuContainer = document.getElementById('menu-container');
            menuContainer.style.display = isGroup ? 'block' : 'none';

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
                status.textContent = `${chatData.members.length} thành viên`;
                status.className = 'status';
            } else {
                status.textContent = chatData.isOnline ? 'Đang hoạt động' : 'Không hoạt động';
                status.className = chatData.isOnline ? 'status online' : 'status offline';
            }

            // Avatar click → profile (for DM)
            avatar.onclick = () => {
                window.location.href = `/profile.html?id=${chatData.id}`;
            };
        }

        loadMessages(chatId) {
            const messagesArea = document.getElementById('messages-area');
            messagesArea.innerHTML = '';
            const messages = MOCK_DATA.conversations[chatId] || [];
            messages.forEach(message => {
                messagesArea.appendChild(this.createMessageElement(message));
            });
            this.scrollToBottom();
        }

        createMessageElement(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.type}`;

            const time = new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                hour: '2-digit', minute: '2-digit'
            });

            let avatarHTML = '';
            let nameHTML = '';

            if (message.type === 'incoming' && this.isGroup && message.senderName) {
                const senderMember = MOCK_DATA.availableMembers.find(m => m.id === message.senderId);
                const senderAvatar = senderMember ? senderMember.avatar : this.currentChatData.avatar;
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

            // If there's a pending image, send it
            if (this.pendingImageDataUrl) {
                const imageMsg = {
                    id: 'm' + Date.now(),
                    senderId: 'me',
                    content: this.pendingImageDataUrl,
                    messageType: 'image',
                    timestamp: Date.now(),
                    type: 'outgoing'
                };
                if (!MOCK_DATA.conversations[this.currentChatId]) {
                    MOCK_DATA.conversations[this.currentChatId] = [];
                }
                MOCK_DATA.conversations[this.currentChatId].push(imageMsg);
                document.getElementById('messages-area').appendChild(this.createMessageElement(imageMsg));
                this.clearImagePreview();
                this.scrollToBottom();
            }

            if (!content) return;

            const message = {
                id: 'm' + Date.now(),
                senderId: 'me',
                content: content,
                messageType: 'text',
                timestamp: Date.now(),
                type: 'outgoing'
            };

            if (!MOCK_DATA.conversations[this.currentChatId]) {
                MOCK_DATA.conversations[this.currentChatId] = [];
            }
            MOCK_DATA.conversations[this.currentChatId].push(message);
            document.getElementById('messages-area').appendChild(this.createMessageElement(message));
            input.value = '';
            this.scrollToBottom();

            chatApp.socketManager.sendMessage({
                chatId: this.currentChatId,
                content: content,
                timestamp: Date.now()
            });
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
                this.filterMembers(e.target.value, 'members-list');
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
            document.getElementById('manage-member-search-input').addEventListener('input', (e) => {
                this.filterMembers(e.target.value, 'add-members-list');
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
                this.renderMembersList('members-list', 'create');
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
            document.getElementById('avatar-preview-img').style.display = 'none';
            document.getElementById('avatar-placeholder').style.display = 'flex';
            document.getElementById('submit-avatar-btn').disabled = true;
            document.getElementById('group-avatar-input').value = '';
            this.openModal('change-avatar-modal');
        }

        openManageMembersModal() {
            const groupId = chatApp.chatWindowManager.currentChatId;
            const group = MOCK_DATA.groups.find(g => g.id === groupId);
            if (!group) return;

            this.selectedAddMembers = [];
            this.renderCurrentMembersList(group);
            this.renderMembersList('add-members-list', 'add', group.members);
            document.getElementById('manage-member-search-input').value = '';
            this.openModal('manage-members-modal');
        }

        openDeleteGroupModal() {
            const groupId = chatApp.chatWindowManager.currentChatId;
            const group = MOCK_DATA.groups.find(g => g.id === groupId);
            if (!group) return;

            if (group.createdBy !== 'me') {
                this.showToast('Bạn không có quyền xóa nhóm này', 'error');
                return;
            }

            document.getElementById('delete-group-name-hint').textContent = `"${group.name}"`;
            document.getElementById('delete-confirm-input').value = '';
            document.getElementById('delete-error-msg').style.display = 'none';
            document.getElementById('submit-delete-btn').classList.remove('ready');
            this.openModal('delete-group-modal');
            setTimeout(() => document.getElementById('delete-confirm-input').focus(), 300);
        }

        renderCurrentMembersList(group) {
            const container = document.getElementById('current-members-list');
            container.innerHTML = '';

            group.members.forEach(memberId => {
                const member = MOCK_DATA.availableMembers.find(m => m.id === memberId);
                if (!member) return;

                const item = document.createElement('div');
                item.className = 'current-member-item';
                item.dataset.memberId = memberId;
                item.innerHTML = `
                    <img src="${member.avatar}" alt="${member.name}" class="member-avatar clickable-avatar" data-user-id="${memberId}" style="cursor:pointer;">
                    <span class="member-name">${member.name}</span>
                    <button class="remove-member-btn" data-member-id="${memberId}" title="Xóa khỏi nhóm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                `;

                item.querySelector('.clickable-avatar').addEventListener('click', () => {
                    window.location.href = `/profile.html?id=${memberId}`;
                });

                item.querySelector('.remove-member-btn').addEventListener('click', () => {
                    this.removeMemberFromUI(memberId, group, item);
                });

                container.appendChild(item);
            });
        }

        removeMemberFromUI(memberId, group, itemEl) {
            itemEl.style.opacity = '0';
            itemEl.style.transform = 'translateX(20px)';
            itemEl.style.transition = 'all 0.25s ease';
            setTimeout(() => {
                itemEl.remove();
                group.members = group.members.filter(id => id !== memberId);
                // Re-render add list to include this member
                this.renderMembersList('add-members-list', 'add', group.members);
                // Update header count
                const status = document.getElementById('header-status');
                if (chatApp.chatWindowManager.isGroup) {
                    status.textContent = `${group.members.length} thành viên`;
                }
            }, 250);
        }

        renderMembersList(containerId, type, excludeIds = []) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            const membersToPick = type === 'create' ? [] : excludeIds;

            MOCK_DATA.availableMembers.forEach(member => {
                if (type === 'add' && excludeIds.includes(member.id)) return;
                const isSelected = type === 'create'
                    ? this.selectedMembers.includes(member.id)
                    : this.selectedAddMembers.includes(member.id);
                container.appendChild(this.createMemberItem(member, type, isSelected));
            });
        }

        createMemberItem(member, type, isSelected = false) {
            const item = document.createElement('div');
            item.className = `member-item ${isSelected ? 'selected' : ''}`;
            item.dataset.memberName = member.name.toLowerCase();

            item.innerHTML = `
                <input type="checkbox" id="${type}-member-${member.id}" ${isSelected ? 'checked' : ''}>
                <img src="${member.avatar}" alt="${member.name}" class="member-avatar">
                <label for="${type}-member-${member.id}">${member.name}</label>
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
                document.getElementById('avatar-preview-img').src = e.target.result;
                document.getElementById('avatar-preview-img').style.display = 'block';
                document.getElementById('avatar-placeholder').style.display = 'none';
                document.getElementById('submit-avatar-btn').disabled = false;
            };
            reader.readAsDataURL(file);
        }

        saveGroupAvatar() {
            if (!this.newGroupAvatarDataUrl) return;
            const groupId = chatApp.chatWindowManager.currentChatId;
            const group = MOCK_DATA.groups.find(g => g.id === groupId);
            if (!group) return;

            group.avatar = this.newGroupAvatarDataUrl;

            // Update header avatar
            document.getElementById('header-avatar').src = this.newGroupAvatarDataUrl;

            // Update sidebar list
            chatApp.sidebarManager.renderGroups();
            const chatItem = document.querySelector(`[data-chat-id="${groupId}"]`);
            if (chatItem) chatItem.classList.add('selected');

            this.closeModal('change-avatar-modal');
            this.showToast('Ảnh đại diện đã được cập nhật!', 'success');
        }

        saveManagedMembers() {
            const groupId = chatApp.chatWindowManager.currentChatId;
            const group = MOCK_DATA.groups.find(g => g.id === groupId);
            if (!group) return;

            // Add new selected members
            this.selectedAddMembers.forEach(memberId => {
                if (!group.members.includes(memberId)) {
                    group.members.push(memberId);
                }
            });

            const status = document.getElementById('header-status');
            if (chatApp.chatWindowManager.isGroup) {
                status.textContent = `${group.members.length} thành viên`;
            }

            chatApp.sidebarManager.renderGroups();
            const chatItem = document.querySelector(`[data-chat-id="${groupId}"]`);
            if (chatItem) chatItem.classList.add('selected');

            this.closeModal('manage-members-modal');
            this.showToast('Đã cập nhật thành viên nhóm!', 'success');
        }

        createGroup() {
            const groupName = document.getElementById('group-name-input').value.trim();
            if (!groupName) { this.showToast('Vui lòng nhập tên nhóm', 'error'); return; }
            if (this.selectedMembers.length === 0) { this.showToast('Vui lòng chọn ít nhất 1 thành viên', 'error'); return; }

            const newGroup = {
                id: 'g' + Date.now(),
                name: groupName,
                avatar: 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 30 + 20),
                lastMessage: 'Nhóm vừa được tạo',
                timestamp: Date.now(),
                unreadCount: 0,
                members: [...this.selectedMembers],
                createdBy: 'me'
            };

            MOCK_DATA.groups.unshift(newGroup);
            chatApp.sidebarManager.renderGroups();
            this.closeModal('create-group-modal');
            chatApp.sidebarManager.switchTab('groups');
            this.showToast(`Đã tạo nhóm "${groupName}"!`, 'success');
        }

        renameGroup() {
            const newName = document.getElementById('rename-group-input').value.trim();
            if (!newName) { this.showToast('Vui lòng nhập tên nhóm mới', 'error'); return; }

            const groupId = chatApp.chatWindowManager.currentChatId;
            const group = MOCK_DATA.groups.find(g => g.id === groupId);
            if (!group) return;

            group.name = newName;
            document.getElementById('header-name').textContent = newName;
            chatApp.sidebarManager.renderGroups();
            const chatItem = document.querySelector(`[data-chat-id="${groupId}"]`);
            if (chatItem) chatItem.classList.add('selected');

            this.closeModal('rename-group-modal');
            this.showToast(`Đã đổi tên nhóm thành "${newName}"!`, 'success');
        }

        confirmDeleteGroup() {
            const groupId = chatApp.chatWindowManager.currentChatId;
            const group = MOCK_DATA.groups.find(g => g.id === groupId);
            if (!group) return;

            const inputVal = document.getElementById('delete-confirm-input').value;
            if (inputVal !== group.name) {
                document.getElementById('delete-error-msg').style.display = 'block';
                document.getElementById('delete-confirm-input').classList.add('shake');
                setTimeout(() => document.getElementById('delete-confirm-input').classList.remove('shake'), 500);
                return;
            }

            const index = MOCK_DATA.groups.findIndex(g => g.id === groupId);
            if (index !== -1) MOCK_DATA.groups.splice(index, 1);
            delete MOCK_DATA.conversations[groupId];

            chatApp.sidebarManager.renderGroups();
            document.getElementById('chat-container').style.display = 'none';
            document.getElementById('empty-state').style.display = 'flex';

            chatApp.chatWindowManager.currentChatId = null;
            chatApp.chatWindowManager.currentChatData = null;
            chatApp.chatWindowManager.isGroup = false;

            this.closeModal('delete-group-modal');
            this.showToast(`Đã xóa nhóm "${group.name}"`, 'success');
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
            console.log('[ChatApp] Ready!');
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
