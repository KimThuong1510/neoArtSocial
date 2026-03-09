// edit thông tin
const menuBtn = document.querySelector(".menu-btn");
const popup = document.getElementById("menuPopup");

const editForm = document.getElementById("editForm");
const passwordForm = document.getElementById("passwordForm");

menuBtn.addEventListener("click", (e) => {

    e.stopPropagation();

    const isOpen = popup.style.display === "block";

    if(isOpen){
        popup.style.display = "none";
        editForm.style.display = "none";
        passwordForm.style.display = "none";
    }else{
        popup.style.display = "block";
    }

});

popup.addEventListener("click",(e)=>{
    e.stopPropagation();
});

document.addEventListener("click", () => {

    popup.style.display = "none";
    editForm.style.display = "none";
    passwordForm.style.display = "none";

});

function showEdit(){

    document.getElementById("editForm").style.display = "block";
    document.getElementById("passwordForm").style.display = "none";
}

function showPassword(){

    document.getElementById("passwordForm").style.display = "block";
    document.getElementById("editForm").style.display = "none";
}


/* UPLOAD AVATAR */

const avatarBox = document.getElementById("avatarBox");
const avatarInput = document.getElementById("avatarInput");
const avatarImg = document.getElementById("avatarImg");

avatarBox.addEventListener("click",()=>{
    avatarInput.click();
});

avatarInput.addEventListener("change",(e)=>{

    const file = e.target.files[0];

    if(file){

        const reader = new FileReader();

        reader.onload = function(event){
            avatarImg.src = event.target.result;
        }

        reader.readAsDataURL(file);
    }

});

// popup chỉnh sửa card

document.querySelectorAll(".card-menu").forEach(menu => {

    const popup = menu.querySelector(".card-popup");

    menu.addEventListener("click", (e) => {

        e.stopPropagation();

        document.querySelectorAll(".card-popup").forEach(p=>{
            if(p!==popup) p.style.display="none";
        });

        popup.style.display =
            popup.style.display==="block" ? "none":"block";

    });

});

document.addEventListener("click", () => {

    document.querySelectorAll(".card-popup").forEach(p=>{
        p.style.display="none";
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
editImageInput.addEventListener('change', function(event) {
    imagePreview.innerHTML = ''; // Xóa các preview cũ
    const files = event.target.files;

    if (files) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();

            reader.onload = function(e) {
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

        // Điền dữ liệu vào form chỉnh sửa
        document.getElementById('editPostId').value = postId;
        document.getElementById('editPostCategory').value = topic;
        document.getElementById('editPostContent').value = content;
        
        // Reset preview và input hình ảnh khi mở modal
        editImageInput.value = '';
        imagePreview.innerHTML = '';

        modal.style.display = 'flex';
        
        // Cập nhật sự kiện click cho nút "Chỉnh sửa"
        editPostBtn.onclick = function() {
            const upostId = document.getElementById('editPostId').value;
            const ucategory = document.getElementById('editPostCategory').value;
            const ucontent = document.getElementById('editPostContent').value;

            // Gửi dữ liệu cập nhật
            const formData = new FormData();
            formData.append('postId', upostId);
            if (ucategory) formData.append('category', ucategory);
            formData.append('content', ucontent);
            
            const files = document.getElementById('editImageInput').files;
            for(let i=0; i<files.length; i++){
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

    btn.addEventListener("click",(e)=>{

        e.stopPropagation();

        currentCard = e.target.closest(".card");
        currentDeletePostId = btn.getAttribute("data-post-id");

        deleteModal.style.display = "flex";

    });

});

closeDelete.onclick = () => deleteModal.style.display="none";
cancelDelete.onclick = () => deleteModal.style.display="none";

deleteModal.addEventListener("click",(e)=>{

    if(e.target === deleteModal){
        deleteModal.style.display="none";
    }

});

confirmDelete.onclick = () => {

    if(currentDeletePostId){
        const formData = new FormData();
        formData.append('postId', currentDeletePostId);

        fetch('/posts/delete', {
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.ok) {
                if(currentCard){
                    currentCard.remove();
                }
                deleteModal.style.display="none";
                window.location.reload();
            } else {
                alert("Có lỗi xảy ra khi xóa bài viết!");
            }
        }).catch(error => {
            console.error("Lỗi xóa bài viết:", error);
            alert("Lỗi kết nối.");
        });
    } else {
        deleteModal.style.display="none";
    }

};

// Modal hiển thị comment
const commentModal = document.getElementById("commentModal");
const closeComment = document.querySelector(".close-comment");

document.querySelectorAll(".fa-comment, .commentCount").forEach(btn => {

    btn.addEventListener("click", () => {

        const card = btn.closest(".card");
        const img = card.querySelector("img").src;

        document.getElementById("commentPostImage").src = img;

        commentModal.style.display = "flex";

    });

});

closeComment.addEventListener("click", () => {
    commentModal.style.display = "none";
});

commentModal.addEventListener("click",(e)=>{

    if(e.target === commentModal){
        commentModal.style.display="none";
    }

});

// modal like
const likeModal = document.getElementById("likeModal");
const closeLike = document.querySelector(".close-like");

document.querySelectorAll(".likeCount").forEach(btn => {

    btn.addEventListener("click",(e)=>{

        e.stopPropagation();

        likeModal.style.display = "flex";

    });

});

closeLike.onclick = () =>{
    likeModal.style.display = "none";
}

likeModal.addEventListener("click",(e)=>{

    if(e.target === likeModal){
        likeModal.style.display="none";
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

    tab.addEventListener("click",()=>{
        tabs.forEach(t=>t.classList.remove("active"))
        tab.classList.add("active")
        const type = tab.dataset.type
        if(type==="my"){
            myPosts.style.display="grid"
            topicGrid.style.display="none"
            savedPosts.style.display="none"
        }
        if(type==="liked"){
            myPosts.style.display="none"
            topicGrid.style.display="grid"
            savedPosts.style.display="none"
        }
    })

})

document.querySelectorAll(".topic-card").forEach(card=>{

    card.addEventListener("click",()=>{

        topicGrid.style.display="none"
        savedPosts.style.display="grid"

    })

})

// modal xóa bài đã lưu
const unsaveModal = document.getElementById("unsavePostModal")
const closeUnsave = document.querySelector(".close-unsave")
const cancelUnsave = document.querySelector(".btn-cancel-unsave")
const confirmUnsave = document.querySelector(".btn-confirm-unsave")

let savedCard = null

document.querySelectorAll(".unsave-post").forEach(btn => {

    btn.addEventListener("click",(e)=>{

        e.stopPropagation()

        savedCard = e.target.closest(".card")

        unsaveModal.style.display = "flex"

    })

})

closeUnsave.onclick = ()=> unsaveModal.style.display="none"
cancelUnsave.onclick = ()=> unsaveModal.style.display="none"
unsaveModal.addEventListener("click",(e)=>{
    if(e.target === unsaveModal){
        unsaveModal.style.display="none"
    }
})

confirmUnsave.onclick = ()=>{
    if(savedCard){
        savedCard.remove()
    }
    unsaveModal.style.display="none"

}