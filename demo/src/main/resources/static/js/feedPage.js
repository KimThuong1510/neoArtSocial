// Xử lý đổi icon active ở Sidebar
const icons = document.querySelectorAll('.nav-middle i');

icons.forEach(icon => {
    icon.addEventListener('click', () => {
        document.querySelector('.nav-middle i.active').classList.remove('active');
        icon.classList.add('active');
    });
});

// Nếu bạn vẫn muốn dùng JS thay vì CSS thuần:
document.querySelectorAll('.card').forEach(card => {
    const img = card.querySelector('img');
    card.addEventListener('mouseenter', () => {
        img.style.transform = "scale(1.1)";
        img.style.transition = "0.5s ease";
    });
    card.addEventListener('mouseleave', () => {
        img.style.transform = "scale(1)";
    });
});

// Modal thêm bài viết
const openBtn = document.querySelector('.add-bottom i.fa-pen-to-square');
const modal = document.getElementById('createPostModal');
const closeBtn = document.querySelector('.close-modal');

if (openBtn) {
    openBtn.addEventListener("click", () => {
        if(modal) modal.style.display = "flex";
    });
}

if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        if(modal) modal.style.display = "none";
    });
}

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

const imageInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("imagePreview");

// Hiển thị preview nhưng KHÔNG xóa giá trị input,
if (imageInput && previewContainer) {
    imageInput.addEventListener("change", () => {
        const files = Array.from(imageInput.files);

        previewContainer.innerHTML = "";

        files.forEach(file => {
            if (!file.type.startsWith("image/")) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement("div");
                div.className = "preview-item";

                div.innerHTML = `
                    <img src="${e.target.result}">
                `;

                previewContainer.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    });
}

// Modal like
const likeModal = document.getElementById("likeModal");
const closeLike = document.querySelector(".close-like");

document.querySelectorAll(".fa-regular .fa-heart").forEach(btn => {

    btn.addEventListener("click",(e)=>{

        e.stopPropagation();

        likeModal.style.display = "flex";

    });

});

//closeLike.onclick = () =>{
//    likeModal.style.display = "none";
//}

//nonelikeModal.addEventListener("click",(e)=>{
//
//    if(e.target === likeModal){
//        likeModal.style.display="none";
//    }
//
//});

// --- Modal Save Collection ---
const saveIcon = document.getElementById('saveIcon');
const saveCollectionModal = document.getElementById('saveCollectionModal');
const closeSaveModalBtn = document.getElementById('closeSaveModalBtn');
const collectionsList = document.getElementById('collectionsList');
const newCollectionNameInput = document.getElementById('newCollectionName');
const createCollectionBtn = document.getElementById('createCollectionBtn');
const postContainer = document.getElementById('mainPostContainer');

if (saveIcon && saveCollectionModal) {
    saveIcon.addEventListener('click', async () => {
        saveCollectionModal.style.display = 'flex';
        await fetchAndDisplayCollections();
    });

    closeSaveModalBtn.addEventListener('click', () => {
        saveCollectionModal.style.display = 'none';
    });

    saveCollectionModal.addEventListener('click', (e) => {
        if (e.target === saveCollectionModal) {
            saveCollectionModal.style.display = 'none';
        }
    });

    createCollectionBtn.addEventListener('click', async () => {
        const name = newCollectionNameInput.value.trim();
        if (!name) {
            alert("Vui lòng nhập tên thư mục");
            return;
        }

        try {
            const response = await fetch('/api/collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name })
            });

            const data = await response.json();
            if (response.ok) {
                newCollectionNameInput.value = '';
                await fetchAndDisplayCollections(); // Refresh list
            } else {
                alert(data.error || "Có lỗi xảy ra khi tạo thư mục");
            }
        } catch (error) {
            console.error("Error creating collection:", error);
            alert("Lỗi kết nối máy chủ");
        }
    });
}

async function fetchAndDisplayCollections() {
    if (!collectionsList || !postContainer) return;

    const postId = postContainer.getAttribute('data-post-id');
    collectionsList.innerHTML = '<p style="text-align: center; color: #888; font-size: 14px;">Đang tải thư mục...</p>';

    try {
        const response = await fetch(`/api/collections?postId=${postId}`);
        const collections = await response.json();

        if (response.ok) {
            collectionsList.innerHTML = '';
            if (collections.length === 0) {
                collectionsList.innerHTML = '<p style="text-align: center; color: #888; font-size: 14px;">Chưa có thư mục nào.</p>';
                return;
            }

            collections.forEach(collection => {
                const isSaved = collection.isSaved;
                const div = document.createElement('div');
                div.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    border: 1px solid #eee;
                    border-radius: 4px;
                    cursor: pointer;
                    background-color: ${isSaved ? '#f0f8ff' : 'white'};
                    transition: background-color 0.2s;
                `;

                div.onmouseover = () => { if(!isSaved) div.style.backgroundColor = '#f9f9f9'; };
                div.onmouseout = () => { if(!isSaved) div.style.backgroundColor = 'white'; };

                div.innerHTML = `
                    <span style="font-weight: 500;">${collection.name}</span>
                    <i class="fa-solid ${isSaved ? 'fa-bookmark' : 'fa-plus'}" style="color: ${isSaved ? '#e60023' : '#666'};"></i>
                `;

                div.addEventListener('click', () => toggleSavePost(collection.id, postId));

                collectionsList.appendChild(div);
            });
        }
    } catch (error) {
        console.error("Error fetching collections:", error);
        collectionsList.innerHTML = '<p style="text-align: center; color: red; font-size: 14px;">Lỗi tải dữ liệu.</p>';
    }
}

// Download functionality
const downloadIcon = document.getElementById("downloadIcon");
if (downloadIcon) {
    downloadIcon.addEventListener("click", () => {
        const currentImage = document.getElementById("currentImage");
        if (currentImage && currentImage.src) {
            // Get the relative path of the image (e.g., /uploads/posts/...)
            try {
                const url = new URL(currentImage.src);
                const imagePath = url.pathname;

                // Trigger download via backend endpoint
                window.location.href = `/posts/download?imageUrl=${encodeURIComponent(imagePath)}`;
            } catch (e) {
                console.error("Invalid image URL context", e);
            }
        }
    });
}


async function toggleSavePost(collectionId, postId) {
    try {
        const response = await fetch(`/api/collections/${collectionId}/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postId: postId })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.isSaved) {
                // Post was saved, redirect to saved items page
                window.location.href = '/profile';
            } else {
                // Post was unsaved, just refresh the modal list
                await fetchAndDisplayCollections();
            }
        } else {
            alert(data.error || "Có lỗi xảy ra");
        }
    } catch (error) {
        console.error("Error toggling save post:", error);
        alert("Lỗi kết nối máy chủ");
    }
}

// ===== NOTIFICATION TOGGLE =====
//const bellIcon = document.querySelector('.fa-bell');
//const notiModal = document.getElementById('notiModal');
//
//// Click icon bell
//if (bellIcon && notiModal) {
//    bellIcon.addEventListener('click', (e) => {
//        e.stopPropagation(); // tránh click lan ra ngoài
//
//        const isOpen = notiModal.style.display === 'block';
//
//        // toggle
//        notiModal.style.display = isOpen ? 'none' : 'block';
//    });
//}
//
//// Click ra ngoài => đóng modal
//document.addEventListener('click', (e) => {
//    if (
//        notiModal &&
//        bellIcon &&
//        !notiModal.contains(e.target) &&
//        !bellIcon.contains(e.target)
//    ) {
//        notiModal.style.display = 'none';
//    }
//});

document.addEventListener('DOMContentLoaded', () => {
    const bellIcon = document.querySelector('.nav-icons-group .fa-bell');
    const notiModal = document.getElementById('notiModal');

    if (bellIcon && notiModal) {
        // Toggle modal khi click vào icon chuông
        bellIcon.addEventListener('click', (e) => {
            console.log('Bell clicked');
            e.stopPropagation();
            notiModal.classList.toggle('show');
        });

        // Đóng modal khi click ra ngoài
        document.addEventListener('click', (e) => {
            // Kiểm tra nếu modal đang hiển thị và click không nằm trong modal hoặc icon
            if (notiModal.classList.contains('show')) {
                if (!notiModal.contains(e.target) && !bellIcon.contains(e.target)) {
                    notiModal.classList.remove('show');
                }
            }
        });
    }

    // SEARCH FUNCTIONALITY
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const keyword = searchInput.value.trim();
                window.location.href = `/feed?keyword=${encodeURIComponent(keyword)}`;
            }
        });

        searchInput.addEventListener('input', () => {
            if (clearSearch) {
                clearSearch.style.display = searchInput.value ? 'block' : 'none';
            }
        });
    }

    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            window.location.href = '/feed';
        });
    }
});