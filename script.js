
(function runSplash() {
  const splash = document.getElementById('splash');
  const textEl = document.getElementById('splashText');
  if (!splash || !textEl) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.body.classList.add('splash-active');

  const SERVICE_TEXTS = [
    'Brand Strategy & Identity',
    'Content & Campaigns',
    'Design & Visual Communication',
    'Photography & Video',
    'Executive Presentations',
    'Digital Experiences',
    'AI Creative Systems'
  ];
  const FLICKER_FONTS = [
    "'Cormorant Garamond', serif",
    "'Space Grotesk', sans-serif",
    "'Bodoni Moda', serif",
    "'Unbounded', sans-serif",
    "'DM Mono', monospace",
    "'Playfair Display', serif",
    "'Big Shoulders Display', sans-serif",
    "'Instrument Serif', serif"
  ];
  const FLICKER_MS = 180;
  const SETTLE_DELAYS = [260, 340, 440, 580, 720];
  const MIN_DURATION_MS = prefersReducedMotion ? 200 : 1900;

  let stepIndex = 0;
  let settling = false;
  let settleStep = 0;
  let timeoutId = null;

  function paintStep() {
    textEl.textContent = SERVICE_TEXTS[stepIndex % SERVICE_TEXTS.length];
    textEl.style.fontFamily = FLICKER_FONTS[stepIndex % FLICKER_FONTS.length];
    stepIndex++;
  }

  function tick() {
    if (!settling) {
      paintStep();
      timeoutId = setTimeout(tick, FLICKER_MS);
      return;
    }

    if (settleStep < SETTLE_DELAYS.length) {
      paintStep();
      timeoutId = setTimeout(tick, SETTLE_DELAYS[settleStep]);
      settleStep++;
      return;
    }

    showLogo();
  }

  function showLogo() {
    splash.classList.add('is-logo');
    setTimeout(zoomAndFinish, 1300);
  }

  function zoomAndFinish() {
    splash.classList.add('is-zoom');
    splash.classList.add('is-done');
    document.body.classList.remove('splash-active');
    document.dispatchEvent(new CustomEvent('studio:splashComplete'));
    setTimeout(() => splash.remove(), 950);
  }

  if (prefersReducedMotion) {
    textEl.textContent = 'Studio Nabastala';
    textEl.style.fontFamily = "'Cormorant Garamond', serif";
  } else {
    tick();
  }

  const minDurationPromise = new Promise((resolve) => setTimeout(resolve, MIN_DURATION_MS));
  const pageLoadPromise = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
  const fontsReadyPromise = (document.fonts && document.fonts.ready)
    ? document.fonts.ready
    : Promise.resolve();

  Promise.all([minDurationPromise, pageLoadPromise, fontsReadyPromise]).then(() => {
    if (prefersReducedMotion) {
      showLogo();
    } else {
      settling = true;
    }
  });
})();

const stage = document.getElementById('headlineStage');
const headlines = document.querySelectorAll('.headline');

const CYCLE_INTERVAL_MS = 4800;

let current = 0;

function setStageHeight(el) {
  stage.style.height = el.offsetHeight + 'px';
}

function showNextHeadline() {
  headlines[current].classList.remove('active');
  current = (current + 1) % headlines.length;
  headlines[current].classList.add('active');
  setStageHeight(headlines[current]);
}

function startHeadlineCycle() {
  if (!stage || !headlines.length) return;
  setStageHeight(headlines[current]);
  setInterval(showNextHeadline, CYCLE_INTERVAL_MS);
}

window.addEventListener('resize', () => {
  if (headlines.length) setStageHeight(headlines[current]);
});

const splashEl = document.getElementById('splash');
if (splashEl) {
  document.addEventListener('studio:splashComplete', startHeadlineCycle, { once: true });
} else {
  startHeadlineCycle();
}

const menuIcon = document.getElementById('menuIcon');
const navSidebar = document.getElementById('navSidebar');
const navSidebarClose = document.getElementById('navSidebarClose');
const navSidebarBackdrop = document.getElementById('navSidebarBackdrop');
const servicesTrack = document.getElementById('servicesTrack');
const progressFill = document.getElementById('progressFill');
const indexCurrent = document.getElementById('indexCurrent');

function openMenu() {
  document.body.classList.add('nav-open');
  navSidebar.classList.add('is-open');
  navSidebar.setAttribute('aria-hidden', 'false');
  menuIcon.classList.add('is-active');
  menuIcon.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  document.body.classList.remove('nav-open');
  navSidebar.classList.remove('is-open');
  navSidebar.setAttribute('aria-hidden', 'true');
  menuIcon.classList.remove('is-active');
  menuIcon.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function toggleMenu() {
  if (navSidebar.classList.contains('is-open')) {
    closeMenu();
  } else {
    openMenu();
  }
}

if (menuIcon && navSidebar) {
  menuIcon.addEventListener('click', toggleMenu);
  menuIcon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });
}

if (navSidebarClose) {
  navSidebarClose.addEventListener('click', closeMenu);
}

if (navSidebarBackdrop) {
  navSidebarBackdrop.addEventListener('click', closeMenu);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navSidebar.classList.contains('is-open')) {
    closeMenu();
  }
});

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY, duration = 1000) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const navLinks = document.querySelectorAll('.nav-sidebar-links a[href^="#"]');

navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').slice(1);
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    e.preventDefault();
    closeMenu();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setTimeout(() => {
      const targetY = targetEl.getBoundingClientRect().top + window.scrollY;
      if (prefersReducedMotion) {
        window.scrollTo({ top: targetY, behavior: 'auto' });
      } else {
        smoothScrollTo(targetY, 1100);
      }
    }, 120);
  });
});

if (servicesTrack) {
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;
  let momentumId = null;

  const dragCursor = document.getElementById('dragCursor');

  function moveCursor(e) {
    if (!dragCursor) return;
    dragCursor.style.left = e.clientX + 'px';
    dragCursor.style.top = e.clientY + 'px';
  }

  servicesTrack.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse' || !dragCursor) return;
    moveCursor(e);
    dragCursor.classList.add('is-visible');
  });

  servicesTrack.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') moveCursor(e);
    if (!isDown) return;

    const dx = e.clientX - startX;
    servicesTrack.scrollLeft = scrollStart - dx;

    const now = performance.now();
    const dt = now - lastTime;
    if (dt > 0) {
      velocity = (e.clientX - lastX) / dt;
    }
    lastX = e.clientX;
    lastTime = now;
  });

  servicesTrack.addEventListener('pointerleave', () => {
    if (dragCursor) dragCursor.classList.remove('is-visible', 'is-dragging');
  });

  servicesTrack.addEventListener('pointerdown', (e) => {
    isDown = true;
    startX = e.clientX;
    scrollStart = servicesTrack.scrollLeft;
    lastX = e.clientX;
    lastTime = performance.now();
    velocity = 0;
    if (momentumId) cancelAnimationFrame(momentumId);
    servicesTrack.setPointerCapture(e.pointerId);
    if (dragCursor) dragCursor.classList.add('is-dragging');
  });

  function glide() {
    if (Math.abs(velocity) < 0.02) {
      momentumId = null;
      return;
    }
    servicesTrack.scrollLeft -= velocity * 16;
    velocity *= 0.94;
    momentumId = requestAnimationFrame(glide);
  }

  const endDrag = () => {
    if (!isDown) return;
    isDown = false;
    if (dragCursor) dragCursor.classList.remove('is-dragging');
    momentumId = requestAnimationFrame(glide);
  };
  servicesTrack.addEventListener('pointerup', endDrag);
  servicesTrack.addEventListener('pointercancel', endDrag);

  function updateProgress() {
    const max = servicesTrack.scrollWidth - servicesTrack.clientWidth;
    const pct = max > 0 ? (servicesTrack.scrollLeft / max) * 100 : 0;

    if (progressFill) {
      progressFill.style.width = Math.max(6, pct) + '%';
    }

    if (indexCurrent) {
      const cards = servicesTrack.querySelectorAll('.service-card');
      const active = Math.min(
        cards.length,
        Math.round((pct / 100) * (cards.length - 1)) + 1
      );
      indexCurrent.textContent = String(active).padStart(2, '0');
    }
  }

  servicesTrack.addEventListener('scroll', updateProgress);
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

const revealEls = document.querySelectorAll('[data-reveal]');

if (revealEls.length && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

const contactSectionEl = document.querySelector('.contact-section');

if (contactSectionEl && 'IntersectionObserver' in window) {
  const contactRevealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        contactSectionEl.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.22 });

  contactRevealObserver.observe(contactSectionEl);
} else if (contactSectionEl) {
  contactSectionEl.classList.add('is-revealed');
}

const CLIENTS = [
  { name: 'Google',              initials: 'G',  logo: 'assets/img/clients/google.png',             bio: 'One of the world\u2019s largest technology companies, known for search, digital advertising, and cloud platforms.' },
  { name: 'digibank by DBS',     initials: 'dB', logo: 'assets/img/clients/digibank.png',           bio: 'DBS\u2019s fully digital banking platform, built for a mobile-first generation.' },
  { name: 'IDN Times',           initials: 'IT', logo: 'assets/img/clients/idn.png',                bio: 'Indonesian digital media platform delivering news and lifestyle content to a young, connected audience.' },
  { name: 'Nutrifood',           initials: 'N',  logo: 'assets/img/clients/nutrifood.png',          bio: 'Indonesian food and beverage company focused on health-conscious products.' },
  { name: 'Listerine',           initials: 'L',  logo: 'assets/img/clients/listerine.png',          bio: 'Global oral care brand under Johnson & Johnson, known for its antiseptic mouthwash.' },
  { name: 'Honda Jakarta Center',initials: 'H',  logo: 'assets/img/clients/honda.png',              bio: 'Official Honda automobile dealership serving the greater Jakarta area.' },
  { name: 'GoPay',               initials: 'G',  logo: 'assets/img/clients/gopay.png',              bio: 'Digital wallet and payments platform within the Gojek ecosystem.' },
  { name: 'Campina',             initials: 'C',  logo: 'assets/img/clients/campina.png',            bio: 'One of Indonesia\u2019s leading ice cream manufacturers.' },
  { name: 'Indonesia Mengajar',  initials: 'IM', logo: 'assets/img/clients/im.png',                 bio: 'Indonesian social movement placing young teachers in underserved communities nationwide.' },
  { name: 'Garuda Indonesia',    initials: 'GA', logo: 'assets/img/clients/garuda.png',             bio: 'Indonesia\u2019s national flag carrier airline.' },
  { name: 'OVO',                 initials: 'OVO',logo: 'assets/img/clients/ovo.png',                bio: 'Indonesian digital payments and e-wallet platform.' },
  { name: 'Save the Children',   initials: 'SC', logo: 'assets/img/clients/stc.png',                bio: 'International non-profit organization dedicated to children\u2019s rights and welfare.' },
  { name: 'DOT Entertainment',   initials: 'DE', logo: 'assets/img/clients/dot.png',                bio: 'Indonesian creative production house specializing in content, film, and event production.' },
  { name: 'Transfez & Jack Finance', initials: 'TJ', logo: 'assets/img/clients/jack.png',           bio: 'Indonesian fintech platforms offering cross-border money transfer and digital financial services.' },
  { name: 'Waresix',             initials: 'W',  logo: 'assets/img/clients/waresix.png',            bio: 'Indonesian logistics technology platform connecting shippers with trucking and warehousing networks.' }
];

const workTrackWrap = document.getElementById('workTrackWrap');
const workTrack = document.getElementById('workTrack');
const workDragCursor = document.getElementById('workDragCursor');
const workCounter = document.getElementById('workCounter');

if (workTrackWrap && workTrack) {

  function clientItemHTML(client, isClone) {
    return `
      <li class="work-item"${isClone ? ' aria-hidden="true"' : ''}>
        <div class="work-item-inner" tabindex="${isClone ? '-1' : '0'}">
          <div class="work-logo">
            <img
              src="${client.logo}"
              alt="${client.name}"
              draggable="false"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <span class="work-logo-fallback">${client.initials}</span>
          </div>
          <span class="work-divider"></span>
          <h3 class="work-name">${client.name}</h3>
          <p class="work-bio">${client.bio}</p>
        </div>
      </li>`;
  }

  const originalHTML = CLIENTS.map((c) => clientItemHTML(c, false)).join('');
  const cloneHTML = CLIENTS.map((c) => clientItemHTML(c, true)).join('');
  workTrack.innerHTML = originalHTML + cloneHTML;

  if (workCounter) {
    workCounter.textContent = `00 /${String(CLIENTS.length).padStart(2, '0')}`;
  }

  let halfWidth = 0;
  function measure() {
    halfWidth = workTrack.scrollWidth / 2;
  }

  let isDown = false;
  let autoScroll = true;
  let startX = 0;
  let scrollStart = 0;

  const SPEED = 0.55;

  function updateCounter() {
    if (!workCounter || halfWidth <= 0) return;
    const perItem = halfWidth / CLIENTS.length;
    let idx = Math.round(workTrackWrap.scrollLeft / perItem) % CLIENTS.length;
    if (idx < 0) idx += CLIENTS.length;
    workCounter.textContent = `${String(idx).padStart(2, '0')} /${String(CLIENTS.length).padStart(2, '0')}`;
  }

  function tick() {
    if (halfWidth > 0) {
      if (autoScroll && !isDown) {
        workTrackWrap.scrollLeft += SPEED;
        if (workTrackWrap.scrollLeft >= halfWidth) {
          workTrackWrap.scrollLeft -= halfWidth;
        }
      }
      updateCounter();
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('load', () => {
    measure();
    requestAnimationFrame(tick);
  });
  window.addEventListener('resize', measure);

  workTrackWrap.addEventListener('mouseenter', () => { autoScroll = false; });
  workTrackWrap.addEventListener('mouseleave', () => { autoScroll = true; });

  function moveWorkCursor(e) {
    if (!workDragCursor) return;
    workDragCursor.style.left = e.clientX + 'px';
    workDragCursor.style.top = e.clientY + 'px';
  }

  workTrackWrap.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse' || !workDragCursor) return;
    moveWorkCursor(e);
    workDragCursor.classList.add('is-visible');
  });

  workTrackWrap.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') moveWorkCursor(e);
    if (!isDown || halfWidth <= 0) return;

    const dx = e.clientX - startX;
    let next = scrollStart - dx;
    next = ((next % halfWidth) + halfWidth) % halfWidth;
    workTrackWrap.scrollLeft = next;
  });

  workTrackWrap.addEventListener('pointerleave', () => {
    if (workDragCursor) workDragCursor.classList.remove('is-visible', 'is-dragging');
  });

  workTrackWrap.addEventListener('pointerdown', (e) => {
    isDown = true;
    startX = e.clientX;
    scrollStart = workTrackWrap.scrollLeft;
    workTrackWrap.setPointerCapture(e.pointerId);
    if (workDragCursor) workDragCursor.classList.add('is-dragging');
  });

  function endWorkDrag() {
    isDown = false;
    if (workDragCursor) workDragCursor.classList.remove('is-dragging');
  }
  workTrackWrap.addEventListener('pointerup', endWorkDrag);
  workTrackWrap.addEventListener('pointercancel', endWorkDrag);
}

const copyEmailBtn = document.getElementById('copyEmailBtn');

if (copyEmailBtn) {
  let copyResetId = null;

  copyEmailBtn.addEventListener('click', async () => {
    const email = copyEmailBtn.getAttribute('data-email');

    try {
      await navigator.clipboard.writeText(email);
    } catch (err) {
      window.location.href = `mailto:${email}`;
      return;
    }

    copyEmailBtn.classList.add('is-copied');

    if (copyResetId) clearTimeout(copyResetId);
    copyResetId = setTimeout(() => {
      copyEmailBtn.classList.remove('is-copied');
    }, 2200);
  });
}

const backToTop = document.getElementById('backToTop');
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const footerYear = document.getElementById('footerYear');
if (footerYear) {
  footerYear.textContent = `\u00A9 ${new Date().getFullYear()}`;
}
