
  function openModal(card) {
    const d = card.dataset;

    // Thumbnail
    const thumbWrap = document.getElementById('modalThumbWrap');
    if (d.img) {
      thumbWrap.innerHTML = `<img class="modal-thumb" src="${d.img}" alt="${d.title}"/>`;
    } else {
      thumbWrap.innerHTML = `<div class="modal-thumb-placeholder"><i class="fa-regular fa-image"></i></div>`;
    }

    // Tag
    const tagEl = document.getElementById('modalTag');
    tagEl.textContent = d.topic;
    tagEl.className = `card-tag ${d.topicClass}`;

    // Fields
    document.getElementById('modalAuthor').textContent   = d.author;
    document.getElementById('modalDate').textContent     = d.date;
    document.getElementById('modalLikes').textContent    = Number(d.likes).toLocaleString('vi-VN');
    document.getElementById('modalComments').textContent = Number(d.comments).toLocaleString('vi-VN');
    document.getElementById('modalContent').textContent  = d.content;

    // Open
    document.getElementById('modalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
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
  document.querySelector('.search-box input').addEventListener('input', function() {
    const q = this.value.toLowerCase();
    document.querySelectorAll('.post-card').forEach(card => {
      const title = card.querySelector('.card-title').textContent.toLowerCase();
      card.style.display = title.includes(q) ? 'flex' : 'none';
    });
  });