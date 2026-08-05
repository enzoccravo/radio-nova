import { getArticleBySlug, getArticlesByCategory } from '../data/news.js';
import { formatDate, getCategoryClass, getCategoryColor, icons } from '../utils.js';

/**
 * Render the article page
 */
export async function renderArticlePage(contentEl, params) {
  // Show loading
  contentEl.innerHTML = `
    <main class="main-content">
      <div class="container">
        <p style="color: var(--color-text-muted); padding: var(--space-8) 0;">Cargando nota...</p>
      </div>
    </main>
  `;

  const article = await getArticleBySlug(params.slug);

  if (!article) {
    contentEl.innerHTML = `
      <main class="main-content">
        <div class="container">
          <div class="article-page">
            <a href="/" data-link class="article-back">
              ${icons.arrowLeft}
              <span>Volver al inicio</span>
            </a>
            <h1 style="font-size: var(--text-3xl); margin-top: var(--space-8);">Nota no encontrada</h1>
            <p style="color: var(--color-text-secondary); margin-top: var(--space-4);">
              La nota que buscás no existe o fue removida.
            </p>
          </div>
        </div>
      </main>
    `;
    return;
  }

  // Build body HTML — handle both HTML (from Quill) and plain text (legacy)
  let bodyHtml;
  if (article.body.includes('<')) {
    // Already HTML from Quill editor
    bodyHtml = article.body;
  } else {
    // Legacy plain text format
    bodyHtml = article.body
      .split('\n\n')
      .map(p => `<p>${p.trim()}</p>`)
      .join('');
  }

  // Get related articles (same category, different article)
  const categoryArticles = await getArticlesByCategory(article.category);
  const related = categoryArticles
    .filter(n => n.id !== article.id)
    .slice(0, 3);

  contentEl.innerHTML = `
    <main class="main-content">
      <div class="container">
        <div class="content-grid">
          <div class="content-main">
            <article class="article-page animate-fade-in" id="article-${article.id}" style="max-width: none; margin: 0; padding-top: 0; padding-left: 0; padding-right: 0;">
              <a href="/" data-link class="article-back">
                ${icons.arrowLeft}
                <span>Volver al inicio</span>
              </a>

              <header class="article-header">
                <span class="article-category ${getCategoryClass(article.category)}" style="background: ${getCategoryColor(article.category)}">
                  ${article.category_label || article.category}
                </span>
                <h1 class="article-title">${article.title}</h1>
                <p class="article-subtitle">${article.excerpt || article.subtitle || ''}</p>
                <div class="article-meta">
                  ${icons.clock}
                  <span>${formatDate(article.created_at?.split('T')[0] || article.date || '')}</span>
                  <span>·</span>
                  <span>${article.author}</span>
                </div>
              </header>

              ${article.image ? `
                <div class="article-image">
                  <img src="${article.image}" alt="${article.title}" />
                </div>
              ` : ''}

              <div class="article-body">
                ${bodyHtml}
              </div>

              <div class="article-share">
                <span>Compartir:</span>
                <button class="share-btn" title="Compartir en Facebook" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank')">
                  ${icons.facebook}
                </button>
                <button class="share-btn" title="Compartir en Twitter / X" onclick="window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent('${article.title.replace(/'/g, "\\'")}'), '_blank')">
                  ${icons.twitter}
                </button>
                <button class="share-btn" title="Compartir por WhatsApp" onclick="window.open('https://wa.me/?text=' + encodeURIComponent('${article.title.replace(/'/g, "\\'")} ' + window.location.href), '_blank')">
                  ${icons.whatsapp}
                </button>
                <button class="share-btn" title="Compartir por email" onclick="window.open('mailto:?subject=' + encodeURIComponent('${article.title.replace(/'/g, "\\'")}') + '&body=' + encodeURIComponent(window.location.href))">
                  ${icons.mail}
                </button>
              </div>
            </article>

            ${related.length > 0 ? `
              <div class="article-page" style="max-width: none; margin: 0; padding-left: 0; padding-right: 0; padding-top: var(--space-8);">
                <div class="section-header">
                  <h2 class="section-title">Notas relacionadas</h2>
                </div>
                <div class="news-grid news-grid-2">
                  ${related.map((r, i) => `
                    <a href="/noticia/${r.slug}" data-link class="recent-news-item" style="text-decoration: none; color: inherit; flex-direction: column; gap: var(--space-3);">
                      <div style="width: 100%; aspect-ratio: 16/10; border-radius: var(--radius-lg); overflow: hidden;">
                        <img src="${r.image}" alt="${r.title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                      </div>
                      <div class="recent-news-info">
                        <span class="recent-news-cat" style="color: ${getCategoryColor(r.category)}">${r.category_label || r.category}</span>
                        <span class="recent-news-title" style="-webkit-line-clamp: 3;">${r.title}</span>
                        <span class="recent-news-date">${formatDate(r.created_at?.split('T')[0] || r.date || '')}</span>
                      </div>
                    </a>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <aside class="sidebar" style="position: sticky; top: calc(var(--header-height) + var(--player-height) + 2rem); height: max-content;">
            <div class="promo-space promo-space-vertical" style="height: 600px;">
              <div class="ad-placeholder">
                ${icons.ad}
                <span>Espacio publicitario</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  `;

  // Update page title
  document.title = `${article.title} — Radio Nova`;
}
