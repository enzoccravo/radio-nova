import newsData from '../data/news.js';
import { renderFeaturedGrid, renderNewsCard } from '../components/news-card.js';
import { renderSidebar, initWeather } from '../components/sidebar.js';
import { icons } from '../utils.js';

/**
 * Render the home page
 */
export function renderHomePage(contentEl) {
  // First 3 articles go into the featured grid, rest into the news grid
  const featuredArticles = newsData.slice(0, 3);
  const rest = newsData.slice(3);

  contentEl.innerHTML = `
    <main class="main-content">
      <div class="container">
        ${renderFeaturedGrid(featuredArticles)}

        <!-- Ad Banner -->
        <div class="ad-space ad-space-horizontal" id="ad-top">
          <div class="ad-placeholder">
            ${icons.ad}
            <span>Espacio publicitario</span>
          </div>
        </div>

        <div class="content-grid">
          <div class="content-main">
            <div class="section-header">
              <h2 class="section-title">Últimas Noticias</h2>
            </div>
            <div class="news-grid">
              ${rest.map((article, i) => renderNewsCard(article, i)).join('')}
            </div>
          </div>

          ${renderSidebar()}
        </div>
      </div>
    </main>
  `;

  // Initialize weather widget
  initWeather();
}

