import { formatDate, getCategoryClass, getCategoryColor, icons } from '../utils.js';

/**
 * Render a news card
 */
export function renderNewsCard(article, index = 0) {
  return `
    <article class="news-card animate-fade-in-up" style="animation-delay: ${index * 0.08}s" id="card-${article.id}">
      <a href="/noticia/${article.slug}" data-link class="news-card-link" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
        <div class="news-card-image">
          <img
            src="${article.image}"
            alt="${article.title}"
            loading="lazy"
          />
          <span class="news-card-badge ${getCategoryClass(article.category)}">${article.category_label || article.category}</span>
        </div>
        <div class="news-card-body">
          <span class="news-card-subtitle">${article.subtitle}</span>
          <h3 class="news-card-title">${article.title}</h3>
          <p class="news-card-excerpt">${article.excerpt}</p>
          <div class="news-card-meta">
            ${icons.clock}
            <span>${formatDate(article.created_at?.split('T')[0] || article.date || '')}</span>
            <span>·</span>
            <span>${article.author}</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

/**
 * Render the featured grid section (1 main + 2 secondary)
 * Easy to make admin-configurable later — just change which articles are passed in.
 */
export function renderFeaturedGrid(articles) {
  if (!articles || articles.length === 0) return '';

  const main = articles[0];
  const secondary = articles.slice(1, 3);

  return `
    <section class="featured-section animate-fade-in" id="featured-section">
      <div class="featured-grid">
        <!-- Main featured article -->
        <a href="/noticia/${main.slug}" data-link class="featured-main" style="text-decoration: none; color: inherit;">
          <div class="featured-main-image">
            <img src="${main.image}" alt="${main.title}" />
          </div>
          <div class="featured-main-overlay"></div>
          <div class="featured-main-content">
            <span class="featured-badge" style="background: ${getCategoryColor(main.category)}">
              ${main.category_label || main.category}
            </span>
            <p class="featured-main-subtitle">${main.subtitle || ''}</p>
            <h2 class="featured-main-title">${main.title}</h2>
            <div class="featured-meta">
              ${icons.clock}
              <span>${formatDate(main.created_at?.split('T')[0] || main.date || '')}</span>
            </div>
          </div>
        </a>

        <!-- Secondary articles stacked -->
        <div class="featured-secondary">
          ${secondary.map(article => `
            <a href="/noticia/${article.slug}" data-link class="featured-secondary-card" style="text-decoration: none; color: inherit;">
              <div class="featured-secondary-image">
                <img src="${article.image}" alt="${article.title}" />
              </div>
              <div class="featured-secondary-overlay"></div>
              <div class="featured-secondary-content">
                <span class="featured-badge" style="background: ${getCategoryColor(article.category)}">
                  ${article.category_label || article.category}
                </span>
                <h3 class="featured-secondary-title">${article.title}</h3>
                <div class="featured-meta">
                  ${icons.clock}
                  <span>${formatDate(article.created_at?.split('T')[0] || article.date || '')}</span>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

