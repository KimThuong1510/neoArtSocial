
  document.querySelectorAll('.page-btn:not(.arrow)').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.page-btn:not(.arrow)').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Search
  document.querySelector('.search-box input').addEventListener('input', function () {
    const q = this.value.toLowerCase();
    document.querySelectorAll('.data-table tbody tr').forEach(row => {
      const name = row.querySelectorAll('td')[1]?.textContent.toLowerCase() || '';
      row.style.display = name.includes(q) ? '' : 'none';
    });
  });