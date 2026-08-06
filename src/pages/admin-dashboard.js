import { adminFetchArticles, deleteArticle, toggleFeatured, logout, fetchCategories } from '../lib/supabase.js';
import { formatDate } from '../utils.js';

let currentFilter = 'all';
let currentStatusFilter = 'all';

/**
 * Show a toast notification
 */
function showToast(message, type = 'success') {
  // Remove existing toasts
  document.querySelectorAll('.admin-toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Show a confirmation dialog
 */
function showConfirm(title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'admin-confirm-overlay';
    overlay.innerHTML = `
      <div class="admin-confirm-dialog animate-fade-in">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="admin-confirm-actions">
          <button class="btn btn-ghost" id="confirm-cancel">Cancelar</button>
          <button class="btn btn-danger" id="confirm-ok">Eliminar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#confirm-cancel').addEventListener('click', () => {
      overlay.remove();
      resolve(false);
    });
    overlay.querySelector('#confirm-ok').addEventListener('click', () => {
      overlay.remove();
      resolve(true);
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve(false);
      }
    });
  });
}

/**
 * Render the admin dashboard page
 */
export async function renderAdminDashboardPage(contentEl) {
  document.title = 'Panel Admin — Radio Nova';

  // Show loading
  contentEl.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Noticias</h1>
      </div>
      <p style="color: var(--color-text-muted);">Cargando noticias...</p>
    </div>
  `;

  try {
    const [articles, categories] = await Promise.all([
      adminFetchArticles(),
      fetchCategories()
    ]);

    renderDashboardContent(contentEl, articles, categories);
  } catch (err) {
    contentEl.innerHTML = `
      <div class="admin-content">
        <div class="admin-header">
          <h1>Error</h1>
        </div>
        <p style="color: #dc2626;">No se pudieron cargar las noticias: ${err.message}</p>
      </div>
    `;
  }
}

function renderDashboardContent(contentEl, articles, categories) {
  currentFilter = 'all';
  currentStatusFilter = 'all';

  contentEl.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Noticias</h1>
        <div style="display: flex; gap: var(--space-3);">
          <a href="/admin/anuncios" data-link class="btn btn-ghost">
            📢 Anuncios
          </a>
          <a href="/admin/nueva" data-link class="btn btn-primary">
            + Nueva noticia
          </a>
        </div>
      </div>

      <div class="admin-filters" id="admin-filters">
        <button class="admin-filter-btn active" data-filter="all">Todas</button>
        <button class="admin-filter-btn" data-filter="status:published">Publicadas</button>
        <button class="admin-filter-btn" data-filter="status:draft">Borradores</button>
        <span style="width: 1px; background: var(--color-border); margin: 0 var(--space-2);"></span>
        ${categories.map(c => `
          <button class="admin-filter-btn" data-filter="cat:${c.slug}">${c.label}</button>
        `).join('')}
      </div>

      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th style="text-align: center;">Destaque</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="articles-tbody">
            ${renderTableRows(articles)}
          </tbody>
        </table>
      </div>

      ${articles.length === 0 ? `
        <div class="admin-empty">
          <h3>No hay noticias todavía</h3>
          <p>Creá tu primera noticia para comenzar.</p>
        </div>
      ` : ''}
    </div>
  `;

  // Filter buttons
  const filtersEl = document.getElementById('admin-filters');
  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.admin-filter-btn');
    if (!btn) return;

    const filter = btn.dataset.filter;

    if (filter.startsWith('status:')) {
      currentStatusFilter = filter === currentStatusFilter ? 'all' : filter;
    } else if (filter.startsWith('cat:')) {
      currentFilter = filter === currentFilter ? 'all' : filter;
    } else {
      currentFilter = 'all';
      currentStatusFilter = 'all';
    }

    // Update active state
    filtersEl.querySelectorAll('.admin-filter-btn').forEach(b => {
      const f = b.dataset.filter;
      if (f === 'all') {
        b.classList.toggle('active', currentFilter === 'all' && currentStatusFilter === 'all');
      } else if (f.startsWith('status:')) {
        b.classList.toggle('active', f === currentStatusFilter);
      } else if (f.startsWith('cat:')) {
        b.classList.toggle('active', f === currentFilter);
      }
    });

    filterTable(articles);
  });

  // Table actions (event delegation)
  const tbody = document.getElementById('articles-tbody');
  tbody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');
    const featuredBtn = e.target.closest('.admin-featured-toggle');
    const mainBtn = e.target.closest('.btn-main');

    if (editBtn) {
      const id = editBtn.dataset.id;
      window.history.pushState(null, '', `/admin/editar/${id}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }

    if (mainBtn) {
      const id = mainBtn.dataset.id;
      try {
        const { setMainFeatured } = await import('../lib/supabase.js');
        await setMainFeatured(id);

        // update local state
        articles.forEach(a => {
          if (a.id === id) {
            a.is_main_featured = true;
            a.featured = true;
          } else {
            a.is_main_featured = false;
          }
        });
        filterTable(articles);
        showToast('Noticia promovida a principal');
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      const title = deleteBtn.dataset.title;
      const confirmed = await showConfirm(
        '¿Eliminar noticia?',
        `Se eliminará "${title}" de forma permanente.`
      );
      if (confirmed) {
        try {
          await deleteArticle(id);
          // Remove from local array and re-render
          const idx = articles.findIndex(a => a.id === id);
          if (idx !== -1) articles.splice(idx, 1);
          tbody.innerHTML = renderTableRows(filterArticles(articles));
          showToast('Noticia eliminada');
        } catch (err) {
          showToast('Error al eliminar: ' + err.message, 'error');
        }
      }
    }

    if (featuredBtn) {
      const id = featuredBtn.dataset.id;
      const article = articles.find(a => a.id === id);
      if (article) {
        const newVal = !article.featured;
        
        if (newVal) {
          const featuredCount = articles.filter(a => a.featured).length;
          if (featuredCount >= 3) {
            showToast('No podés destacar más de 3 noticias a la vez.', 'error');
            return;
          }
        }
        
        try {
          await toggleFeatured(id, newVal);
          article.featured = newVal;
          filterTable(articles); // Re-render table to show/hide the crown
          showToast(newVal ? 'Marcada como destacada' : 'Quitada de destacadas');
        } catch (err) {
          showToast('Error: ' + err.message, 'error');
        }
      }
    }
  });
}

function filterArticles(articles) {
  return articles.filter(a => {
    if (currentStatusFilter === 'status:published' && !a.published) return false;
    if (currentStatusFilter === 'status:draft' && a.published) return false;
    if (currentFilter !== 'all' && currentFilter.startsWith('cat:')) {
      if (a.category !== currentFilter.replace('cat:', '')) return false;
    }
    return true;
  });
}

function filterTable(articles) {
  const filtered = filterArticles(articles);
  const tbody = document.getElementById('articles-tbody');
  tbody.innerHTML = renderTableRows(filtered);
}

function renderTableRows(articles) {
  if (articles.length === 0) {
    return `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted); padding: var(--space-8);">No hay noticias con estos filtros.</td></tr>`;
  }

  return articles.map(article => `
    <tr>
      <td class="admin-article-title">${article.title}</td>
      <td>
        <span style="font-size: var(--text-xs); font-weight: var(--weight-medium);">
          ${article.category}
        </span>
      </td>
      <td>
        <span class="admin-status ${article.published ? 'admin-status-published' : 'admin-status-draft'}">
          <span class="admin-status-dot"></span>
          ${article.published ? 'Publicada' : 'Borrador'}
        </span>
      </td>
      <td style="white-space: nowrap; color: var(--color-text-muted);">
        ${formatDate(article.created_at?.split('T')[0] || '')}
      </td>
      <td style="text-align: center; white-space: nowrap;">
        <button class="admin-featured-toggle ${article.featured ? 'active' : ''}" data-id="${article.id}" style="background: none; border: none; cursor: pointer; padding: 0 4px; font-size: 1rem;">
          ${article.featured ? '⭐' : '☆'}
        </button>
        ${article.featured ? `
          <button class="btn-main" data-id="${article.id}" title="Marcar como Principal" style="background: none; border: none; cursor: pointer; padding: 0 4px; font-size: 1rem; opacity: ${article.is_main_featured ? '1' : '0.2'};">
            👑
          </button>
        ` : `
          <span style="display: inline-block; width: 24px; padding: 0 4px;"></span>
        `}
      </td>
      <td>
        <div class="admin-actions">
          <button class="btn btn-ghost btn-sm btn-edit" data-id="${article.id}">Editar</button>
          <button class="btn btn-ghost btn-sm btn-delete" data-id="${article.id}" data-title="${article.title.replace(/"/g, '&quot;')}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}
