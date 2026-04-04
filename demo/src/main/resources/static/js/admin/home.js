let currentModalImages = [];
  let currentModalIndex = 0;

  function openModal(card) {
    const d = card.dataset;
    currentModalImages = JSON.parse(d.imagesJson || "[]");
    currentModalIndex = 0;

    // Tag
    const tagEl = document.getElementById('modalTag');
    tagEl.textContent = d.topic;
    tagEl.className = `card-tag ${d.topicClass}`;

    // Fields
    document.getElementById('modalAuthor').textContent   = d.author;
    document.getElementById('modalDate').textContent     = d.date;
    document.getElementById('modalContent').textContent  = d.content;

    updateModalImage();

    // Open
    document.getElementById('modalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function updateModalImage() {
    const thumbWrap = document.getElementById('modalThumbWrap');
    const navCont = document.getElementById('modalNav');
    
    if (currentModalImages.length > 0) {
      const img = currentModalImages[currentModalIndex];
      thumbWrap.innerHTML = `<img class="modal-thumb" src="${img.url}" alt="Post Image"/>`;
      
      // Update stats based on current image
      document.getElementById('modalLikes').textContent    = Number(img.likes).toLocaleString('vi-VN');
      document.getElementById('modalComments').textContent = Number(img.comments).toLocaleString('vi-VN');
      
      // Navigation
      if (currentModalImages.length > 1) {
        navCont.style.display = 'flex';
        document.getElementById('modalImageIndicator').textContent = `${currentModalIndex + 1} / ${currentModalImages.length}`;
      } else {
        navCont.style.display = 'none';
      }
    } else {
      thumbWrap.innerHTML = `<div class="modal-thumb-placeholder"><i class="fa-regular fa-image"></i></div>`;
      navCont.style.display = 'none';
    }
  }

  function changeModalImage(dir) {
    if (currentModalImages.length <= 1) return;
    currentModalIndex = (currentModalIndex + dir + currentModalImages.length) % currentModalImages.length;
    updateModalImage();
  }

  function changeCardImage(btn, dir) {
    const card = btn.closest('.post-card');
    const images = JSON.parse(card.dataset.imagesJson || "[]");
    if (images.length <= 1) return;
    
    let currentIndex = parseInt(card.dataset.currentImageIndex || "0");
    currentIndex = (currentIndex + dir + images.length) % images.length;
    card.dataset.currentImageIndex = currentIndex;
    
    const imgData = images[currentIndex];
    card.querySelector('.card-img-main').src = imgData.url;
    
    // Update labels
    card.querySelector('.likes-count').textContent = imgData.likes;
    card.querySelector('.comments-count').textContent = imgData.comments;
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function handleOverlayClick(e) {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  }

  // Close on Escape
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Search
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');
  const noResults = document.getElementById('noResults');
  
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const q = this.value.toLowerCase();
      let hasVisible = false;
      
      if (q.length > 0 && clearSearch) {
          clearSearch.style.display = 'block';
      } else if (clearSearch) {
          clearSearch.style.display = 'none';
      }

      document.querySelectorAll('.post-card').forEach(card => {
        // Search by username or topic according to user requirement
        const author = (card.dataset.author || '').toLowerCase();
        const topic = (card.dataset.topic || '').toLowerCase();
        
        if (author.includes(q) || topic.includes(q)) {
          card.style.display = 'flex';
          hasVisible = true;
        } else {
          card.style.display = 'none';
        }
      });
      
      if (noResults) {
          noResults.style.display = (hasVisible || document.querySelectorAll('.post-card').length === 0) ? 'none' : 'block';
      }
    });
  }

  if (clearSearch) {
      clearSearch.addEventListener('click', function() {
          if (searchInput) {
              searchInput.value = '';
              searchInput.dispatchEvent(new Event('input'));
          }
      });
  }