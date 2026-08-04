import { icons } from '../utils.js';

/**
 * Render the site header
 */
export function renderHeader() {
  return `
    <header class="site-header" id="site-header">
      <div class="container header-inner">
        <a href="/" data-link class="header-brand" id="header-brand">
          <img
            src="/logo.jpeg"
            alt="Radio Nova"
            class="header-logo"
          />
          <div class="header-brand-text">
            <span class="header-brand-name">Radio Nova</span>
            <span class="header-brand-tagline">Paso de los Libres, Corrientes</span>
          </div>
        </a>

        <nav class="header-nav" id="header-nav">
          <a href="/" data-link class="nav-link" data-nav="home">Inicio</a>
          <a href="/categoria/locales" data-link class="nav-link" data-nav="locales">Locales</a>
          <a href="/categoria/politica" data-link class="nav-link" data-nav="politica">Política</a>
          <a href="/categoria/deportes" data-link class="nav-link" data-nav="deportes">Deportes</a>
          <a href="/categoria/economia" data-link class="nav-link" data-nav="economia">Economía</a>
          <a href="/categoria/cultura" data-link class="nav-link" data-nav="cultura">Cultura</a>
          <a href="/categoria/policiales" data-link class="nav-link" data-nav="policiales">Policiales</a>
          <a href="/contacto" data-link class="nav-link" data-nav="contacto">Contacto</a>
        </nav>

        <button class="nav-toggle" id="nav-toggle" aria-label="Menú de navegación">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>

    <nav class="mobile-nav" id="mobile-nav">
      <a href="/" data-link class="nav-link" data-nav="home">Inicio</a>
      <a href="/categoria/locales" data-link class="nav-link" data-nav="locales">Locales</a>
      <a href="/categoria/politica" data-link class="nav-link" data-nav="politica">Política</a>
      <a href="/categoria/deportes" data-link class="nav-link" data-nav="deportes">Deportes</a>
      <a href="/categoria/economia" data-link class="nav-link" data-nav="economia">Economía</a>
      <a href="/categoria/cultura" data-link class="nav-link" data-nav="cultura">Cultura</a>
      <a href="/categoria/policiales" data-link class="nav-link" data-nav="policiales">Policiales</a>
      <a href="/contacto" data-link class="nav-link" data-nav="contacto">Contacto</a>
    </nav>
  `;
}

/**
 * Initialize header interactions
 */
export function initHeader() {
  const toggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    mobileNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  updateActiveNav();
}

/**
 * Update active navigation link
 */
export function updateActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (path === href || (href !== '/' && path.startsWith(href))) {
      link.classList.add('active');
    }
    if (path === '/' && href === '/') {
      link.classList.add('active');
    }
  });
}
