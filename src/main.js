import { Router } from './router.js';
import { renderHeader, initHeader, updateActiveNav } from './components/header.js';
import { renderPlayer, initPlayer } from './components/player.js';
import { renderFooter } from './components/footer.js';
import { renderHomePage } from './pages/home.js';
import { renderArticlePage } from './pages/article.js';
import { renderCategoryPage } from './pages/category.js';
import { renderContactPage } from './pages/contact.js';
import { renderAdminLoginPage } from './pages/admin-login.js';
import { renderAdminDashboardPage } from './pages/admin-dashboard.js';
import { renderAdminEditorPage } from './pages/admin-editor.js';
import { getSession, logout } from './lib/supabase.js';

// App container
const app = document.getElementById('app');

// Content container (will be created after initial render)
let contentEl;
let currentShell = null; // 'public' or 'admin'

/**
 * Render persistent shell (header + player + content container + footer)
 */
function renderPublicShell() {
  if (currentShell === 'public') return;
  currentShell = 'public';

  app.innerHTML = `
    ${renderHeader()}
    ${renderPlayer()}
    <div id="page-content"></div>
    ${renderFooter()}
  `;

  contentEl = document.getElementById('page-content');

  // Initialize persistent components
  initHeader();
  initPlayer();
}

/**
 * Render admin shell (minimal topbar + content container)
 */
function renderAdminShell() {
  if (currentShell === 'admin') return;
  currentShell = 'admin';

  app.innerHTML = `
    <div class="admin-shell">
      <div class="admin-topbar">
        <a href="/admin" data-link class="admin-topbar-brand">
          <img src="/logo.jpeg" alt="Radio Nova" />
          <span>Radio Nova</span>
          <small>Admin</small>
        </a>
        <div class="admin-topbar-actions">
          <a href="/" data-link class="btn btn-ghost btn-sm">Ver sitio</a>
          <button class="btn btn-ghost btn-sm" id="admin-logout-btn">Cerrar sesión</button>
        </div>
      </div>
      <div id="page-content"></div>
    </div>
  `;

  contentEl = document.getElementById('page-content');

  // Logout button
  document.getElementById('admin-logout-btn').addEventListener('click', async () => {
    await logout();
    window.history.pushState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

/**
 * Render login shell (no chrome at all)
 */
function renderLoginShell() {
  if (currentShell === 'login') return;
  currentShell = 'login';

  app.innerHTML = '<div id="page-content"></div>';
  contentEl = document.getElementById('page-content');
}

/**
 * Auth guard for admin routes
 */
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.history.replaceState(null, '', '/admin/login');
    renderLoginShell();
    renderAdminLoginPage(contentEl);
    return false;
  }
  return true;
}

/**
 * Load the admin CSS on demand
 */
let adminCssLoaded = false;
function loadAdminCss() {
  if (adminCssLoaded) return;
  adminCssLoaded = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/src/styles/admin.css';
  document.head.appendChild(link);
}

/**
 * Initialize the router with all routes
 */
function initRouter() {
  const router = new Router([
    // --- Public routes ---
    {
      path: '/',
      render: async () => {
        renderPublicShell();
        document.title = 'Radio Nova — Noticias de Paso de los Libres y la región';
        await renderHomePage(contentEl);
        updateActiveNav();
      },
    },
    {
      path: '/noticia/:slug',
      render: async (params) => {
        renderPublicShell();
        await renderArticlePage(contentEl, params);
        updateActiveNav();
      },
    },
    {
      path: '/categoria/:category',
      render: async (params) => {
        renderPublicShell();
        await renderCategoryPage(contentEl, params);
        updateActiveNav();
      },
    },
    {
      path: '/contacto',
      render: () => {
        renderPublicShell();
        renderContactPage(contentEl);
        updateActiveNav();
      },
    },

    // --- Admin routes ---
    {
      path: '/admin/login',
      render: () => {
        loadAdminCss();
        renderLoginShell();
        renderAdminLoginPage(contentEl);
      },
    },
    {
      path: '/admin',
      guard: requireAuth,
      render: async () => {
        loadAdminCss();
        renderAdminShell();
        await renderAdminDashboardPage(contentEl);
      },
    },
    {
      path: '/admin/nueva',
      guard: requireAuth,
      render: async () => {
        loadAdminCss();
        renderAdminShell();
        await renderAdminEditorPage(contentEl);
      },
    },
    {
      path: '/admin/editar/:id',
      guard: requireAuth,
      render: async (params) => {
        loadAdminCss();
        renderAdminShell();
        await renderAdminEditorPage(contentEl, params);
      },
    },
  ]);

  // Initial render
  router.resolve();
}

// Boot the app
const path = window.location.pathname;
if (path.startsWith('/admin')) {
  loadAdminCss();
  if (path === '/admin/login') {
    renderLoginShell();
  } else {
    // Will be handled by auth guard
    renderAdminShell();
  }
} else {
  renderPublicShell();
}
initRouter();
