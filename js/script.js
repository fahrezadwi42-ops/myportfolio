/**
 * PORTFOLIO MAIN SCRIPT — Fahreza Dwi Nurfaizum
 * Clean, safe, and performance-optimized execution.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     01. THEME SWITCHER (DARK / LIGHT) WITH LOCAL STORAGE
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Read saved theme or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  } else if (systemPrefersLight) {
    htmlElement.setAttribute('data-theme', 'light');
    updateThemeIcon('light');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    const iconSpan = themeToggleBtn.querySelector('.theme-icon');
    if (iconSpan) {
      iconSpan.textContent = theme === 'light' ? '☾' : '☼';
    }
  }

  /* ==========================================================================
     02. MOBILE NAVIGATION MENU
     ========================================================================== */
  const menuToggleBtn = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggleBtn && navMenu) {
    menuToggleBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('active');
      navMenu.classList.toggle('active');
      menuToggleBtn.setAttribute('aria-expanded', !isOpen);
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ==========================================================================
     03. INTERSECTION OBSERVER FOR SCROLL REVEAL & ACTIVE NAV
     ========================================================================== */
  const revealElements = document.querySelectorAll('[data-reveal]');

  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.15
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // Active Link Highlight
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 0 && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active-link');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active-link');
            }
          });
        }
      });
    }, {
      threshold: 0.3
    });

    sections.forEach(sec => sectionObserver.observe(sec));
  }

  /* ==========================================================================
     04. PROJECT FILTERING SYSTEM
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filterValue === 'all' || category === filterValue) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ==========================================================================
     05. CONTACT FORM HANDLING (CLIENT-SIDE)
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      formStatus.textContent = 'Terima kasih! Pesan Anda telah terkirim (Simulasi).';
      formStatus.style.color = 'var(--accent-color)';

      contactForm.reset();

      setTimeout(() => {
        formStatus.textContent = '';
      }, 5000);
    });
  }

  /* ==========================================================================
     06. PROJECT DETAIL PAGE PARAMETER HANDLER
     ========================================================================== */
  if (document.body.classList.contains('project-detail-page')) {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    // Mencegah error jika ID diakses
    if (projectId) {
      console.log(`Menampilkan rincian untuk Project ID: ${projectId}`);
    }
  }

});