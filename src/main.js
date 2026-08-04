import { Router } from './router.js';
import { renderHeader, initHeader, updateActiveNav } from './components/header.js';
import { renderPlayer, initPlayer } from './components/player.js';
import { renderFooter } from './components/footer.js';
import { renderHomePage } from './pages/home.js';
import { renderArticlePage } from './pages/article.js';
import { renderCategoryPage } from './pages/category.js';
import { renderContactPage } from './pages/contact.js';

// App container
const app = document.getElementById('app');

// Content container (will be created after initial render)
let contentEl;

/**
 * Render persistent shell (header + player + content container + footer)
 */
function renderShell() {
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
 * Initialize the router with all routes
 */
function initRouter() {
  const router = new Router([
    {
      path: '/',
      render: () => {
        document.title = 'Radio Nova — Noticias de Paso de los Libres y la región';
        renderHomePage(contentEl);
        updateActiveNav();
      },
    },
    {
      path: '/noticia/:slug',
      render: (params) => {
        renderArticlePage(contentEl, params);
        updateActiveNav();
      },
    },
    {
      path: '/categoria/:category',
      render: (params) => {
        renderCategoryPage(contentEl, params);
        updateActiveNav();
      },
    },
    {
      path: '/contacto',
      render: () => {
        renderContactPage(contentEl);
        updateActiveNav();
      },
    },
  ]);

  // Initial render
  router.resolve();
}

// Boot the app
renderShell();
initRouter();
