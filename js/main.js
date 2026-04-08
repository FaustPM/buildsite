// Init language
setLang('ca');

// Hamburger
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});

function closeMobile() {
  document.getElementById('mobileMenu').classList.remove('open');
}

// Scroll top button
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
});

// Cookie banner
window.addEventListener('load', () => {
  if (!localStorage.getItem('cookieConsent')) {
    setTimeout(() => {
      document.getElementById('cookieBanner').classList.add('show');
    }, 1200);
  }
});

function acceptCookie() {
  localStorage.setItem('cookieConsent', 'accepted');
  document.getElementById('cookieBanner').classList.remove('show');
}

function closeCookie() {
  localStorage.setItem('cookieConsent', 'declined');
  document.getElementById('cookieBanner').classList.remove('show');
}

function showCookieInfo() {
  alert('Usamos cookies técnicas para el correcto funcionamiento del sitio web y cookies estadísticas para mejorar nuestros servicios. No utilizamos cookies de terceros con fines publicitarios.');
}

// FAB
let fabOpen = false;

const chatIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const closeIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

function toggleFab(e) {
  e.stopPropagation();
  fabOpen = !fabOpen;
  document.getElementById('fabMenu').classList.toggle('open', fabOpen);
  const btn = document.getElementById('fabMain');
  btn.classList.toggle('open', fabOpen);
  btn.innerHTML = fabOpen ? closeIcon : chatIcon;
}

function closeFab() {
  fabOpen = false;
  document.getElementById('fabMenu').classList.remove('open');
  const btn = document.getElementById('fabMain');
  btn.classList.remove('open');
  btn.innerHTML = chatIcon;
}

document.addEventListener('click', (e) => {
  if (fabOpen && !e.target.closest('.fab-wrapper')) closeFab();
});

// Active nav highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === '#' + entry.target.id
          ? 'var(--white)' : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));
