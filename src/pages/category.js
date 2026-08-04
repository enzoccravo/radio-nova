import newsData from '../data/news.js';
import { renderNewsCard } from '../components/news-card.js';
import { renderSidebar, initWeather } from '../components/sidebar.js';
import { getCategoryColor } from '../utils.js';

const categoryNames = {
  locales: 'Locales',
  politica: 'Política',
  deportes: 'Deportes',
  economia: 'Economía',
  cultura: 'Cultura',
  policiales: 'Policiales',
};

const categoryDescriptions = {
  locales: 'Todas las noticias de Paso de los Libres y la región.',
  politica: 'Noticias de política provincial, nacional e internacional.',
  deportes: 'Cobertura deportiva regional y nacional.',
  economia: 'Información económica, producción y comercio de la zona.',
  cultura: 'Cultura, espectáculos y eventos en la región.',
  policiales: 'Noticias policiales, seguridad y justicia.',
};

/**
 * Render the category page
 */
export function renderCategoryPage(contentEl, params) {
  const category = params.category;
  const categoryLabel = categoryNames[category] || category;
  const categoryDesc = categoryDescriptions[category] || '';
  const articles = newsData.filter(n => n.category === category);

  document.title = `${categoryLabel} — Radio Nova`;

  contentEl.innerHTML = `
    <main class="main-content">
      <div class="container">
        <div class="category-page animate-fade-in">
          <div class="category-header">
            <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2);">
              <div style="width: 6px; height: 36px; background: ${getCategoryColor(category)}; border-radius: 3px;"></div>
              <h1 class="category-title">${categoryLabel}</h1>
            </div>
            <p class="category-desc">${categoryDesc}</p>
          </div>

          ${articles.length > 0 ? `
            <div class="content-grid">
              <div class="content-main">
                <div class="news-grid news-grid-2">
                  ${articles.map((article, i) => renderNewsCard(article, i)).join('')}
                </div>
              </div>
              ${renderSidebar()}
            </div>
          ` : `
            <div style="text-align: center; padding: var(--space-16) 0;">
              <p style="font-size: var(--text-xl); color: var(--color-text-muted);">
                No hay noticias en esta categoría por el momento.
              </p>
              <a href="/" data-link style="margin-top: var(--space-4); display: inline-block; font-weight: var(--weight-semibold);">
                ← Volver al inicio
              </a>
            </div>
          `}
        </div>
      </div>
    </main>
  `;

  if (articles.length > 0) {
    initWeather();
  }
}
