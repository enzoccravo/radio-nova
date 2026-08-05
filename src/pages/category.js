import { getArticlesByCategory } from '../data/news.js';
import { renderNewsCard } from '../components/news-card.js';
import { renderSidebar, initWeather } from '../components/sidebar.js';
import { getCategoryColor, icons } from '../utils.js';
import { fetchCategories } from '../lib/supabase.js';

/**
 * Render the category page
 */
export async function renderCategoryPage(contentEl, params) {
  const category = params.category;

  // Show loading
  contentEl.innerHTML = `
    <main class="main-content">
      <div class="container">
        <p style="color: var(--color-text-muted); padding: var(--space-8) 0;">Cargando noticias...</p>
      </div>
    </main>
  `;

  try {
    // Get categories from Supabase for labels/descriptions
    const categories = await fetchCategories();
    const catData = categories.find(c => c.slug === category);
    const categoryLabel = catData?.label || category;

    const articles = await getArticlesByCategory(category);

    document.title = `${categoryLabel} — Radio Nova`;

    contentEl.innerHTML = `
      <main class="main-content">
        <div class="container">
          <div class="category-header animate-fade-in" style="margin-bottom: var(--space-8);">
            <div style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4);">
              <a href="/" data-link class="article-back" style="margin-bottom: 0;">
                ${icons.arrowLeft}
              </a>
              <h1 style="font-family: var(--font-heading); font-size: var(--text-3xl); font-weight: var(--weight-extrabold);">
                <span style="display: inline-block; width: 4px; height: 28px; background: ${getCategoryColor(category)}; border-radius: 2px; margin-right: var(--space-3); vertical-align: middle;"></span>
                ${categoryLabel}
              </h1>
            </div>
          </div>

          <div class="content-grid">
            <div class="content-main">
              ${articles.length > 0 ? `
                <div class="news-grid">
                  ${articles.map((article, i) => renderNewsCard(article, i)).join('')}
                </div>
              ` : `
                <p style="color: var(--color-text-muted); padding: var(--space-8) 0;">No hay noticias en esta categoría por el momento.</p>
              `}
            </div>

            ${await renderSidebar()}
          </div>
        </div>
      </main>
    `;

    initWeather();
  } catch (err) {
    contentEl.innerHTML = `
      <main class="main-content">
        <div class="container">
          <p style="color: #dc2626; padding: var(--space-8) 0;">Error al cargar las noticias.</p>
        </div>
      </main>
    `;
  }
}
