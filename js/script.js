// ==========================================
// PRELOADER / OPENING SCREEN
// ==========================================
(function () {
  const preloader = document.getElementById('preloader');
  const fill = document.getElementById('preloader-fill');
  const percentText = document.getElementById('preloader-percent');

  function hidePreloader() {
    if (preloader) preloader.classList.add('hidden');
    document.body.classList.remove('loading');
  }

  if (!preloader || !fill || !percentText) {
    // Elemen tidak ditemukan (mismatch HTML) — langsung tampilkan halaman,
    // jangan biarkan halaman terjebak tersembunyi.
    hidePreloader();
    return;
  }

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) progress = 100;
    fill.style.width = progress + '%';
    percentText.textContent = Math.floor(progress) + '%';
    if (progress === 100) clearInterval(interval);
  }, 120);

  window.addEventListener('load', () => {
    setTimeout(() => {
      fill.style.width = '100%';
      percentText.textContent = '100%';
      setTimeout(hidePreloader, 300);
    }, 400);
  });

  // Jaring pengaman tambahan: apapun yang terjadi, preloader WAJIB
  // hilang paling lambat 5 detik setelah halaman mulai dimuat.
  setTimeout(hidePreloader, 5000);
})();

/**
 * PORTFOLIO MAIN SCRIPT — Fahreza Dwi Nurfaizum
 * Setiap bagian dibungkus try/catch sendiri-sendiri.
 * Kalau satu bagian gagal, bagian lain (terutama scroll reveal
 * di bagian 03, yang menampilkan section Proyek dkk) TETAP jalan.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     01. THEME SWITCHER (DARK / LIGHT) WITH LOCAL STORAGE
     ========================================================================== */
  try {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    function updateThemeIcon(theme) {
      if (!themeToggleBtn) return;
      const iconSpan = themeToggleBtn.querySelector('.theme-icon');
      if (iconSpan) {
        iconSpan.textContent = theme === 'light' ? '☾' : '☼';
      }
    }

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
  } catch (err) {
    console.error('Theme switcher error:', err);
  }

  /* ==========================================================================
     02. MOBILE NAVIGATION MENU
     ========================================================================== */
  let navLinks = [];
  try {
    const menuToggleBtn = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    navLinks = document.querySelectorAll('.nav-link');

    if (menuToggleBtn && navMenu) {
      menuToggleBtn.addEventListener('click', () => {
        const isOpen = navMenu.classList.contains('active');
        navMenu.classList.toggle('active');
        menuToggleBtn.setAttribute('aria-expanded', String(!isOpen));
      });

      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          menuToggleBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }
  } catch (err) {
    console.error('Mobile nav error:', err);
  }

  /* ==========================================================================
     02b. NAVBAR SCROLL EFFECT (glass/transparan di atas -> solid saat scroll)
     ========================================================================== */
  try {
    const headerEl = document.getElementById('header');
    if (headerEl) {
      const SCROLL_THRESHOLD = 40;

      function updateHeaderOnScroll() {
        if (window.scrollY > SCROLL_THRESHOLD) {
          headerEl.classList.add('scrolled');
        } else {
          headerEl.classList.remove('scrolled');
        }
      }

      updateHeaderOnScroll();
      window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
    }
  } catch (err) {
    console.error('Navbar scroll effect error:', err);
  }

  /* ==========================================================================
     02c. SCROLL PROGRESS BAR (garis tipis vertikal di sisi kanan layar)
     ========================================================================== */
  try {
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      function updateScrollProgress() {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        progressBar.style.height = scrolled + '%';
      }
      updateScrollProgress();
      window.addEventListener('scroll', updateScrollProgress, { passive: true });
      window.addEventListener('resize', updateScrollProgress);
    }
  } catch (err) {
    console.error('Scroll progress bar error:', err);
  }

  /* ==========================================================================
     02d. SLIDING NAV INDICATOR (pill yang meluncur mengikuti menu aktif)
     ========================================================================== */
  let moveNavIndicator = function () {};
  try {
    const navIndicator = document.getElementById('nav-indicator');
    const navMenuList = document.getElementById('nav-menu');

    if (navIndicator && navMenuList) {
      moveNavIndicator = function (targetLink) {
        if (!targetLink) return;
        const menuRect = navMenuList.getBoundingClientRect();
        const linkRect = targetLink.getBoundingClientRect();
        navIndicator.style.width = linkRect.width + 'px';
        navIndicator.style.transform = `translateX(${linkRect.left - menuRect.left}px)`;
      };

      const initialActive = navMenuList.querySelector('.nav-link.active-link');
      // Tunggu font & layout siap supaya posisi awal akurat
      requestAnimationFrame(() => moveNavIndicator(initialActive));
      window.addEventListener('resize', () => {
        const current = navMenuList.querySelector('.nav-link.active-link');
        moveNavIndicator(current);
      });
    }
  } catch (err) {
    console.error('Nav indicator error:', err);
  }

  /* ==========================================================================
     03. INTERSECTION OBSERVER FOR SCROLL REVEAL & ACTIVE NAV
     (BAGIAN INI YANG MENAMPILKAN SECTION PROYEK, DLL — dibungkus try/catch
      paling ketat + fallback paksa tampil kalau observer gagal)
     ========================================================================== */
  try {
    const revealElements = document.querySelectorAll('[data-reveal]');

    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { root: null, threshold: 0.1 });

      revealElements.forEach(el => revealObserver.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('revealed'));
    }
  } catch (err) {
    console.error('Scroll reveal error:', err);
    // Fallback: paksa semua section tampil kalau observer gagal total
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
  }

  try {
    const sections = document.querySelectorAll('section[id]');
    if (sections.length > 0 && 'IntersectionObserver' in window) {
      // Hanya jalur tipis di tengah layar yang dipakai untuk menandai menu
      // aktif, supaya tidak ada dua section yang dianggap "terlihat" sekaligus
      // (itu yang bikin menu salah nyala, misalnya SKILL masih aktif padahal
      // sudah di section Proyek).
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              link.classList.remove('active-link');
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active-link');
                moveNavIndicator(link);
              }
            });
          }
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

      sections.forEach(sec => sectionObserver.observe(sec));
    }
  } catch (err) {
    console.error('Active nav observer error:', err);
  }

  /* ==========================================================================
     04. PROJECT FILTERING SYSTEM
     ========================================================================== */
  try {
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
            card.style.display = (filterValue === 'all' || category === filterValue) ? 'block' : 'none';
          });
        });
      });
    }
  } catch (err) {
    console.error('Project filter error:', err);
  }

  /* ==========================================================================
     05. 3D TILT ANIMATION FOR PROFILE CARD
     ========================================================================== */
  try {
    const profileCard = document.querySelector('.profile-floating-card');
    const heroSection = document.querySelector('.hero') || document.body;

    if (profileCard && heroSection && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      profileCard.style.willChange = 'transform';

      heroSection.addEventListener('mousemove', (e) => {
        const rect = profileCard.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        const rotateX = (mouseY / (window.innerHeight / 2)) * -10;
        const rotateY = (mouseX / (window.innerWidth / 2)) * 10;

        profileCard.style.transition = 'transform 0.15s ease-out';
        profileCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      });

      heroSection.addEventListener('mouseleave', () => {
        profileCard.style.transition = 'transform 0.6s ease-in-out';
        profileCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      });
    }
  } catch (err) {
    console.error('Tilt animation error:', err);
  }

  /* ==========================================================================
     06. CURSOR DUST TRAIL (canvas — halus, ringan, tidak bikin patah-patah)
     ========================================================================== */
  try {
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isFinePointer && !prefersReducedMotion) {
      const canvas = document.createElement('canvas');
      canvas.id = 'dust-canvas';
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d');

      function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const dustColors = ['56,189,248', '125,211,252', '255,255,255', '14,165,233'];
      let particles = [];
      const maxParticles = 90;

      let mouseX = null;
      let mouseY = null;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        particles.push({
          x: mouseX + (Math.random() - 0.5) * 6,
          y: mouseY + (Math.random() - 0.5) * 6,
          size: 2 + Math.random() * 2.5,
          life: 1,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 0.25 + Math.random() * 0.35,
          color: dustColors[Math.floor(Math.random() * dustColors.length)]
        });

        if (particles.length > maxParticles) {
          particles.splice(0, particles.length - maxParticles);
        }
      });

      function renderDust() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
          p.life -= 0.018;
          p.x += p.vx;
          p.y += p.vy;

          const alpha = Math.max(p.life, 0);
          ctx.beginPath();
          ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
          ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
          ctx.fill();
        });

        particles = particles.filter(p => p.life > 0);
        requestAnimationFrame(renderDust);
      }
      renderDust();
    }
  } catch (err) {
    console.error('Cursor dust trail error:', err);
  }

  /* ==========================================================================
     07. CONTACT FORM SUBMISSION (WEB3FORMS)
     ========================================================================== */
  try {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const accessKey = contactForm.querySelector('input[name="access_key"]')?.value;
        if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
          formStatus.textContent = 'Form belum aktif — access key belum dipasang.';
          formStatus.className = 'form-status error';
          return;
        }

        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'MENGIRIM...';
        formStatus.textContent = '';
        formStatus.className = 'form-status';

        try {
          const formData = new FormData(contactForm);
          const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: formData
          });
          const result = await response.json();

          if (result.success) {
            formStatus.textContent = 'Pesan terkirim! Terima kasih, saya akan segera membalas.';
            formStatus.className = 'form-status success';
            contactForm.reset();
          } else {
            throw new Error(result.message || 'Gagal mengirim pesan.');
          }
        } catch (err) {
          formStatus.textContent = 'Gagal mengirim pesan. Coba lagi atau hubungi lewat email langsung.';
          formStatus.className = 'form-status error';
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
    }
  } catch (err) {
    console.error('Contact form error:', err);
  }

  /* ==========================================================================
     08. PROJECT DETAIL PAGE PARAMETER HANDLER
     ========================================================================== */
  try {
    if (document.body.classList.contains('project-detail-page')) {
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('id');
      if (projectId) {
        console.log(`Menampilkan rincian untuk Project ID: ${projectId}`);
      }
    }
  } catch (err) {
    console.error('Project detail page error:', err);
  }

});