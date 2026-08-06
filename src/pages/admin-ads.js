import { fetchAdSlots, updateAdSlot } from '../lib/supabase.js';
import { invalidateAdCache } from '../lib/ads.js';

/**
 * Show a toast notification
 */
function showToast(message, type = 'success') {
  document.querySelectorAll('.admin-toast').forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Render the admin ads management page
 */
export async function renderAdminAdsPage(contentEl) {
  document.title = 'Anuncios — Radio Nova Admin';

  contentEl.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Anuncios</h1>
        <a href="/admin" data-link class="btn btn-ghost">← Volver al panel</a>
      </div>
      <p style="color: var(--color-text-muted);">Cargando espacios publicitarios...</p>
    </div>
  `;

  try {
    const slots = await fetchAdSlots();
    renderAdsContent(contentEl, slots);
  } catch (err) {
    contentEl.innerHTML = `
      <div class="admin-content">
        <div class="admin-header">
          <h1>Error</h1>
        </div>
        <p style="color: #dc2626;">No se pudieron cargar los anuncios: ${err.message}</p>
      </div>
    `;
  }
}

function renderAdsContent(contentEl, slots) {
  contentEl.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Anuncios</h1>
        <a href="/admin" data-link class="btn btn-ghost">← Volver al panel</a>
      </div>

      <p style="color: var(--color-text-muted); margin-bottom: var(--space-6);">
        Gestioná los 3 espacios publicitarios del sitio. Cada espacio puede mostrar una imagen con link o un código HTML personalizado.
      </p>

      <div class="ads-slots-grid">
        ${slots.map(slot => renderSlotCard(slot)).join('')}
      </div>
    </div>
  `;

  // Bind events
  slots.forEach(slot => {
    bindSlotEvents(slot, slots);
  });
}

function renderSlotCard(slot) {
  const isImage = slot.mode === 'image';

  return `
    <div class="ads-slot-card" id="slot-${slot.id}">
      <div class="ads-slot-header">
        <div class="ads-slot-info">
          <h3>${slot.label}</h3>
          <span class="ads-slot-id">${slot.id}</span>
        </div>
        <label class="ads-toggle">
          <input type="checkbox" id="toggle-${slot.id}" ${slot.active ? 'checked' : ''} />
          <span class="ads-toggle-slider"></span>
          <span class="ads-toggle-label">${slot.active ? 'Activo' : 'Inactivo'}</span>
        </label>
      </div>

      <div class="ads-slot-body">
        <!-- Mode selector -->
        <div class="ads-mode-selector">
          <button class="ads-mode-btn ${isImage ? 'active' : ''}" data-slot="${slot.id}" data-mode="image">
            🖼️ Imagen + Link
          </button>
          <button class="ads-mode-btn ${!isImage ? 'active' : ''}" data-slot="${slot.id}" data-mode="html">
            &lt;/&gt; Código HTML
          </button>
        </div>

        <!-- Image mode fields -->
        <div class="ads-mode-panel" id="panel-image-${slot.id}" style="display: ${isImage ? 'block' : 'none'};">
          <div class="admin-field">
            <label>URL de la imagen</label>
            <input type="text" id="image-url-${slot.id}" placeholder="https://images.unsplash.com/..." value="${(slot.image_url || '').replace(/"/g, '&quot;')}" />
          </div>
          <div class="admin-field">
            <label>Link de destino (al hacer clic)</label>
            <input type="text" id="link-url-${slot.id}" placeholder="https://ejemplo.com" value="${(slot.link_url || '').replace(/"/g, '&quot;')}" />
          </div>
          ${slot.image_url ? `
            <div class="ads-image-preview">
              <img src="${slot.image_url}" alt="Preview" />
            </div>
          ` : ''}
        </div>

        <!-- HTML mode fields -->
        <div class="ads-mode-panel" id="panel-html-${slot.id}" style="display: ${!isImage ? 'block' : 'none'};">
          <div class="admin-field">
            <label>Código HTML del anuncio</label>
            <textarea id="html-code-${slot.id}" rows="6" placeholder="Pegá acá el código HTML del anuncio (Google Ads, etc.)">${slot.html_code || ''}</textarea>
          </div>
        </div>
      </div>

      <div class="ads-slot-footer">
        <button class="btn btn-primary btn-sm" id="save-${slot.id}">Guardar cambios</button>
        <span class="ads-slot-updated" id="updated-${slot.id}">
          ${slot.updated_at ? `Actualizado: ${new Date(slot.updated_at).toLocaleDateString('es-AR')}` : ''}
        </span>
      </div>
    </div>
  `;
}

function bindSlotEvents(slot, allSlots) {
  const card = document.getElementById(`slot-${slot.id}`);
  if (!card) return;

  // Toggle active
  const toggle = card.querySelector(`#toggle-${slot.id}`);
  toggle.addEventListener('change', () => {
    const label = toggle.closest('.ads-toggle').querySelector('.ads-toggle-label');
    label.textContent = toggle.checked ? 'Activo' : 'Inactivo';
  });

  // Mode buttons
  card.querySelectorAll('.ads-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      card.querySelectorAll('.ads-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      card.querySelector(`#panel-image-${slot.id}`).style.display = mode === 'image' ? 'block' : 'none';
      card.querySelector(`#panel-html-${slot.id}`).style.display = mode === 'html' ? 'block' : 'none';
    });
  });

  // Image URL preview
  const imageInput = card.querySelector(`#image-url-${slot.id}`);
  imageInput.addEventListener('input', debounce(() => {
    const url = imageInput.value.trim();
    const previewContainer = card.querySelector('.ads-image-preview');
    if (url) {
      if (previewContainer) {
        previewContainer.innerHTML = `<img src="${url}" alt="Preview" />`;
      } else {
        const panel = card.querySelector(`#panel-image-${slot.id}`);
        const div = document.createElement('div');
        div.className = 'ads-image-preview';
        div.innerHTML = `<img src="${url}" alt="Preview" />`;
        panel.appendChild(div);
      }
    } else if (previewContainer) {
      previewContainer.remove();
    }
  }, 500));

  // Save button
  card.querySelector(`#save-${slot.id}`).addEventListener('click', async () => {
    const activeMode = card.querySelector('.ads-mode-btn.active').dataset.mode;
    const updates = {
      active: toggle.checked,
      mode: activeMode,
      image_url: card.querySelector(`#image-url-${slot.id}`).value.trim(),
      link_url: card.querySelector(`#link-url-${slot.id}`).value.trim(),
      html_code: card.querySelector(`#html-code-${slot.id}`).value.trim(),
    };

    try {
      const saved = await updateAdSlot(slot.id, updates);
      // Update local reference
      Object.assign(slot, saved);
      invalidateAdCache();
      card.querySelector(`#updated-${slot.id}`).textContent =
        `Actualizado: ${new Date(saved.updated_at).toLocaleDateString('es-AR')}`;
      showToast(`"${slot.label}" guardado correctamente`);
    } catch (err) {
      showToast('Error al guardar: ' + err.message, 'error');
    }
  });
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
