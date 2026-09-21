import { adminFetchArticleById, saveArticle, fetchCategories, createCategory, generateSlug } from '../lib/supabase.js';
import { uploadAndCompressImage } from '../lib/cloudinary.js';

let quillInstance = null;

/**
 * Show a toast notification
 *//** Add minimal spinner styles to head if not present */
if (!document.getElementById('admin-spinner-css')) {
  const style = document.createElement('style');
  style.id = 'admin-spinner-css';
  style.innerHTML = `
    .btn-loading { opacity: 0.7; pointer-events: none; position: relative; }
    .btn-loading::after { content: " ⏳"; }
  `;
  document.head.appendChild(style);
}

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
 * Render the admin editor page (create or edit)
 */
export async function renderAdminEditorPage(contentEl, params = {}) {
  const isEdit = !!params.id;

  document.title = isEdit ? 'Editar noticia — Radio Nova Admin' : 'Nueva noticia — Radio Nova Admin';

  // Show loading
  contentEl.innerHTML = `
    <div class="admin-content">
      <p style="color: var(--color-text-muted);">Cargando editor...</p>
    </div>
  `;

  let article = null;
  let categories = [];

  try {
    categories = await fetchCategories();

    if (isEdit) {
      article = await adminFetchArticleById(params.id);
      if (!article) {
        contentEl.innerHTML = `
          <div class="admin-content">
            <h1>Noticia no encontrada</h1>
            <a href="/admin" data-link class="btn btn-ghost" style="margin-top: var(--space-4);">← Volver al panel</a>
          </div>
        `;
        return;
      }
    }
  } catch (err) {
    contentEl.innerHTML = `
      <div class="admin-content">
        <p style="color: #dc2626;">Error: ${err.message}</p>
      </div>
    `;
    return;
  }

  renderEditorContent(contentEl, article, categories, isEdit);
}

function renderEditorContent(contentEl, article, categories, isEdit) {
  const selectedCategory = article?.category || '';
  const selectedCategoryLabel = categories.find(c => c.slug === selectedCategory)?.label || '';

  contentEl.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>${isEdit ? 'Editar noticia' : 'Nueva noticia'}</h1>
        <a href="/admin" data-link class="btn btn-ghost">← Volver al panel</a>
      </div>

      <div class="admin-editor">
        <div class="admin-editor-main">
          <!-- Categoría -->
          <div class="admin-field" style="position: relative; z-index: 10;">
            <label>Categoría</label>
            <div class="category-combobox" id="category-combobox">
              <input
                type="text"
                class="category-combobox-input"
                id="category-input"
                placeholder="Buscar o crear categoría..."
                value="${selectedCategoryLabel}"
                autocomplete="off"
              />
              <input type="hidden" id="category-slug" value="${selectedCategory}" />
              <div class="category-combobox-dropdown" id="category-dropdown"></div>
            </div>
          </div>

          <!-- Volanta / Subtítulo -->
          <div class="admin-field">
            <label for="editor-subtitle">Volanta (texto arriba del título)</label>
            <input type="text" id="editor-subtitle" placeholder="Breve texto para categorizar (ej: Política regional)" value="${(article?.subtitle || '').replace(/"/g, '&quot;')}" />
          </div>

          <!-- Título -->
          <div class="admin-field">
            <label for="editor-title">Título</label>
            <input type="text" id="editor-title" placeholder="Título principal de la noticia" value="${(article?.title || '').replace(/"/g, '&quot;')}" />
          </div>

          <!-- Excerpt -->
          <div class="admin-field">
            <label for="editor-excerpt">Resumen (aparecerá debajo del título como subtítulo principal)</label>
            <textarea id="editor-excerpt" placeholder="Resumen breve para el listado y debajo del título." rows="3">${article?.excerpt || ''}</textarea>
          </div>

          <!-- Contenido -->
          <div class="admin-field" style="z-index: 1;">
            <label>Contenido</label>
            <div id="editor-quill"></div>
          </div>
        </div>

        <div class="admin-editor-sidebar">
          <!-- Publish Panel -->
          <div class="admin-editor-panel">
            <h3>Publicación</h3>
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              <button class="btn btn-success" id="btn-publish" style="width: 100%;">
                ${isEdit && article?.published ? 'Actualizar' : 'Publicar'}
              </button>
              <button class="btn btn-ghost" id="btn-draft" style="width: 100%;">
                Guardar borrador
              </button>
            </div>
          </div>


          <!-- Author Panel -->
          <div class="admin-editor-panel">
            <h3>Autor</h3>
            <div class="admin-field" style="margin-bottom: 0;">
              <input type="text" id="editor-author" placeholder="Nombre del autor" value="${(article?.author || 'Redacción Radio Nova').replace(/"/g, '&quot;')}" />
            </div>
          </div>

          <!-- Image Panel -->
          <div class="admin-editor-panel">
            <h3>Imagen principal</h3>
            <div class="admin-field" style="margin-bottom: 0; display: flex; flex-direction: column; gap: var(--space-2);">
              <div style="display: flex; gap: var(--space-2);">
                <input type="text" id="editor-image" placeholder="URL de la imagen (o súbela...)" value="${(article?.image || '').replace(/"/g, '&quot;')}" style="flex: 1;" />
                <button type="button" class="btn" id="btn-upload-image" style="white-space: nowrap;">Subir Foto</button>
                <input type="file" id="file-upload-image" accept="image/*" style="display: none;" />
              </div>

              <!-- Focal Point Picker -->
              <div id="focal-point-section" style="display: ${article?.image ? 'block' : 'none'};">
                <div class="focal-point-container" id="focal-point-container">
                  <img id="focal-point-image" src="${article?.image || ''}" alt="Seleccionar punto focal" />
                  <div class="focal-point-crosshair" id="focal-crosshair" style="--fx: ${(article?.image_focal_x ?? 0.5) * 100}%; --fy: ${(article?.image_focal_y ?? 0.5) * 100}%;"></div>
                  <div class="focal-point-marker" id="focal-point-marker" style="left: ${(article?.image_focal_x ?? 0.5) * 100}%; top: ${(article?.image_focal_y ?? 0.5) * 100}%;"></div>
                </div>
                <p class="focal-point-label">Hacé clic en la parte más importante de la imagen</p>
                <input type="hidden" id="editor-focal-x" value="${article?.image_focal_x ?? 0.5}" />
                <input type="hidden" id="editor-focal-y" value="${article?.image_focal_y ?? 0.5}" />

                <!-- Device Previews -->
                <div class="device-previews" id="device-previews">
                  <div class="device-preview">
                    <span class="device-preview-label">🖥 Desktop</span>
                    <div class="device-preview-frame desktop">
                      <img id="preview-desktop" src="" alt="Preview desktop" />
                    </div>
                  </div>
                  <div class="device-preview">
                    <span class="device-preview-label">📱 Tablet</span>
                    <div class="device-preview-frame tablet">
                      <img id="preview-tablet" src="" alt="Preview tablet" />
                    </div>
                  </div>
                  <div class="device-preview">
                    <span class="device-preview-label">📲 Celular</span>
                    <div class="device-preview-frame mobile">
                      <img id="preview-mobile" src="" alt="Preview celular" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  // Initialize Quill
  initQuill(article?.body || '');

  // Image preview, Upload & Focal Point
  const imageInput = document.getElementById('editor-image');
  const btnUpload = document.getElementById('btn-upload-image');
  const fileUpload = document.getElementById('file-upload-image');
  const focalSection = document.getElementById('focal-point-section');
  const focalContainer = document.getElementById('focal-point-container');
  const focalImage = document.getElementById('focal-point-image');
  const focalMarker = document.getElementById('focal-point-marker');
  const focalCrosshair = document.getElementById('focal-crosshair');
  const focalXInput = document.getElementById('editor-focal-x');
  const focalYInput = document.getElementById('editor-focal-y');

  /**
   * Update the focal point position and refresh device previews
   */
  function setFocalPoint(x, y) {
    // Clamp between 0 and 1
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    focalXInput.value = x.toFixed(3);
    focalYInput.value = y.toFixed(3);
    focalMarker.style.left = `${x * 100}%`;
    focalMarker.style.top = `${y * 100}%`;
    focalCrosshair.style.setProperty('--fx', `${x * 100}%`);
    focalCrosshair.style.setProperty('--fy', `${y * 100}%`);

    updateDevicePreviews();
  }

  /**
   * Update the 3 device preview thumbnails using CSS object-position
   */
  function updateDevicePreviews() {
    const url = imageInput.value.trim();
    if (!url) return;

    const fx = parseFloat(focalXInput.value) || 0.5;
    const fy = parseFloat(focalYInput.value) || 0.5;
    const objectPos = `${fx * 100}% ${fy * 100}%`;

    const previewDesktop = document.getElementById('preview-desktop');
    const previewTablet = document.getElementById('preview-tablet');
    const previewMobile = document.getElementById('preview-mobile');

    if (previewDesktop) {
      previewDesktop.src = url;
      previewDesktop.style.objectPosition = objectPos;
    }
    if (previewTablet) {
      previewTablet.src = url;
      previewTablet.style.objectPosition = objectPos;
    }
    if (previewMobile) {
      previewMobile.src = url;
      previewMobile.style.objectPosition = objectPos;
    }
  }

  /**
   * Show focal point section and update everything when image changes
   */
  const updateImageAndFocal = (resetFocal = false) => {
    const url = imageInput.value.trim();
    if (url) {
      focalSection.style.display = 'block';
      focalImage.src = url;
      if (resetFocal) {
        setFocalPoint(0.5, 0.5);
      } else {
        updateDevicePreviews();
      }
    } else {
      focalSection.style.display = 'none';
    }
  };

  // Manual URL paste
  imageInput.addEventListener('input', () => updateImageAndFocal(true));

  // Focal point click handler
  focalContainer.addEventListener('click', (e) => {
    const rect = focalContainer.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setFocalPoint(x, y);
  });

  // Upload button
  btnUpload.addEventListener('click', () => {
    fileUpload.click();
  });

  fileUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    btnUpload.classList.add('btn-loading');
    btnUpload.textContent = 'Subiendo...';
    try {
      const optimizedUrl = await uploadAndCompressImage(file);
      imageInput.value = optimizedUrl;
      updateImageAndFocal(true);
      showToast('Imagen principal subida con éxito');
    } catch (err) {
      showToast('Error subiendo imagen: ' + err.message, 'error');
    } finally {
      btnUpload.classList.remove('btn-loading');
      btnUpload.textContent = 'Subir Foto';
      fileUpload.value = '';
    }
  });

  // Initialize previews if editing an article with an existing image
  if (article?.image) {
    updateDevicePreviews();
  }

  // Category combobox
  initCategoryCombobox(categories);

  // Save actions
  document.getElementById('btn-publish').addEventListener('click', () => handleSave(true, article, isEdit));
  document.getElementById('btn-draft').addEventListener('click', () => handleSave(false, article, isEdit));
}

/**
 * Initialize the Quill rich text editor
 */
async function initQuill(initialContent) {
  // Dynamically import Quill
  const Quill = (await import('quill')).default;

  // Import Quill CSS
  if (!document.getElementById('quill-css')) {
    const link = document.createElement('link');
    link.id = 'quill-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.quilljs.com/2.0.3/quill.snow.css';
    document.head.appendChild(link);
  }

  quillInstance = new Quill('#editor-quill', {
    theme: 'snow',
    placeholder: 'Escribí el contenido de la noticia...',
    modules: {
      toolbar: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'link', 'image'],
        ['clean'],
      ],
    },
  });

  // Custom image handler - upload to Cloudinary
  quillInstance.getModule('toolbar').addHandler('image', () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        showToast('Subiendo imagen para el contenido...', 'info');
        try {
          const url = await uploadAndCompressImage(file);
          const range = quillInstance.getSelection(true);
          quillInstance.insertEmbed(range.index, 'image', url);
          showToast('Imagen insertada en el texto');
        } catch (err) {
          showToast('Error al subir imagen: ' + err.message, 'error');
        }
      }
    };
  });

  // Set initial content if editing
  if (initialContent) {
    quillInstance.root.innerHTML = initialContent;
  }
}

/**
 * Initialize the category combobox (searchable dropdown with create)
 */
function initCategoryCombobox(categories) {
  const input = document.getElementById('category-input');
  const slugInput = document.getElementById('category-slug');
  const dropdown = document.getElementById('category-dropdown');
  let allCategories = [...categories];

  function renderDropdown(filter = '') {
    const filtered = allCategories.filter(c =>
      c.label.toLowerCase().includes(filter.toLowerCase())
    );

    let html = filtered.map(c =>
      `<div class="category-combobox-option" data-slug="${c.slug}" data-label="${c.label}">${c.label}</div>`
    ).join('');

    // Show "create new" option if no exact match
    const exactMatch = allCategories.some(c => c.label.toLowerCase() === filter.toLowerCase());
    if (filter.length > 0 && !exactMatch) {
      const newSlug = generateSlug(filter);
      html += `<div class="category-combobox-option create-new" data-slug="${newSlug}" data-label="${filter}" data-create="true">+ Crear "${filter}"</div>`;
    }

    dropdown.innerHTML = html || '<div class="category-combobox-option" style="color: var(--color-text-muted);">Sin resultados</div>';
  }

  input.addEventListener('focus', () => {
    renderDropdown(input.value);
    dropdown.classList.add('open');
  });

  input.addEventListener('input', () => {
    renderDropdown(input.value);
    dropdown.classList.add('open');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#category-combobox')) {
      dropdown.classList.remove('open');
    }
  });

  // Handle option click
  dropdown.addEventListener('click', async (e) => {
    const option = e.target.closest('.category-combobox-option');
    if (!option || option.style.color) return; // skip "no results"

    const slug = option.dataset.slug;
    const label = option.dataset.label;
    const isCreate = option.dataset.create === 'true';

    if (isCreate) {
      try {
        const newCat = await createCategory(slug, label);
        allCategories.push(newCat);
        showToast(`Categoría "${label}" creada`);
      } catch (err) {
        showToast('Error al crear categoría: ' + err.message, 'error');
        return;
      }
    }

    input.value = label;
    slugInput.value = slug;
    dropdown.classList.remove('open');
  });
}

/**
 * Handle save (publish or draft)
 */
async function handleSave(publish, existingArticle, isEdit) {
  const title = document.getElementById('editor-title').value.trim();
  const subtitle = document.getElementById('editor-subtitle').value.trim();
  const categorySlug = document.getElementById('category-slug').value;
  const author = document.getElementById('editor-author').value.trim();
  const image = document.getElementById('editor-image').value.trim();
  const imageFocalX = parseFloat(document.getElementById('editor-focal-x')?.value) || 0.5;
  const imageFocalY = parseFloat(document.getElementById('editor-focal-y')?.value) || 0.5;
  let excerpt = document.getElementById('editor-excerpt').value.trim();
  const body = quillInstance ? quillInstance.root.innerHTML : '';

  // Validations
  if (!title) {
    showToast('El título es obligatorio.', 'error');
    return;
  }
  if (!categorySlug) {
    showToast('Seleccioná una categoría.', 'error');
    return;
  }

  // Auto-generate excerpt from body text if empty
  if (!excerpt && body) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = body;
    excerpt = tempDiv.textContent.slice(0, 200).trim();
    if (tempDiv.textContent.length > 200) excerpt += '...';
  }

  const slug = isEdit ? existingArticle.slug : generateSlug(title);

  const articleData = {
    slug,
    title,
    subtitle,
    excerpt,
    body,
    image,
    image_focal_x: imageFocalX,
    image_focal_y: imageFocalY,
    category: categorySlug,
    author: author || 'Redacción Radio Nova',
    published: publish,
  };

  if (isEdit) {
    articleData.id = existingArticle.id;
  }

  const btnId = publish ? 'btn-publish' : 'btn-draft';
  const btn = document.getElementById(btnId);
  const originalText = btn.textContent;
  btn.textContent = 'Guardando...';
  btn.disabled = true;

  try {
    await saveArticle(articleData);
    showToast(publish ? '¡Noticia publicada!' : 'Borrador guardado');

    // Navigate back to dashboard after a short delay
    setTimeout(() => {
      window.history.pushState(null, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, 800);
  } catch (err) {
    showToast('Error al guardar: ' + err.message, 'error');
    btn.textContent = originalText;
    btn.disabled = false;
  }
}
