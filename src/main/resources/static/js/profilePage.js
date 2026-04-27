// edit thông tin
const menuBtn = document.querySelector(".menu-btn");
const popup = document.getElementById("menuPopup");

const editForm = document.getElementById("editForm");
const passwordForm = document.getElementById("passwordForm");

menuBtn.addEventListener("click", (e) => {
    const isPopupOpen = popup.style.display === "block";
    if (isPopupOpen && !e.target.closest("#menuPopup")) {
        popup.style.display = "none";
        editForm.style.display = "none";
        passwordForm.style.display = "none";
    } else if (!isPopupOpen) {
        popup.style.display = "block";
    }
});

document.addEventListener("mousedown", (e) => {
    // Nếu click ra ngoài menuBtn và ra ngoài form thì đóng tất cả
    if (!menuBtn.contains(e.target) &&
        !editForm.contains(e.target) &&
        !passwordForm.contains(e.target)) {

        popup.style.display = "none";
        editForm.style.display = "none";
        passwordForm.style.display = "none";
    }
});

function showEdit() {

    document.getElementById("editForm").style.display = "block";
    document.getElementById("passwordForm").style.display = "none";
}

function showPassword() {

    document.getElementById("passwordForm").style.display = "block";
    document.getElementById("editForm").style.display = "none";
}

function updateProfile() {
    const nickname = document.getElementById("editNickname").value;
    const birthDate = document.getElementById("editBirthDate").value;
    const avatarInput = document.getElementById("avatarInput");

    if (!nickname || !birthDate) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    const formData = new FormData();
    formData.append("nickname", nickname);
    formData.append("birthDate", birthDate);

    if (avatarInput.files.length > 0) {
        formData.append("avatar", avatarInput.files[0]);
    }

    fetch("/profile/update", {
        method: "POST",
        body: formData
    })
        .then(async response => {
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                window.location.reload();
            } else {
                alert(data.error || "Có lỗi xảy ra!");
            }
        })
        .catch(error => {
            console.error("Lỗi:", error);
            alert("Lỗi kết nối.");
        });
}

function changePassword() {
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!oldPassword || !newPassword || !confirmPassword) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    const payload = {
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword
    };

    fetch("/profile/change-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(async response => {
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                document.getElementById("oldPassword").value = "";
                document.getElementById("newPassword").value = "";
                document.getElementById("confirmPassword").value = "";
                document.getElementById("passwordForm").style.display = "none";
                document.getElementById("menuPopup").style.display = "none";
            } else {
                alert(data.error || "Có lỗi xảy ra!");
            }
        })
        .catch(error => {
            console.error("Lỗi:", error);
            alert("Lỗi kết nối.");
        });
}


/* UPLOAD AVATAR */

const avatarBox = document.getElementById("avatarBox");
const avatarInput = document.getElementById("avatarInput");
const avatarImg = document.getElementById("avatarImg");

avatarBox.addEventListener("click", () => {
    avatarInput.click();
});

avatarInput.addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (file) {

        const reader = new FileReader();

        reader.onload = function (event) {
            avatarImg.src = event.target.result;
        }

        reader.readAsDataURL(file);

        // Upload ngay khi chọn để đảm bảo DB luôn cập nhật đường dẫn avatar mới.
        const formData = new FormData();
        formData.append("avatar", file);
        fetch("/profile/avatar", {
            method: "POST",
            body: formData
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    alert(data.error || "Không thể cập nhật avatar.");
                    return;
                }
                if (data.avatarUrl) {
                    avatarImg.src = data.avatarUrl;
                }
            })
            .catch(error => {
                console.error("Lỗi upload avatar:", error);
                alert("Lỗi kết nối khi tải avatar.");
            });
    }

});

// popup chỉnh sửa card

document.querySelectorAll(".card-menu").forEach(menu => {

    const popup = menu.querySelector(".card-popup");

    menu.addEventListener("click", (e) => {

        e.stopPropagation();

        document.querySelectorAll(".card-popup").forEach(p => {
            if (p !== popup) p.style.display = "none";
        });

        popup.style.display =
            popup.style.display === "block" ? "none" : "block";

    });

});

document.addEventListener("click", () => {

    document.querySelectorAll(".card-popup").forEach(p => {
        p.style.display = "none";
    });

});

// modal chỉnh sửa card
const openBtns = document.querySelectorAll('.edit-post');
const modal = document.getElementById('editPostModal');
const closeBtn = document.querySelector('.close-modal');
const editPostBtn = document.querySelector('.btn-post');
const editImageInput = document.getElementById('editImageInput');
const imagePreview = document.getElementById('imagePreview');

// Xử lý preview ảnh khi người dùng chọn ảnh mới
editImageInput.addEventListener('change', function (event) {
    imagePreview.innerHTML = ''; // Xóa các preview cũ
    const files = event.target.files;

    if (files) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();

            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100px';
                img.style.maxHeight = '100px';
                img.style.margin = '5px';
                img.style.borderRadius = '5px';
                imagePreview.appendChild(img);
            };

            reader.readAsDataURL(file);
        });
    }
});

openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Lấy thông tin bài viết từ các thuộc tính data
        const postId = btn.getAttribute('data-post-id');
        const topic = btn.getAttribute('data-topic');
        const content = btn.getAttribute('data-content');
        const card = e.target.closest('.card') || btn.closest('.card');

        // Điền dữ liệu vào form chỉnh sửa
        document.getElementById('editPostId').value = postId;
        document.getElementById('editPostCategory').value = topic;
        document.getElementById('editPostContent').value = content;

        // Reset preview và input hình ảnh khi mở modal
        editImageInput.value = '';
        imagePreview.innerHTML = '';

        const existingImages = [];
        if (card) {
            const imageNodes = card.querySelectorAll('.image-data span');
            if (imageNodes.length > 0) {
                imageNodes.forEach(node => {
                    const imageUrl = node.getAttribute('data-url');
                    if (imageUrl) existingImages.push(imageUrl);
                });
            } else {
                const singleImage = card.querySelector('img.img-main');
                if (singleImage && singleImage.src) {
                    existingImages.push(singleImage.src);
                }
            }
        }

        if (existingImages.length === 0) {
            const fallbackImage = btn.getAttribute('data-image');
            if (fallbackImage) {
                existingImages.push(fallbackImage);
            }
        }

        existingImages.forEach(imageUrl => {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            img.style.margin = '5px';
            img.style.borderRadius = '5px';
            imagePreview.appendChild(img);
        });

        modal.style.display = 'flex';

        // Cập nhật sự kiện click cho nút "Chỉnh sửa"
        editPostBtn.onclick = function () {
            const upostId = document.getElementById('editPostId').value;
            const ucategory = document.getElementById('editPostCategory').value;
            const ucontent = document.getElementById('editPostContent').value;

            // Gửi dữ liệu cập nhật
            const formData = new FormData();
            formData.append('postId', upostId);
            if (ucategory) formData.append('topic', ucategory);
            formData.append('content', ucontent);

            const files = document.getElementById('editImageInput').files;
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }

            fetch('/posts/update', {
                method: 'POST',
                body: formData
            }).then(response => {
                if (response.ok) {
                    window.location.reload(); // Reload trang nếu thành công
                } else {
                    alert("Có lỗi xảy ra khi cập nhật!");
                }
            }).catch(error => {
                console.error("Lỗi cập nhật bài viết:", error);
                alert("Lỗi kết nối.");
            });
        };
    });
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});


const deleteModal = document.getElementById("deletePostModal");
const deleteBtns = document.querySelectorAll(".delete-post");
const closeDelete = document.querySelector(".close-delete");
const cancelDelete = document.querySelector(".btn-cancel");
const confirmDelete = document.querySelector(".btn-delete");

let currentCard = null;
let currentDeletePostId = null;

deleteBtns.forEach(btn => {

    btn.addEventListener("click", (e) => {

        e.stopPropagation();

        currentCard = e.target.closest(".card");
        currentDeletePostId = btn.getAttribute("data-post-id");

        deleteModal.style.display = "flex";

    });

});

closeDelete.onclick = () => deleteModal.style.display = "none";
cancelDelete.onclick = () => deleteModal.style.display = "none";

deleteModal.addEventListener("click", (e) => {

    if (e.target === deleteModal) {
        deleteModal.style.display = "none";
    }

});

confirmDelete.onclick = () => {

    if (currentDeletePostId) {
        const payload = new URLSearchParams();
        payload.append('postId', currentDeletePostId);

        fetch('/posts/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: payload,
            credentials: 'same-origin'
        }).then(async (response) => {
            if (response.ok) {
                if (currentCard) {
                    currentCard.remove();
                }
                deleteModal.style.display = "none";
                window.location.reload();
                return;
            }
            const errText = await response.text().catch(() => "");
            console.error("Lỗi xóa bài viết:", response.status, errText);
            alert(errText ? `Có lỗi xảy ra khi xóa bài viết! ${errText}` : "Có lỗi xảy ra khi xóa bài viết!");
        }).catch(error => {
            console.error("Lỗi xóa bài viết:", error);
            alert("Lỗi kết nối.");
        });
    } else {
        deleteModal.style.display = "none";
    }

};

// Modal hiển thị comment
const commentModal = document.getElementById("commentModal");
const closeComment = document.querySelector(".close-comment");
const commentTree = document.getElementById("commentTree");
const commentInput = document.getElementById("commentInput");
const sendCommentBtn = document.getElementById("sendComment");
const likeModal = document.getElementById("likeModal");
const closeLike = document.querySelector(".close-like");

let currentCommentPostId = null;

// Helper: Escape HTML
function escapeHtml(s) {
    if (!s) return "";
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
}

// Helper: Format Time
function formatTime(iso) {
    if (!iso) return "";
    try { return new Date(iso).toLocaleString(); } catch (e) { return ""; }
}

// Render a single comment node
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
            </div>
        </div>
    `;

    const repliesBox = document.createElement("div");
    repliesBox.className = "comment-replies-children";
    (c.replies || []).forEach((r) => {
        repliesBox.appendChild(renderCommentNode(r, depth + 1));
    });
    wrap.appendChild(repliesBox);
    return wrap;
}

function countCommentsFlat(list) {
    let n = 0;
    function walk(arr) {
        (arr || []).forEach((c) => { n++; walk(c.replies || []); });
    }
    walk(list);
    return n;
}

// Event delegation for Like and Comment buttons on post cards
document.addEventListener("click", async (e) => {
    // LIKE functionality
    if (e.target.closest('.likeBtn')) {
        const btn = e.target.closest('.likeBtn');
        const card = btn.closest('.card');
        if (!card) return;
        const postId = card.getAttribute('data-post-id');
        if (!postId) return;

        try {
            const res = await fetch("/api/posts/" + postId + "/like", {
                method: "POST",
                credentials: "same-origin"
            });
            if (res.ok) {
                const data = await res.json();
                btn.className = data.liked ? "fa-solid fa-heart likeBtn" : "fa-regular fa-heart likeBtn";
                btn.style.color = data.liked ? "#ff4d6d" : "#333";
                const likeCountEl = card.querySelector('.likeCount');
                if (likeCountEl) likeCountEl.textContent = data.likeCount;
            }
        } catch (err) {
            console.error("Lỗi khi like bài viết:", err);
        }
    }

    // LIKERS modal
    if (e.target.closest('.likeCount')) {
        const btn = e.target.closest('.likeCount');
        const card = btn.closest('.card');
        if (!card) return;
        const postId = card.getAttribute('data-post-id');
        if (!postId) return;

        likeModal.style.display = "flex";
        const listEl = likeModal.querySelector(".like-list");
        if (!listEl) return;
        listEl.innerHTML = '<p style="padding:12px;color:#888;">Đang tải...</p>';
        try {
            const res = await fetch("/api/posts/" + postId + "/likers", { credentials: "same-origin" });
            if (!res.ok) throw new Error("likers failed");
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
    }

    // COMMENT functionality
    if (e.target.closest('.comment-btn') || e.target.closest('.commentCount')) {
        const btn = e.target.closest('.comment-btn') || e.target.closest('.commentCount');
        const card = btn.closest('.card');
        if (!card) return;
        const postId = card.getAttribute('data-post-id');
        if (!postId) return;

        currentCommentPostId = postId;
        
        // Update modal image
        const imgEl = card.querySelector('img.img-main');
        if (imgEl) {
            document.getElementById("commentPostImage").src = imgEl.src;
        }
        
        commentModal.style.display = "flex";
        commentTree.innerHTML = '<p style="padding:12px;color:#888;text-align:center;">Đang tải...</p>';
        
        try {
            const res = await fetch("/api/posts/" + postId + "/social", { credentials: "same-origin" });
            if (!res.ok) throw new Error("fetch comments failed");
            const data = await res.json();
            commentTree.innerHTML = "";
            if (data.comments && data.comments.length > 0) {
                data.comments.forEach(c => commentTree.appendChild(renderCommentNode(c, 0)));
            } else {
                commentTree.innerHTML = '<p style="padding:12px;color:#888;text-align:center;">Chưa có bình luận nào.</p>';
            }
            // Update the comment count on the card just in case it's out of sync
            const cc = card.querySelector(".commentCount");
            if (cc) cc.textContent = String(countCommentsFlat(data.comments || []));
        } catch (err) {
            commentTree.innerHTML = '<p style="padding:12px;color:#c00;text-align:center;">Lỗi tải bình luận.</p>';
        }
    }
});

// Submit Comment
async function submitComment() {
    if (!currentCommentPostId || !commentInput) return;
    const text = commentInput.value.trim();
    if (!text) return;
    
    try {
        const res = await fetch("/api/posts/" + currentCommentPostId + "/comments", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: text, parentId: null })
        });
        if (!res.ok) throw new Error("submit comment failed");
        const c = await res.json();
        
        // Remove empty message if exists
        if (commentTree.querySelector('p')) {
            commentTree.innerHTML = '';
        }
        
        commentTree.appendChild(renderCommentNode(c, 0));
        commentInput.value = "";
        
        // Update comment count on the active card
        const card = document.querySelector(`.card[data-post-id="${currentCommentPostId}"]`);
        if (card) {
            const cc = card.querySelector(".commentCount");
            if (cc) {
                const cur = parseInt(cc.textContent, 10) || 0;
                cc.textContent = String(cur + 1);
            }
        }
        
        // Scroll to bottom
        commentTree.scrollTop = commentTree.scrollHeight;
    } catch (err) {
        console.error(err);
        alert("Không gửi được bình luận.");
    }
}

if (sendCommentBtn && commentInput) {
    sendCommentBtn.addEventListener("click", (e) => {
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

closeComment.addEventListener("click", () => {
    commentModal.style.display = "none";
    currentCommentPostId = null;
});

commentModal.addEventListener("click", (e) => {
    if (e.target === commentModal) {
        commentModal.style.display = "none";
        currentCommentPostId = null;
    }
});

closeLike.onclick = () => {
    likeModal.style.display = "none";
}

likeModal.addEventListener("click", (e) => {
    if (e.target === likeModal) {
        likeModal.style.display = "none";
    }
});

// Bài đã lưu
const tabs = document.querySelectorAll(".tabs span")

const myPosts = document.getElementById("myPosts")
const topicGrid = document.getElementById("topicGrid")
const savedPosts = document.getElementById("savedPosts")

topicGrid.style.display = "none"
savedPosts.style.display = "none"

tabs.forEach(tab => {

    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"))
        tab.classList.add("active")
        const type = tab.dataset.type
        const filter = document.getElementById("categoryFilter")
        if (type === "my") {
            myPosts.style.display = "grid"
            topicGrid.style.display = "none"
            savedPosts.style.display = "none"
            if (filter) filter.style.display = "block"
        }
        if (type === "liked") {
            myPosts.style.display = "none"
            topicGrid.style.display = "grid"
            savedPosts.style.display = "none"
            if (filter) filter.style.display = "none"
        }
    })

})

// Xử lý filter chủ đề
document.addEventListener('DOMContentLoaded', () => {
    const categoryFilter = document.getElementById("categoryFilter");
    if (categoryFilter) {
        categoryFilter.addEventListener("change", () => {
            const val = categoryFilter.value;
            if (val) {
                window.location.href = `/profile?category=${val}`;
            } else {
                window.location.href = `/profile`;
            }
        });
    }
});

document.querySelectorAll(".topic-card").forEach(card => {

    card.addEventListener("click", async () => {
        const collectionId = card.getAttribute("data-collection-id");
        if (!collectionId) return;

        topicGrid.style.display = "none";
        // Show a loading state
        savedPosts.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">Đang tải...</div>';
        savedPosts.style.display = "grid";

        try {
            const response = await fetch(`/api/collections/${collectionId}/posts`);
            const posts = await response.json();

            if (response.ok) {
                // Clear loading state
                savedPosts.innerHTML = '';

                if (posts.length === 0) {
                    const emptyState = document.createElement('div');
                    emptyState.style.cssText = "grid-column: 1 / -1; text-align: center; color: #888; padding: 20px;";
                    emptyState.textContent = 'Chưa có bài viết nào trong thư mục này.';
                    savedPosts.appendChild(emptyState);
                    return;
                }

                posts.forEach(post => {
                    const postCard = document.createElement('div');
                    postCard.className = 'card';
                    let imageHtml = '';
                    if (post.images && post.images.length > 1) {
                        const imagesData = encodeURIComponent(JSON.stringify(post.images));
                        imageHtml = `
                            <div class="card-image-container" style="position: relative;" data-images="${imagesData}" data-current-index="0">
                                <img src="${post.images[0].url}" alt="Post Image" class="img-main">
                                <button class="prev-btn" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; z-index: 10;">&#10094;</button>
                                <button class="next-btn" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; z-index: 10;">&#10095;</button>
                                <div class="img-counter" style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); color: white; padding: 3px 10px; border-radius: 15px; font-size: 12px;">1 / ${post.images.length}</div>
                            </div>
                        `;
                    } else {
                        imageHtml = `<img src="${post.image}" alt="Post Image" class="img-main">`;
                    }

                    postCard.setAttribute('data-post-id', post.id);
                    postCard.innerHTML = `
                        ${imageHtml}
                        <div class="card-body">
                            <div class="card-title">${post.content.length > 40 ? post.content.substring(0, 40) + '...' : post.content}</div>
                            <div class="card-desc"></div>
                            <div class="author" style="display: flex; justify-content: space-between; align-items: center;">
                                <div class="author-info">
                                    <div class="author-avatar"><img src="${post.author.avatar || 'https://i.pravatar.cc/100?u=' + encodeURIComponent(post.author.username)}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" /></div>
                                    <div class="author-name">${post.author.username}</div>
                                </div>
                                <i class="fa-solid fa-bookmark unsave-icon" style="cursor: pointer; color: #e60023; font-size: 1.2rem;" data-post-id="${post.id}" data-collection-id="${collectionId}" title="Xóa bài lưu"></i>
                            </div>
                            <div class="reaction">
                                <i class="${post.likedByCurrentUser ? 'fa-solid' : 'fa-regular'} fa-heart likeBtn" style="color:${post.likedByCurrentUser ? '#ff4d6d' : '#333'};cursor:pointer;"></i>
                                <span class="likeCount">${post.likes}</span>
                                <i class="fa-regular fa-comment comment-btn" style="cursor:pointer;"></i>
                                <span class="commentCount">${post.comments}</span>
                            </div>
                        </div>
                    `;
                    savedPosts.appendChild(postCard);
                });

                // Attach event listeners for the newly created unsave buttons
                attachUnsaveListeners();

            } else {
                savedPosts.innerHTML = `<div style="text-align: center; padding: 20px; color: red;">${posts.error || 'Lỗi khi tải bài viết'}</div>`;
            }

        } catch (error) {
            console.error("Error fetching collection posts:", error);
            savedPosts.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">Lỗi kết nối máy chủ.</div>';
        }
    });

});

function attachUnsaveListeners() {
    document.querySelectorAll(".unsave-icon").forEach(icon => {
        icon.addEventListener("click", async (e) => {
            e.stopPropagation();
            const savedCard = e.target.closest(".card");
            const unsavePostId = icon.getAttribute("data-post-id");
            const unsaveCollectionId = icon.getAttribute("data-collection-id");

            if (unsavePostId && unsaveCollectionId) {
                try {
                    const response = await fetch(`/api/collections/${unsaveCollectionId}/toggle`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ postId: unsavePostId })
                    });

                    if (response.ok) {
                        if (savedCard) {
                            savedCard.remove();
                        }
                    } else {
                        const data = await response.json();
                        alert(data.error || "Có lỗi xảy ra");
                    }
                } catch (error) {
                    alert("Lỗi kết nối");
                }
            }
        });
    });
}

// Initial attachment (though the elements might differ initially)
attachUnsaveListeners();

// Carousel Event Delegation for Saved Posts
if (savedPosts) {
    savedPosts.addEventListener("click", (e) => {
        if (e.target.classList.contains("prev-btn")) {
            e.stopPropagation();
            updateCarousel(e.target, -1);
        } else if (e.target.classList.contains("next-btn")) {
            e.stopPropagation();
            updateCarousel(e.target, 1);
        }
    });
}

function updateCarousel(btnElement, direction) {
    const container = btnElement.closest(".card-image-container");
    if (!container) return;

    try {
        const imagesData = JSON.parse(decodeURIComponent(container.getAttribute("data-images")));
        if (!imagesData || imagesData.length <= 1) return;

        let currentIndex = parseInt(container.getAttribute("data-current-index")) || 0;
        currentIndex += direction;

        // Loop around
        if (currentIndex < 0) {
            currentIndex = imagesData.length - 1;
        } else if (currentIndex >= imagesData.length) {
            currentIndex = 0;
        }

        container.setAttribute("data-current-index", currentIndex);

        // Update Image
        const imgMain = container.querySelector(".img-main");
        if (imgMain) {
            imgMain.src = imagesData[currentIndex].url;
        }

        // Update Counter
        const counter = container.querySelector(".img-counter");
        if (counter) {
            counter.textContent = `${currentIndex + 1} / ${imagesData.length}`;
        }

        // Update Likes and Comments
        const card = container.closest(".card");
        if (card) {
            const heartCount = card.querySelector(".heart-count");
            if (heartCount && imagesData[currentIndex].likes !== undefined) {
                heartCount.textContent = `❤ ${imagesData[currentIndex].likes}`;
            }

            const commentCount = card.querySelector(".comment-count");
            if (commentCount && imagesData[currentIndex].comments !== undefined) {
                commentCount.textContent = `💬 ${imagesData[currentIndex].comments}`;
            }
        }
    } catch (error) {
        console.error("Error updating carousel:", error);
    }
}

// Carousel Event Delegation for My Posts
if (myPosts) {
    myPosts.addEventListener("click", (e) => {
        if (e.target.classList.contains("prev-btn")) {
            e.stopPropagation();
            updateMyPostsCarousel(e.target, -1);
        } else if (e.target.classList.contains("next-btn")) {
            e.stopPropagation();
            updateMyPostsCarousel(e.target, 1);
        }
    });
}

function updateMyPostsCarousel(btnElement, direction) {
    const container = btnElement.closest(".card-image-container");
    if (!container) return;

    try {
        const imageElements = container.querySelectorAll(".image-data span");
        if (!imageElements || imageElements.length <= 1) return;

        let currentIndex = parseInt(container.getAttribute("data-current-index")) || 0;
        currentIndex += direction;

        if (currentIndex < 0) {
            currentIndex = imageElements.length - 1;
        } else if (currentIndex >= imageElements.length) {
            currentIndex = 0;
        }

        container.setAttribute("data-current-index", currentIndex);

        const imgMain = container.querySelector(".img-main");
        if (imgMain) {
            imgMain.src = imageElements[currentIndex].getAttribute("data-url");
        }

        const counter = container.querySelector(".img-counter");
        if (counter) {
            counter.innerHTML = `${currentIndex + 1} / ${imageElements.length}`;
        }
    } catch (error) {
        console.error("Error updating MyPosts carousel:", error);
    }
}