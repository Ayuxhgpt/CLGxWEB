/**
 * PharmaElevate Global Script
 * Includes: Navigation, Theme, Search, Syllabus Tracker, CGPA Calculator, PWA
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initSearch();
  initLazyLoading();
  initSmoothScroll();
  initSyllabusTracker();
  initCGPACalculator();
  initDrugInteraction();
  initServiceWorker();

  // Initialize specific page features if they exist
  if (document.getElementById('events-calendar')) loadEvents();
});

/* =========================================
   1. Mobile Navigation
   ========================================= */
function initMobileNav() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }
}

/* =========================================
   2. Global Search (Fuse.js style)
   ========================================= */
async function initSearch() {
  const searchInput = document.getElementById('site-search') || document.getElementById('notes-search');
  if (!searchInput) return;

  let notesData = [];
  try {
    const response = await fetch('data/notes.json');
    notesData = await response.json();
  } catch (error) {
    console.error('Failed to load search index:', error);
  }

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length < 2) return; // Wait for 2 chars

    const results = notesData.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.topics.some(t => t.toLowerCase().includes(query))
    );

    // Display results (Simple implementation: log or create a dropdown)
    // For a production site, we'd create a results dropdown here.
    // Currently, we'll just log to console or show a simple alert if it was a real search page.
    // Since we don't have a dedicated results container in the HTML yet, we will just console log.
    console.log('Search Results:', results);
  });
}

/* =========================================
   3. Lazy Loading
   ========================================= */
function initLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });
    images.forEach(img => imageObserver.observe(img));
  }
}

/* =========================================
   4. Smooth Scroll
   ========================================= */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
}

/* =========================================
   5. Syllabus Tracker
   ========================================= */
function initSyllabusTracker() {
  const checkboxes = document.querySelectorAll('.syllabus-checkbox');
  checkboxes.forEach(box => {
    const id = box.id;
    // Load state
    if (localStorage.getItem(id) === 'checked') {
      box.checked = true;
    }

    // Save state
    box.addEventListener('change', () => {
      localStorage.setItem(id, box.checked ? 'checked' : 'unchecked');
    });
  });
}

/* =========================================
   6. CGPA Calculator (PCI Grading)
   ========================================= */
function initCGPACalculator() {
  const calcBtn = document.getElementById('calc-cgpa');
  if (!calcBtn) return;

  calcBtn.addEventListener('click', () => {
    // Logic would go here: gather inputs, calculate based on PCI formula
    // SGPA = Σ(Ci x Gi) / ΣCi
    alert('CGPA Calculator logic ready to be connected to UI inputs!');
  });
}

/* =========================================
   7. Drug Interaction Checker
   ========================================= */
async function initDrugInteraction() {
  const checkBtn = document.getElementById('check-interaction');
  if (!checkBtn) return;

  let drugData = [];
  try {
    const response = await fetch('data/drugs.json');
    drugData = await response.json();
  } catch (e) { console.error('Failed to load drug data'); }

  checkBtn.addEventListener('click', () => {
    const drug1 = document.getElementById('drug1').value;
    const drug2 = document.getElementById('drug2').value;

    const interaction = drugData.find(d =>
      (d.drug1 === drug1 && d.drug2 === drug2) ||
      (d.drug1 === drug2 && d.drug2 === drug1)
    );

    const resultDiv = document.getElementById('interaction-result');
    if (interaction) {
      resultDiv.innerHTML = `<div class="alert alert-danger"><strong>${interaction.severity}:</strong> ${interaction.description}</div>`;
    } else {
      resultDiv.innerHTML = `<div class="alert alert-success">No known interaction found in database.</div>`;
    }
  });
}

/* =========================================
   8. Events Calendar
   ========================================= */
async function loadEvents() {
  const container = document.getElementById('events-calendar');
  try {
    const response = await fetch('data/events.json');
    const events = await response.json();

    container.innerHTML = events.map(e => `
            <div class="event-card">
                <div class="event-date">${e.date}</div>
                <h4>${e.title}</h4>
                <p>${e.description}</p>
            </div>
        `).join('');
  } catch (e) {
    container.innerHTML = '<p>Failed to load events.</p>';
  }
}

/* =========================================
   9. PWA Service Worker
   ========================================= */
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}
