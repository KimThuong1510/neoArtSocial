/**
 * Post detail: like, nested comments (REST), real-time new comments (STOMP / WebSocket).
 * Requires: mainPostContainer[data-post-id], #likeBtn, #likeCount, #commentInput, #sendComment, #commentTree
 */
(function () {
    const container = document.getElementById("mainPostContainer");
    if (!container) return;

    const postId = container.getAttribute("data-post-id");
    if (!postId) return;

    const likeBtn = document.getElementById("likeBtn");
    const likeCountEl = document.getElementById("likeCount");
    const commentInput = document.getElementById("commentInput");
    const sendComment = document.getElementById("sendComment");
    const commentTree = document.getElementById("commentTree");

    let replyParentId = null;
    const seenCommentIds = new Set();

    function escapeHtml(s) {
        if (!s) return "";
        const d = document.createElement("div");
        d.textContent = s;
        return d.innerHTML;
    }

    function renderCommentNode(c, depth) {
        const wrap = document.createElement("div");
        wrap.className = "comment-node";
        wrap.style.marginLeft = depth > 0 ? Math.min(depth * 16, 80) + "px" : "0";
        wrap.style.borderLeft = depth > 0 ? "2px solid #eee" : "none";
        wrap.style.paddingLeft = depth > 0 ? "10px" : "0";
        wrap.style.marginTop = "10px";
        wrap.dataset.commentId = String(c.id);

        const avatar = c.authorAvatar || "https://i.pravatar.cc/40?u=" + encodeURIComponent(c.authorUsername || "");
        const name = c.authorNickname || c.authorUsername || "User";

        wrap.innerHTML = `
            <div class="comment-item" style="display:flex;gap:10px;align-items:flex-start;">
                <img class="comment-avatar" src="${escapeHtml(avatar)}" alt="" width="36" height="36" style="border-radius:50%;object-fit:cover;">
                <div class="comment-body" style="flex:1;">
                    <div>
                        <span class="comment-username" style="font-weight:600;">${escapeHtml(name)}</span>
                        <span style="color:#888;font-size:12px;margin-left:6px;">${formatTime(c.createdAt)}</span>
                    </div>
                    <div class="comment-text" style="margin-top:4px;white-space:pre-wrap;">${escapeHtml(c.content)}</div>
                    <button type="button" class="comment-reply-btn" style="margin-top:6px;background:none;border:none;color:#e60023;cursor:pointer;font-size:13px;padding:0;">
                        Trả lời
                    </button>
                </div>
            </div>
        `;

        const replyBtn = wrap.querySelector(".comment-reply-btn");
        replyBtn.addEventListener("click", () => {
            replyParentId = c.id;
            if (commentInput) {
                commentInput.placeholder = "Trả lời @" + name + "...";
                commentInput.focus();
            }
        });

        const repliesBox = document.createElement("div");
        repliesBox.className = "comment-replies-children";
        (c.replies || []).forEach((r) => {
            repliesBox.appendChild(renderCommentNode(r, depth + 1));
        });
        wrap.appendChild(repliesBox);
        return wrap;
    }

    function formatTime(iso) {
        if (!iso) return "";
        try {
            const d = new Date(iso);
            return d.toLocaleString();
        } catch (e) {
            return "";
        }
    }

    function renderAllComments(comments) {
        if (!commentTree) return;
        commentTree.innerHTML = "";
        seenCommentIds.clear();
        (comments || []).forEach((c) => {
            commentTree.appendChild(renderCommentNode(c, 0));
            collectIds(c);
        });
    }

    function collectIds(c) {
        seenCommentIds.add(c.id);
        (c.replies || []).forEach(collectIds);
    }

    function appendCommentIfNew(c) {
        if (!c || !c.id || seenCommentIds.has(c.id)) return false;
        seenCommentIds.add(c.id);
        if (!commentTree) return false;
        if (c.parentId) {
            const parent = commentTree.querySelector('[data-comment-id="' + c.parentId + '"]');
            if (parent) {
                let box = parent.querySelector(".comment-replies-children");
                if (!box) {
                    box = document.createElement("div");
                    box.className = "comment-replies-children";
                    parent.appendChild(box);
                }
                box.appendChild(renderCommentNode(c, 1));
                return true;
            }
        }
        commentTree.appendChild(renderCommentNode(c, 0));
        return true;
    }

    function updateLikeUi(liked, count) {
        if (!likeBtn || !likeCountEl) return;
        likeBtn.className = liked ? "fa-solid fa-heart" : "fa-regular fa-heart";
        likeBtn.style.color = liked ? "#ff4d6d" : "#333";
        likeCountEl.textContent = String(count);
    }

    async function loadSocialState() {
        try {
            const res = await fetch("/api/posts/" + postId + "/social", { credentials: "same-origin" });
            if (!res.ok) throw new Error("load social failed");
            const data = await res.json();
            updateLikeUi(!!data.likedByCurrentUser, data.likeCount);
            const cc = document.getElementById("commentCount");
            if (cc) cc.textContent = String(countCommentsFlat(data.comments || []));
            renderAllComments(data.comments || []);
        } catch (e) {
            console.error(e);
        }
    }

    function countCommentsFlat(list) {
        let n = 0;
        function walk(arr) {
            (arr || []).forEach((c) => {
                n++;
                walk(c.replies || []);
            });
        }
        walk(list);
        return n;
    }

    async function toggleLike() {
        try {
            const res = await fetch("/api/posts/" + postId + "/like", {
                method: "POST",
                credentials: "same-origin",
            });
            if (!res.ok) throw new Error("like failed");
            const data = await res.json();
            updateLikeUi(data.liked, data.likeCount);
        } catch (e) {
            console.error(e);
        }
    }

    async function submitComment() {
        if (!commentInput) return;
        const text = commentInput.value.trim();
        if (!text) return;
        try {
            const res = await fetch("/api/posts/" + postId + "/comments", {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: text,
                    parentId: replyParentId,
                }),
            });
            if (!res.ok) throw new Error("comment failed");
            const c = await res.json();
            if (appendCommentIfNew(c)) {
                const cc = document.getElementById("commentCount");
                if (cc) {
                    const cur = parseInt(cc.textContent, 10) || 0;
                    cc.textContent = String(cur + 1);
                }
            }
            commentInput.value = "";
            replyParentId = null;
            if (commentInput) commentInput.placeholder = "Bạn sẽ nhận xét gì...";
        } catch (e) {
            console.error(e);
            alert("Không gửi được bình luận.");
        }
    }

    if (likeBtn) {
        likeBtn.style.cursor = "pointer";
        likeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleLike();
        });
    }

    if (sendComment && commentInput) {
        sendComment.style.cursor = "pointer";
        sendComment.addEventListener("click", (e) => {
            e.preventDefault();
            submitComment();
        });
        commentInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitComment();
            }
        });
    }

    // --- WebSocket (STOMP) ---
    function connectStomp() {
        if (typeof SockJS === "undefined" || typeof Stomp === "undefined") {
            console.warn("SockJS/STOMP not loaded; real-time comments disabled.");
            return;
        }
        const socket = new SockJS("/ws");
        const client = Stomp.over(socket);
        client.debug = null;
        client.connect(
            {},
            function () {
                client.subscribe("/topic/post." + postId, function (message) {
                    try {
                        const payload = JSON.parse(message.body);
                        if (payload.type === "NEW_COMMENT" && payload.comment) {
                            if (appendCommentIfNew(payload.comment)) {
                                const cc = document.getElementById("commentCount");
                                if (cc) {
                                    const cur = parseInt(cc.textContent, 10) || 0;
                                    cc.textContent = String(cur + 1);
                                }
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                });
            },
            function (err) {
                console.error("STOMP error", err);
            }
        );
    }

    loadSocialState();
    connectStomp();

    // Likers modal
    const likeModal = document.getElementById("likeModal");
    const likeCountForModal = document.getElementById("likeCount");
    if (likeModal && likeCountForModal) {
        likeCountForModal.style.cursor = "pointer";
        likeCountForModal.addEventListener("click", async (e) => {
            e.stopPropagation();
            likeModal.style.display = "flex";
            const listEl = likeModal.querySelector(".like-list");
            if (!listEl) return;
            listEl.innerHTML = '<p style="padding:12px;color:#888;">Đang tải...</p>';
            try {
                const res = await fetch("/api/posts/" + postId + "/likers", { credentials: "same-origin" });
                if (!res.ok) throw new Error("likers");
                const likers = await res.json();
                listEl.innerHTML = "";
                if (!likers.length) {
                    listEl.innerHTML = '<p style="padding:12px;color:#888;">Chưa có lượt thích.</p>';
                    return;
                }
                likers.forEach((u) => {
                    const row = document.createElement("div");
                    row.className = "like-user";
                    const av = u.avatar || "https://i.pravatar.cc/32?u=" + encodeURIComponent(u.username);
                    row.innerHTML = `
                        <div class="avatar-small"><img src="${escapeHtml(av)}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;"></div>
                        <div class="like-info"><b>${escapeHtml(u.nickname || u.username)}</b></div>
                    `;
                    listEl.appendChild(row);
                });
            } catch (err) {
                listEl.innerHTML = '<p style="padding:12px;color:#c00;">Lỗi tải danh sách.</p>';
            }
        });
    }
})();
