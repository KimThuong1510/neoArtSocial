  let currentPageUser = 1;
  const itemsPerPageUser = 5;

  function updatePagination() {
    const table = document.querySelector('.data-table');
    const allRows = Array.from(document.querySelectorAll('.data-table tbody tr'));
    const q = (document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase() : '');
    
    // Filter matching rows
    const matchingRows = allRows.filter(row => {
        const nameCells = row.querySelectorAll('td');
        const username = nameCells[1]?.textContent.toLowerCase() || '';
        return username.includes(q);
    });

    const totalPages = Math.ceil(matchingRows.length / itemsPerPageUser);
    if (currentPageUser > totalPages) currentPageUser = totalPages;
    if (currentPageUser < 1) currentPageUser = 1;

    // Show/hide based on page
    const startIdx = (currentPageUser - 1) * itemsPerPageUser;
    const endIdx = startIdx + itemsPerPageUser;

    allRows.forEach(row => row.style.display = 'none'); // hide all initially
    
    matchingRows.forEach((row, index) => {
        if (index >= startIdx && index < endIdx) {
            row.style.display = '';
        }
    });

    // Handle no results
    const noResults = document.getElementById('noResults');
    if (noResults) {
        if (matchingRows.length === 0 && allRows.length > 0) {
            noResults.style.display = 'block';
            table.style.display = 'none';
        } else {
            noResults.style.display = 'none';
            table.style.display = 'table';
        }
    }

    renderUserPagination(totalPages);
  }

  function renderUserPagination(totalPages) {
    const pageBtnsContainer = document.querySelector('.pagination');
    if (!pageBtnsContainer) return;

    if (totalPages <= 1) {
        pageBtnsContainer.innerHTML = '';
        return;
    }

    let html = '';
    
    // Prev button
    html += `<button class="page-btn arrow" onclick="changeUserPage(${currentPageUser - 1})" ${currentPageUser === 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}><i class="fa-solid fa-chevron-left"></i></button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${currentPageUser === i ? 'active' : ''}" onclick="changeUserPage(${i})">${i}</button>`;
    }
    
    // Next button
    html += `<button class="page-btn arrow" onclick="changeUserPage(${currentPageUser + 1})" ${currentPageUser === totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}><i class="fa-solid fa-chevron-right"></i></button>`;
    
    pageBtnsContainer.innerHTML = html;
  }

  function changeUserPage(page) {
    currentPageUser = page;
    updatePagination();
  }

  // Initialize pagination on load
  document.addEventListener('DOMContentLoaded', () => {
      updatePagination();
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');
  const noResults = document.getElementById('noResults');
  const table = document.querySelector('.data-table');

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const q = this.value.toLowerCase();
      if (q.length > 0 && clearSearch) {
          clearSearch.style.display = 'block';
      } else if (clearSearch) {
          clearSearch.style.display = 'none';
      }
      currentPageUser = 1;
      updatePagination();
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

  // Delete User
  function deleteUser(userId) {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này sẽ xóa tất cả bài viết của họ và không thể hoàn tác.')) {
      fetch(`/admin/user/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
          // Add CSRF token if needed, but for simplicity assuming no CSRF for now or handled by Spring Security defaults if configured
        }
      })
      .then(response => {
        if (response.ok) {
          alert('Xóa người dùng thành công!');
          location.reload(); // Reload to refresh counts and list
        } else {
          response.text().then(text => alert('Lỗi: ' + text));
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Đã xảy ra lỗi khi kết nối với server.');
      });
    }
  }

  // Make deleteUser global for th:onclick
  window.deleteUser = deleteUser;
