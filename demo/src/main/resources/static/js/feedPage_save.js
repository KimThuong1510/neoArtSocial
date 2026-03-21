
// --- SAVE POST TO COLLECTION LOGIC ---

const saveIcon = document.getElementById("saveIcon");
const saveCollectionModal = document.getElementById("saveCollectionModal");
const closeSaveModalBtn = document.getElementById("closeSaveModalBtn");
const collectionsList = document.getElementById("collectionsList");
const createCollectionBtn = document.getElementById("createCollectionBtn");
const newCollectionNameInput = document.getElementById("newCollectionName");

const mainPostContainer = document.getElementById("mainPostContainer");
const currentPostId = mainPostContainer ? mainPostContainer.getAttribute("data-post-id") : null;

if (saveIcon && saveCollectionModal) {
    saveIcon.addEventListener("click", () => {
        if (!currentPostId) {
            alert("Không tìm thấy thông tin bài viết.");
            return;
        }

        saveCollectionModal.style.display = "flex";
        fetchCollections();
    });

    closeSaveModalBtn.addEventListener("click", () => {
        saveCollectionModal.style.display = "none";
    });

    saveCollectionModal.addEventListener("click", (e) => {
        if (e.target === saveCollectionModal) {
            saveCollectionModal.style.display = "none";
        }
    });

    createCollectionBtn.addEventListener("click", () => {
        const name = newCollectionNameInput.value.trim();
        if (!name) {
            alert("Vui lòng nhập tên thư mục");
            return;
        }

        fetch("/api/collections", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: name })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                newCollectionNameInput.value = "";
                // Automatically save the current post to the new collection
                togglePostSave(data.id, true);
                // Refresh list
                fetchCollections();
            }
        })
        .catch(err => {
            console.error(err);
            alert("Lỗi kết nối");
        });
    });
}

function fetchCollections() {
    if (!currentPostId) return;

    collectionsList.innerHTML = '<p style="text-align: center; color: #888; font-size: 14px;">Đang tải...</p>';

    fetch(`/api/collections?postId=${currentPostId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                collectionsList.innerHTML = `<p style="color: red; font-size: 14px;">Lỗi: ${data.error}</p>`;
                return;
            }

            if (data.length === 0) {
                collectionsList.innerHTML = '<p style="color: #666; font-size: 14px; text-align: center;">Bạn chưa có thư mục nào.</p>';
                return;
            }

            let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';
            data.forEach(collection => {
                html += `
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 5px; border-radius: 4px; transition: background 0.2s;">
                        <input type="checkbox" style="width: 16px; height: 16px; min-width: 16px;"
                               onchange="togglePostSave(${collection.id}, this.checked)"
                               ${collection.isSaved ? 'checked' : ''}>
                        <span style="font-size: 15px; word-break: break-word; flex: 1;">${collection.name}</span>
                    </label>
                `;
            });
            html += '</div>';
            collectionsList.innerHTML = html;
        })
        .catch(err => {
            console.error(err);
            collectionsList.innerHTML = '<p style="color: red; font-size: 14px;">Lỗi kết nối khi tải danh sách thư mục.</p>';
        });
}

function togglePostSave(collectionId, isChecked) {
    if (!currentPostId) return;

    fetch(`/api/collections/${collectionId}/toggle`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ postId: currentPostId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            fetchCollections(); // revert checkbox
        }
        // Success silently or we could show a toast
    })
    .catch(err => {
        console.error(err);
        alert("Lỗi kết nối khi lưu bài viết");
        fetchCollections(); // revert checkbox
    });
}
