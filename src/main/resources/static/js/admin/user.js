
  // Pagination
  document.querySelectorAll('.page-btn:not(.arrow)').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.page-btn:not(.arrow)').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');
  const noResults = document.getElementById('noResults');
  const table = document.querySelector('.data-table');

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const q = this.value.toLowerCase();
      let hasVisible = false;

      if (q.length > 0 && clearSearch) {
          clearSearch.style.display = 'block';
      } else if (clearSearch) {
          clearSearch.style.display = 'none';
      }

      document.querySelectorAll('.data-table tbody tr').forEach(row => {
        const nameCells = row.querySelectorAll('td');
        // 'Biệt danh' is mapped to user.username according to the table headers and th:text
        const username = nameCells[1]?.textContent.toLowerCase() || '';
        
        // As requested by user, search only by username in user.html
        if (username.includes(q)) {
           row.style.display = '';
           hasVisible = true;
        } else {
           row.style.display = 'none';
        }
      });

      if (noResults) {
          if (!hasVisible && document.querySelectorAll('.data-table tbody tr').length > 0) {
              noResults.style.display = 'block';
              table.style.display = 'none';
          } else {
              noResults.style.display = 'none';
              table.style.display = 'table';
          }
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
