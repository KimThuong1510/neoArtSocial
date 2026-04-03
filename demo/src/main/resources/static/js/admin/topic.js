/* ── DATA ── */
  let topics = [];
  let selectedColor = 1;
  let activeSwipe = null;

  /* ── BADGE COLORS (for ranking dots) ── */
  const badgeColors = ['','#F26B4E','#3498db','#27ae60','#9b59b6','#e74c3c','#c8960c','#1abc9c'];

  /* ── API CALLS ── */
  async function fetchTopics() {
    try {
      const response = await fetch('/api/admin/topics');
      if (!response.ok) throw new Error('Failed to fetch topics');
      topics = await response.json();
      renderRows(topics);
    } catch (error) {
      console.error('Error:', error);
      showToast('Không thể tải danh sách chủ đề');
    }
  }

  /* ── RENDER RANKING ── */
  function renderRanking() {
    const sorted = [...topics].sort((a, b) => b.postsCount - a.postsCount);
    const maxPosts = sorted[0]?.postsCount || 1;
    const total = topics.reduce((s, t) => s + t.postsCount, 0);

    document.getElementById('statsTopicCount').textContent = topics.length + ' chủ đề';
    document.getElementById('statsTotalPosts').textContent = total;

    document.getElementById('rankingList').innerHTML = sorted.map(t => {
      const pct = Math.round((t.postsCount / maxPosts) * 100);
      const color = badgeColors[t.badge] || '#aaa';
      return `
        <div class="ranking-item">
          <div class="ranking-top">
            <div class="ranking-name-wrap">
              <span class="ranking-dot" style="background:${color}"></span>
              <span class="ranking-name" title="${t.name}">${t.name}</span>
            </div>
            <span class="ranking-count"><strong>${t.postsCount}</strong> bài</span>
          </div>
          <div class="ranking-bar-bg">
            <div class="ranking-bar-fill" style="width:${pct}%;background:${color};opacity:.75"></div>
          </div>
        </div>`;
    }).join('');
  }

  /* ── RENDER ROWS ── */
  function renderRows(data) {
    const container = document.getElementById('rowsContainer');
    const empty = document.getElementById('emptyState');
    document.getElementById('countDisplay').textContent = data.length;
    renderRanking();

    if (data.length === 0) {
      container.innerHTML = '';
      empty.style.display = 'flex';
      return;
    }
    empty.style.display = 'none';

    container.innerHTML = data.map((t, i) => `
      <div class="row-wrapper" data-id="${t.id}" id="row-${t.id}">
        <div class="action-reveal">
          <button class="reveal-btn edit-btn" onclick="openEditModal(${t.id})">
            <i class="fa-solid fa-pen"></i>
            <span>Sửa</span>
          </button>
          <button class="reveal-btn delete-btn" onclick="deleteRow(${t.id}, '${t.name}')">
            <i class="fa-solid fa-trash"></i>
            <span>Xóa</span>
          </button>
        </div>
        <div class="row-inner"
             data-id="${t.id}"
             onmousedown="startDrag(event, ${t.id})"
             ontouchstart="startDragTouch(event, ${t.id})">
          <div class="col-stt">${String(i+1).padStart(2,'0')}</div>
          <div class="col-id"><span class="tag-id"><span></span>${t.code}</span></div>
          <div class="col-name">
            <span class="topic-badge badge-${t.badge}">${t.name}</span>
          </div>
          <div class="col-action">
            <span class="swipe-hint" onclick="toggleSwipe(${t.id})">
              <i class="fa-solid fa-chevron-left"></i> Thao tác
            </span>
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ── SWIPE DRAG ── */
  let dragStartX = 0, dragId = null, isDragging = false;

  function startDrag(e, id) {
    if (e.button !== 0) return;
    dragStartX = e.clientX;
    dragId = id;
    isDragging = false;
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
  }

  function startDragTouch(e, id) {
    dragStartX = e.touches[0].clientX;
    dragId = id;
    isDragging = false;
    window.addEventListener('touchmove', onDragMoveTouch, { passive: false });
    window.addEventListener('touchend', onDragEnd);
  }

  function onDragMove(e) {
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 5) isDragging = true;
    if (dx < -30 && isDragging) setSwipe(dragId, true);
    if (dx > 30 && isDragging)  setSwipe(dragId, false);
  }

  function onDragMoveTouch(e) {
    const dx = e.touches[0].clientX - dragStartX;
    if (Math.abs(dx) > 5) { isDragging = true; e.preventDefault(); }
    if (dx < -30 && isDragging) setSwipe(dragId, true);
    if (dx > 30 && isDragging)  setSwipe(dragId, false);
  }

  function onDragEnd() {
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
    window.removeEventListener('touchmove', onDragMoveTouch);
    window.removeEventListener('touchend', onDragEnd);
    dragId = null;
  }

  function setSwipe(id, open) {
    const row = document.getElementById('row-' + id);
    if (!row) return;
    if (open) {
      if (activeSwipe && activeSwipe !== id) {
        const prev = document.getElementById('row-' + activeSwipe);
        if (prev) prev.classList.remove('swiped');
      }
      activeSwipe = id;
      row.classList.add('swiped');
    } else {
      row.classList.remove('swiped');
      if (activeSwipe === id) activeSwipe = null;
    }
  }

  function toggleSwipe(id) {
    const row = document.getElementById('row-' + id);
    if (!row) return;
    const open = !row.classList.contains('swiped');
    setSwipe(id, open);
  }

  /* ── DELETE ── */
  async function deleteRow(id, name) {
    if (!confirm(`Bạn có chắc chắn muốn xóa chủ đề "${name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/topics/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const row = document.getElementById('row-' + id);
        if (row) {
          row.style.transition = 'transform .3s ease, opacity .3s ease, max-height .3s ease';
          row.style.overflow = 'hidden';
          row.style.transform = 'translateX(100%)';
          row.style.opacity = '0';
          row.style.maxHeight = row.offsetHeight + 'px';
          setTimeout(() => { row.style.maxHeight = '0'; row.style.padding = '0'; }, 300);
          setTimeout(() => {
            topics = topics.filter(t => t.id !== id);
            renderRows(filterTopics(document.getElementById('searchInput').value));
            showToast('Đã xóa chủ đề "' + name + '"');
          }, 500);
        }
      } else {
        const errorMsg = await response.text();
        showToast('Lỗi: ' + (errorMsg || 'Không thể xóa chủ đề này.'));
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Đã xảy ra lỗi khi xóa.');
    }
  }

  /* ── EDIT MODAL ── */
  let editingId = null;

  function openEditModal(id) {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;
    editingId = id;

    // Reuse add modal — switch to edit mode
    document.querySelector('#modalOverlay .modal-header-left h3').textContent = 'Chỉnh sửa chủ đề';
    document.querySelector('#modalOverlay .modal-header-left p').textContent = 'Cập nhật tên hiển thị của chủ đề';
    document.getElementById('topicId').value    = topic.code;
    document.getElementById('topicId').disabled = true;
    document.getElementById('topicName').value  = topic.name;
    selectedColor = topic.badge;
    document.querySelectorAll('.color-opt').forEach(el =>
      el.classList.toggle('selected', parseInt(el.dataset.idx) === topic.badge)
    );
    document.getElementById('submitBtn').innerHTML = '<i class="fa-solid fa-check" style="margin-right:8px"></i>Lưu thay đổi';

    // Close swipe first
    setSwipe(id, false);

    overlay.classList.add('open');
    setTimeout(() => document.getElementById('topicName').focus(), 200);
  }

  function resetModalToAdd() {
    editingId = null;
    document.querySelector('#modalOverlay .modal-header-left h3').textContent = 'Thêm chủ đề mới';
    document.querySelector('#modalOverlay .modal-header-left p').textContent  = 'Điền thông tin để tạo chủ đề mới';
    document.getElementById('topicId').disabled = false;
    document.getElementById('submitBtn').innerHTML = '<i class="fa-solid fa-plus" style="margin-right:8px"></i>Tạo chủ đề';
  }

  /* ── SEARCH ── */
  function filterTopics(q) {
    if (!q) return topics;
    return topics.filter(t =>
      (t.code && t.code.toLowerCase().includes(q.toLowerCase())) ||
      (t.name && t.name.toLowerCase().includes(q.toLowerCase()))
    );
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderRows(filterTopics(this.value));
    });
  }

  /* ── MODAL ── */
  const overlay  = document.getElementById('modalOverlay');
  const topicIdIn   = document.getElementById('topicId');
  const topicNameIn = document.getElementById('topicName');

  function openModal() {
    resetModalToAdd();
    overlay.classList.add('open');
    topicIdIn.value   = '';
    topicNameIn.value = '';
    selectedColor = 1;
    document.querySelectorAll('.color-opt').forEach(el => el.classList.toggle('selected', el.dataset.idx === '1'));
    setTimeout(() => topicIdIn.focus(), 200);
  }
  function closeModal() {
    overlay.classList.remove('open');
    setTimeout(resetModalToAdd, 300);
  }

  document.getElementById('openModalBtn').addEventListener('click', openModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  document.querySelectorAll('.color-opt').forEach(opt => {
    opt.addEventListener('click', function () {
      document.querySelectorAll('.color-opt').forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
      selectedColor = parseInt(this.dataset.idx);
    });
  });

  document.getElementById('submitBtn').addEventListener('click', async () => {
    const code   = topicIdIn.value.trim();
    const name = topicNameIn.value.trim();

    if (editingId) {
      // ── EDIT MODE ──
      if (!name) {
        topicNameIn.style.borderColor = '#ff3b30';
        topicNameIn.style.boxShadow = '0 0 0 3px rgba(255,59,48,.15)';
        topicNameIn.addEventListener('input', () => { topicNameIn.style.borderColor=''; topicNameIn.style.boxShadow=''; }, { once: true });
        return;
      }

      try {
        const response = await fetch(`/api/admin/topics/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, badge: selectedColor })
        });

        if (response.ok) {
          const updated = await response.json();
          const idx = topics.findIndex(t => t.id === editingId);
          if (idx !== -1) {
            topics[idx].name = name;
            topics[idx].badge = selectedColor;
          }
          const searchQuery = searchInput ? searchInput.value : '';
          renderRows(filterTopics(searchQuery));
          closeModal();
          showToast('Đã cập nhật chủ đề "' + name + '"');
        } else {
          showToast('Không thể cập nhật chủ đề');
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('Lỗi khi cập nhật chủ đề');
      }
      return;
    }

    // ── ADD MODE ──
    if (!code || !name) {
      [topicIdIn, topicNameIn].forEach(inp => {
        if (!inp.value.trim()) {
          inp.style.borderColor = '#ff3b30';
          inp.style.boxShadow = '0 0 0 3px rgba(255,59,48,.15)';
          inp.addEventListener('input', () => { inp.style.borderColor=''; inp.style.boxShadow=''; }, { once: true });
        }
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, badge: selectedColor })
      });

      if (response.ok) {
        await fetchTopics(); // Refresh all
        closeModal();
        showToast('Đã thêm chủ đề "' + name + '"');
      } else {
        const errorMsg = await response.text();
        if (errorMsg.includes('exists')) {
            topicIdIn.style.borderColor = '#ff3b30';
            topicIdIn.style.boxShadow = '0 0 0 3px rgba(255,59,48,.15)';
            showToast('Mã chủ đề đã tồn tại!');
        } else {
            showToast('Không thể thêm chủ đề');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Lỗi khi thêm chủ đề');
    }
  });

  /* ── TOAST ── */
  let toastTimer;
  function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  /* ── PAGINATION BTN ── */
  document.querySelectorAll('.page-btn:not(.arrow)').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.page-btn:not(.arrow)').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  /* ── CLICK OUTSIDE TO RESET SWIPE + INLINE EDIT ── */
  document.addEventListener('click', e => {
    if (!e.target.closest('.row-wrapper') && activeSwipe) {
      setSwipe(activeSwipe, false);
    }
  });

  /* ── INIT ── */
  fetchTopics();