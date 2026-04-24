const icons = document.querySelectorAll('.nav-icon');

icons.forEach(icon => {
  icon.addEventListener('click', function () {

    // remove active
    icons.forEach(i => i.classList.remove('active'));

    // add active
    this.classList.add('active');

    // điều hướng
    const url = this.dataset.url;
    if (url) {
      window.location.href = url;
    }
  });
});