/**
 * Real-time notifications on feed (WebSocket) + list API.
 * Expects: body[data-user-id], #notiModal > #notiToast, #notiList, #notiFlyout
 */
(function () {
    const userId = document.body && document.body.getAttribute("data-user-id");
    if (!userId) return;

    const toastEl = document.getElementById("notiToast");
    const notiList = document.getElementById("notiList");
    const badge = document.getElementById("notiUnreadBadge");
    const markAll = document.getElementById("markAllNotificationsRead");
    let stompClient = null;
    let toastTimer = null;

    function escapeHtml(s) {
        if (!s) return "";
        const d = document.createElement("div");
        d.textContent = s;
        return d.innerHTML;
    }

    function showToast(payload) {
        if (!toastEl) return;
        const text =
            payload.content ||
            (payload.senderNickname || payload.senderUsername || "Ai đó") + " — thông báo mới";
        toastEl.innerHTML =
            '<div class="noti-toast-inner"><i class="fa-solid fa-bell"></i> ' +
            escapeHtml(text) +
            "</div>";
        toastEl.hidden = false;
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toastEl.hidden = true;
            toastEl.innerHTML = "";
        }, 6000);
    }

    async function refreshUnreadBadge() {
        if (!badge) return;
        try {
            const res = await fetch("/api/notifications/unread-count", { credentials: "same-origin" });
            if (!res.ok) return;
            const count = await res.json();
            if (count > 0) {
                badge.textContent = "(" + count + ")";
                badge.style.display = "inline";
            } else {
                badge.textContent = "";
                badge.style.display = "none";
            }
        } catch (e) {
            console.warn("unread badge", e);
        }
    }

    function formatTime(iso) {
        if (!iso) return "";
        try {
            return new Date(iso).toLocaleString();
        } catch (e) {
            return "";
        }
    }

    function renderList(items) {
        if (!notiList) return;
        const emptyHint = document.getElementById("notiEmptyHint");
        if (emptyHint) emptyHint.remove();
        notiList.innerHTML = "";
        if (!items || !items.length) {
            notiList.innerHTML =
                '<p class="noti-empty" style="padding:16px;color:#888;text-align:center;">Chưa có thông báo</p>';
            return;
        }
        items.forEach(function (n) {
            const div = document.createElement("div");
            div.className = "noti-item" + (n.read ? "" : " noti-item--unread");
            div.dataset.type = n.type === "LIKE" ? "like" : "comment";
            div.dataset.id = String(n.id);
            div.dataset.postId = String(n.postId);
            const avatar = n.senderAvatar || "https://i.pravatar.cc/40";
            div.innerHTML =
                '<img src="' +
                escapeHtml(avatar) +
                '" alt="">' +
                '<div class="content">' +
                escapeHtml(n.content) +
                '<div class="time">' +
                formatTime(n.createdAt) +
                "</div></div>";
            div.addEventListener("click", function () {
                fetch("/api/notifications/" + n.id + "/read", {
                    method: "PATCH",
                    credentials: "same-origin",
                }).finally(function () {
                    window.location.href = "/feed/" + n.postId;
                });
            });
            notiList.appendChild(div);
        });
        applyTabFilter();
    }

    let allItems = [];

    async function loadNotifications() {
        try {
            const res = await fetch("/api/notifications?page=0&size=50", { credentials: "same-origin" });
            if (!res.ok) throw new Error("notifications");
            const page = await res.json();
            allItems = page.content || [];
            renderList(allItems);
        } catch (e) {
            console.error(e);
            if (notiList) {
                notiList.innerHTML =
                    '<p style="padding:16px;color:#c00;">Không tải được thông báo.</p>';
            }
        }
    }

    function applyTabFilter() {
        const active = document.querySelector(".noti-tabs .tab.active");
        const type = active ? active.getAttribute("data-type") : "all";
        document.querySelectorAll("#notiList .noti-item").forEach(function (el) {
            if (type === "all") {
                el.style.display = "";
            } else {
                el.style.display = el.dataset.type === type ? "" : "none";
            }
        });
    }

    document.querySelectorAll(".noti-tabs .tab").forEach(function (tab) {
        tab.addEventListener("click", function () {
            document.querySelectorAll(".noti-tabs .tab").forEach(function (t) {
                t.classList.remove("active");
            });
            tab.classList.add("active");
            applyTabFilter();
        });
    });

    if (markAll) {
        markAll.addEventListener("click", function (e) {
            e.preventDefault();
            fetch("/api/notifications/read-all", {
                method: "POST",
                credentials: "same-origin",
            })
                .then(function () {
                    return loadNotifications();
                })
                .then(refreshUnreadBadge);
        });
    }

    function connectWs() {
        if (typeof SockJS === "undefined" || typeof Stomp === "undefined") return;
        const socket = new SockJS("/ws");
        stompClient = Stomp.over(socket);
        stompClient.debug = null;
        stompClient.connect(
            {},
            function () {
                stompClient.subscribe("/topic/notifications." + userId, function (message) {
                    try {
                        const payload = JSON.parse(message.body);
                        showToast(payload);
                        refreshUnreadBadge();
                        loadNotifications();
                    } catch (err) {
                        console.error(err);
                    }
                });
            },
            function (err) {
                console.error("Notification STOMP error", err);
            }
        );
    }

    loadNotifications();
    refreshUnreadBadge();
    connectWs();
})();
