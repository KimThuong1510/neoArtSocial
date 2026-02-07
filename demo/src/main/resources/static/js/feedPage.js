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

// mở popup
openBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// đóng popup
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// click ra ngoài để đóng
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

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
