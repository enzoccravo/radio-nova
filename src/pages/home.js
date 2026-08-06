import { getArticles } from '../data/news.js';
import { renderFeaturedGrid, renderNewsCard } from '../components/news-card.js';
import { renderSidebar, initWeather } from '../components/sidebar.js';
import { getAdSlot, renderAdContent } from '../lib/ads.js';
import { icons } from '../utils.js';

/**
 * Render the home page
 */
export async function renderHomePage(contentEl) {
  // Show loading skeleton
  contentEl.innerHTML = `
    <main class="main-content">
      <div class="container">
        <p style="color: var(--color-text-muted); padding: var(--space-8) 0;">Cargando noticias...</p>
      </div>
    </main>
  `;

  try {
    const newsData = await getArticles();

    // Get featured articles. Put the one marked 'is_main_featured' first.
    const featured = newsData.filter(n => n.featured);
    let featuredArticles = [];
    
    if (featured.length >= 3) {
      featuredArticles = featured
        .sort((a, b) => (b.is_main_featured ? 1 : 0) - (a.is_main_featured ? 1 : 0))
        .slice(0, 3);
    } else {
      featuredArticles = newsData
        .slice(0, 3)
        .sort((a, b) => (b.is_main_featured ? 1 : 0) - (a.is_main_featured ? 1 : 0));
    }
    
    const featuredIds = new Set(featuredArticles.map(a => a.id));
    const rest = newsData.filter(n => !featuredIds.has(n.id));

    const bannerSlot = await getAdSlot('banner_top');
    const bannerContent = renderAdContent(bannerSlot);

    contentEl.innerHTML = `
      <main class="main-content">
        <div class="container">
          ${renderFeaturedGrid(featuredArticles)}

          ${bannerContent ? `
            <!-- Ad Banner -->
            <div class="promo-space promo-space-horizontal" id="promo-top">
              ${bannerContent}
            </div>
          ` : ''}

          <div class="content-grid">
            <div class="content-main">
              <div class="section-header">
                <h2 class="section-title">Últimas Noticias</h2>
              </div>
              <div class="news-grid">
                ${rest.map((article, i) => renderNewsCard(article, i)).join('')}
              </div>
              ${rest.length === 0 ? '<p style="color: var(--color-text-muted);">No hay más noticias por el momento.</p>' : ''}
            </div>

            ${await renderSidebar()}
          </div>
        </div>
      </main>
    `;

    // Initialize weather widget
    initWeather();
  } catch (err) {
    contentEl.innerHTML = `
      <main class="main-content">
        <div class="container">
          <p style="color: #dc2626; padding: var(--space-8) 0;">Error al cargar las noticias. Intentá de nuevo más tarde.</p>
        </div>
      </main>
    `;
  }
}
