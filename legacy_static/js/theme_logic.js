/* Theme Logic: Dark/Light Mode & Pro Theme Layer */

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;

    // 1. Check LocalStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    // 2. Toggle Event
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        });
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            body.setAttribute('data-theme', 'light');
            if (icon) icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            body.removeAttribute('data-theme'); // Default is dark
            if (icon) icon.classList.replace('fa-sun', 'fa-moon');
        }
        localStorage.setItem('theme', theme);
    }

    // Optional: Check for Pro Theme Layer
    // This logic allows enabling/disabling the 'genc_pro_style.css' layer programmatically if needed.
    // For now, it's controlled by the HTML link tag presence, but we could toggle it here.
});
