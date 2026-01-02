
/* Theme Toggle Logic */
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const icon = themeToggle.querySelector('i');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  body.setAttribute('data-theme', 'light');
  icon.classList.replace('fa-moon', 'fa-sun');
}

themeToggle.addEventListener('click', () => {
  if (body.getAttribute('data-theme') === 'light') {
    body.removeAttribute('data-theme');
    localStorage.setItem('theme', 'dark');
    icon.classList.replace('fa-sun', 'fa-moon');
  } else {
    body.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    icon.classList.replace('fa-moon', 'fa-sun');
  }
});
