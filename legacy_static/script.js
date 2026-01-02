/* Main JS for interactive features:
   - Mobile menu toggle
   - Smooth scroll for internal links
   - Stats counter when visible (IntersectionObserver)
   - Scroll reveal animations (IntersectionObserver)
*/

// MOBILE MENU
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!expanded));
    navLinks.classList.toggle('show');
  });

  // close menu on link click (mobile)
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('show');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// SMOOTH SCROLL FOR INTERNAL LINKS
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href.length > 1) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// STATS COUNTER
const counters = document.querySelectorAll('.count');
const counterObserverOptions = { root: null, rootMargin: '0px', threshold: 0.45 };

function runCounter(el) {
  const target = +el.dataset.target;
  const duration = 1700; // ms
  const start = 0;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    el.textContent = Math.floor(progress * (target - start) + start);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target;
    }
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      if (!el.classList.contains('counted')) {
        runCounter(el);
        el.classList.add('counted');
      }
      obs.unobserve(el);
    }
  });
}, counterObserverOptions);

counters.forEach(c => counterObserver.observe(c));

// SCROLL REVEAL FOR .reveal ELEMENTS
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

revealElements.forEach(el => revealObserver.observe(el));

// ACTIVE NAV LINK ON SCROLL
const navAnchors = document.querySelectorAll('.nav-links a');
const sections = Array.from(navAnchors).map(a => {
  const href = a.getAttribute('href');
  return href.startsWith('#') ? document.querySelector(href) : null;
});

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  sections.forEach((sec, idx) => {
    if (!sec) return;
    const top = sec.offsetTop - 120;
    const bottom = top + sec.offsetHeight;
    if (y >= top && y < bottom) {
      navAnchors.forEach(a => a.classList.remove('active'));
      navAnchors[idx].classList.add('active');
    }
  });
});

// Accessibility: reduce motion respect
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
if (mediaQuery.matches) {
  // remove animations by quickly showing reveal elements and setting counters instantly
  document.querySelectorAll('.reveal').forEach(r => r.classList.add('visible'));
  document.querySelectorAll('.count').forEach(c => {
    c.textContent = c.dataset.target;
  });
}
/* TELEGRAM SUBSCRIPTION FORM (Name + Email + Optional Phone) */
const subscribeForm = document.querySelector(".subscribe-form");
if (subscribeForm) {
  const BOT_TOKEN = "8009980915:AAFoYoG1SpzIYKg1pYGhw-ewRpf4JpLAxUk";
  const ADMIN_CHAT_ID = "5551211670";

  subscribeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = subscribeForm.querySelector('input[name="name"]').value.trim();
    const email = subscribeForm.querySelector('input[name="email"]').value.trim();
    const phone = subscribeForm.querySelector('input[name="phone"]').value.trim();

    if (!name || !email) return;

    let message = `Heyy!!! CEO\n📩 New Subscription On Your Website PharmaElevated:\nName: ${name}\nEmail: ${email}`;
    if (phone) {
      message += `\nPhone: ${phone}`;
    }

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: message,
        }),
      });

      subscribeForm.reset();
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong. Please try again later.");
    }
  });
}
