// ==========================================================================
// Studio Nabastala — Headline Cycling Animation
// ==========================================================================

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

window.addEventListener('load', () => setStageHeight(headlines[current]));
window.addEventListener('resize', () => setStageHeight(headlines[current]));

setInterval(showNextHeadline, CYCLE_INTERVAL_MS);


// ==========================================================================
// Studio Nabastala — Services Menu (open / close / drag scroll)
// ==========================================================================

const menuIcon = document.getElementById('menuIcon');
const servicesMenu = document.getElementById('servicesMenu');
const servicesClose = document.getElementById('servicesClose');
const servicesTrack = document.getElementById('servicesTrack');
const progressFill = document.getElementById('progressFill');
const indexCurrent = document.getElementById('indexCurrent');

function openMenu() {
  // Hero fades out first, overlay slides + fades in over it — see .hero /
  // body.menu-open and .services-menu transitions in style.css
  document.body.classList.add('menu-open');
  servicesMenu.classList.add('is-open');
  servicesMenu.setAttribute('aria-hidden', 'false');
  menuIcon.classList.add('is-active');
  menuIcon.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  document.body.classList.remove('menu-open');
  servicesMenu.classList.remove('is-open');
  servicesMenu.setAttribute('aria-hidden', 'true');
  menuIcon.classList.remove('is-active');
  menuIcon.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function toggleMenu() {
  if (servicesMenu.classList.contains('is-open')) {
    closeMenu();
  } else {
    openMenu();
  }
}

if (menuIcon && servicesMenu) {
  menuIcon.addEventListener('click', toggleMenu);
  menuIcon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });
}

if (servicesClose) {
  servicesClose.addEventListener('click', closeMenu);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && servicesMenu.classList.contains('is-open')) {
    closeMenu();
  }
});

// --- Smooth scroll for topbar nav links: eases to the target section
// instead of jumping, using the same cubic-bezier feel as the rest of
// the site's transitions rather than the browser's linear default ---

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

const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').slice(1);
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    e.preventDefault();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetY = targetEl.getBoundingClientRect().top + window.scrollY;

    if (prefersReducedMotion) {
      window.scrollTo({ top: targetY, behavior: 'auto' });
    } else {
      smoothScrollTo(targetY, 1100);
    }
  });
});

// Drag-to-scroll with momentum + progress indicator for the services track
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

    // Track instantaneous velocity for the momentum glide on release
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


// ==========================================================================
// Studio Nabastala — Services Section (scroll reveal + detail popup)
// ==========================================================================

// Full detail data, index-matched to .service-row[data-index] in the markup.
// Kept separate from the DOM so the popup can be reused for every service.
const SERVICE_DETAILS = [
  {
    title: 'Brand Strategy & Identity',
    desc: 'Build a brand people understand, trust, and remember.',
    tags: ['Brand Strategy', 'Brand Positioning', 'Brand Identity', 'Creative Direction', 'Campaign Strategy', 'Creative Consulting']
  },
  {
    title: 'Content & Campaigns',
    desc: 'Create stories that connect across every channel.',
    tags: ['Social Media Strategy', 'Social Media Campaigns', 'Content Strategy', 'Campaign Development', 'Art Direction', 'Copywriting Direction']
  },
  {
    title: 'Design & Visual Communication',
    desc: 'Design every touchpoint with clarity and consistency.',
    tags: ['Graphic Design', 'Marketing Collaterals', 'Presentation Design', 'Motion Graphics', 'Infographics', 'Visual Systems']
  },
  {
    title: 'Photography & Video',
    desc: 'Bring your brand to life through compelling visuals.',
    tags: ['Photography Direction', 'Photography Production', 'Video Direction', 'Video Production', 'Brand Films', 'Commercial Content']
  },
  {
    title: 'Executive Presentations',
    desc: 'Turn complex ideas into presentations that inspire confidence and drive decisions.',
    tags: ['Pitch Decks', 'Investor Presentations', 'Sales Decks', 'Company Profiles', 'Corporate Presentations', 'Keynote Presentations', 'Executive Reports', 'Business Proposals', 'Portfolios', 'CV & Personal Branding Decks']
  },
  {
    title: 'Digital Experiences',
    desc: 'Build digital experiences that move people to action.',
    tags: ['Website Design', 'Website Development', 'Landing Pages', 'UI Direction', 'Digital Brand Experience']
  },
  {
    title: 'AI Creative Systems',
    desc: 'Work faster. Think smarter. Stay human.',
    tags: ['AI Workflow Design', 'Creative Automation', 'Prompt System Development', 'AI Training for Marketing Teams', 'AI Integration for Creative Teams']
  }
];

// --- Scroll reveal (one IntersectionObserver, elements unobserved once shown) ---

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
  // Fallback: no IO support, just show everything.
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// --- Hero "curtain" transition: hero recedes as the services panel slides over it ---

const heroEl = document.querySelector('.hero');
const servicesSectionEl = document.querySelector('.services-section');

if (heroEl && servicesSectionEl && 'IntersectionObserver' in window) {
  const curtainObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      heroEl.classList.toggle('is-covered', entry.isIntersecting);
    });
  }, { threshold: 0 });

  curtainObserver.observe(servicesSectionEl);
}

// --- Contact "slide-up" transition: the contact section's cream cover
// panel slides upward and off once, exposing the dark finale beneath ---

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
  // No IntersectionObserver support — just show the section as-is.
  contactSectionEl.classList.add('is-revealed');
}

// --- Detail popup ---

const serviceRows = document.querySelectorAll('.service-row-btn');
const serviceDetail = document.getElementById('serviceDetail');
const detailBackdrop = document.getElementById('serviceDetailBackdrop');
const detailClose = document.getElementById('serviceDetailClose');
const detailNum = document.getElementById('detailNum');
const detailTitle = document.getElementById('detailTitle');
const detailDesc = document.getElementById('detailDesc');
const detailTags = document.getElementById('detailTags');
const detailPos = document.getElementById('detailPos');
const detailPrev = document.getElementById('detailPrev');
const detailNext = document.getElementById('detailNext');

let activeServiceIndex = 0;
let lastFocusedRow = null;

function renderServiceDetail(index) {
  const total = SERVICE_DETAILS.length;
  activeServiceIndex = (index + total) % total;
  const data = SERVICE_DETAILS[activeServiceIndex];

  detailNum.textContent = String(activeServiceIndex + 1).padStart(2, '0');
  detailTitle.textContent = data.title;
  detailDesc.textContent = data.desc;
  detailPos.textContent = `${String(activeServiceIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  detailTags.textContent = data.tags.join('  ·  ');

  // Reset scroll position for the new content.
  const panel = document.querySelector('.service-detail-panel');
  if (panel) panel.scrollTop = 0;
}

function openServiceDetail(index, triggerEl) {
  if (!serviceDetail) return;
  lastFocusedRow = triggerEl || null;
  renderServiceDetail(index);
  serviceDetail.classList.add('is-open');
  serviceDetail.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (detailClose) detailClose.focus();
}

function closeServiceDetail() {
  if (!serviceDetail) return;
  serviceDetail.classList.remove('is-open');
  serviceDetail.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocusedRow) lastFocusedRow.focus();
}

serviceRows.forEach((btn) => {
  btn.addEventListener('click', () => {
    const row = btn.closest('.service-row');
    const index = row ? parseInt(row.getAttribute('data-index'), 10) : 0;
    openServiceDetail(index, btn);
  });
});

if (detailClose) detailClose.addEventListener('click', closeServiceDetail);
if (detailBackdrop) detailBackdrop.addEventListener('click', closeServiceDetail);

if (detailPrev) detailPrev.addEventListener('click', () => renderServiceDetail(activeServiceIndex - 1));
if (detailNext) detailNext.addEventListener('click', () => renderServiceDetail(activeServiceIndex + 1));

document.addEventListener('keydown', (e) => {
  if (!serviceDetail || !serviceDetail.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeServiceDetail();
  if (e.key === 'ArrowLeft') renderServiceDetail(activeServiceIndex - 1);
  if (e.key === 'ArrowRight') renderServiceDetail(activeServiceIndex + 1);
});


// ==========================================================================
// Studio Nabastala — Work Section (Featured Engagements marquee)
// ==========================================================================

// Each client's logo file goes in assets/img/clients/<file>.
// If a file is missing or fails to load, a text badge with the initials
// is shown automatically instead — nothing breaks, just swap the file in
// once you have it and it'll pick it up on the next page load.
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

  // Render the set twice back-to-back so the loop point is invisible —
  // once we scroll past the first set, we're already looking at an
  // identical second set and can silently rewind by one set's width.
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

  const SPEED = 0.55; // px per frame, right-to-left by default

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

  // Pause the automatic drift while the pointer is over the track —
  // this is also the cue that dragging is available.
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
    // Wrap into [0, halfWidth) so dragging past either duplicated set
    // loops seamlessly instead of hitting a hard edge.
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


// ==========================================================================
// Studio Nabastala — Contact Section
// ==========================================================================

// Copy-to-clipboard on the "Work With Us" pill. Hover reveals the email
// (handled purely in CSS via the stacked .cta-label spans); a click always
// copies it and shows a brief "Copied" confirmation state.
const copyEmailBtn = document.getElementById('copyEmailBtn');

if (copyEmailBtn) {
  let copyResetId = null;

  copyEmailBtn.addEventListener('click', async () => {
    const email = copyEmailBtn.getAttribute('data-email');

    try {
      await navigator.clipboard.writeText(email);
    } catch (err) {
      // Clipboard API unavailable (older browser / insecure context) —
      // fall back to a mailto link instead of failing silently.
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

// Back to top
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Footer year
const footerYear = document.getElementById('footerYear');
if (footerYear) {
  footerYear.textContent = `\u00A9 ${new Date().getFullYear()}`;
}
