import { fetchSchedule, saveScheduleItem, deleteScheduleItem } from '../lib/supabase.js';

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
    overlay.querySelector('#confirm-cancel').addEventListener('click', () => { overlay.remove(); resolve(false); });
    overlay.querySelector('#confirm-ok').addEventListener('click', () => { overlay.remove(); resolve(true); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
  });
}

export async function renderAdminSchedulePage(contentEl) {
  document.title = 'Programación — Radio Nova Admin';

  contentEl.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Programación</h1>
        <a href="/admin" data-link class="btn btn-ghost">← Volver al panel</a>
      </div>
      <p style="color: var(--color-text-muted);">Cargando programación...</p>
    </div>
  `;

  try {
    const schedule = await fetchSchedule();
    renderScheduleContent(contentEl, schedule);
  } catch (err) {
    contentEl.innerHTML = `
      <div class="admin-content">
        <div class="admin-header"><h1>Error</h1></div>
        <p style="color: #dc2626;">No se pudo cargar la programación: ${err.message}</p>
      </div>
    `;
  }
}

function renderScheduleContent(contentEl, schedule) {
  contentEl.innerHTML = `
    <div class="admin-content">
      <div class="admin-header">
        <h1>Programación</h1>
        <div style="display: flex; gap: var(--space-3);">
          <button class="btn btn-primary" id="btn-add-schedule">+ Agregar programa</button>
          <a href="/admin" data-link class="btn btn-ghost">← Volver al panel</a>
        </div>
      </div>

      <p style="color: var(--color-text-muted); margin-bottom: var(--space-6);">
        Gestioná la grilla de programación de la radio. Los cambios se reflejan inmediatamente en el sitio.
      </p>

      <!-- Add/Edit Form (hidden by default) -->
      <div class="schedule-form-container" id="schedule-form-container" style="display: none;">
        <div class="admin-editor-panel" style="margin-bottom: var(--space-6);">
          <h3 id="schedule-form-title">Agregar programa</h3>
          <input type="hidden" id="schedule-edit-id" value="" />
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
            <div class="admin-field">
              <label>Hora inicio</label>
              <input type="time" id="schedule-time-start" required />
            </div>
            <div class="admin-field">
              <label>Hora fin</label>
              <input type="time" id="schedule-time-end" required />
            </div>
          </div>
          <div class="admin-field">
            <label>Nombre del programa</label>
            <input type="text" id="schedule-program-name" placeholder="Ej: Amanecer Chamamecero" required />
          </div>
          <div class="admin-field">
            <label>Género</label>
            <input type="text" id="schedule-genre" placeholder="Ej: Musical – Cultural" />
          </div>
          <div class="admin-field">
            <label>Descripción</label>
            <textarea id="schedule-description" rows="3" placeholder="Breve descripción del programa..."></textarea>
          </div>
          <div class="admin-field">
            <label>Orden (número para ordenar en la grilla)</label>
            <input type="number" id="schedule-sort-order" value="0" min="0" />
          </div>
          <div style="display: flex; gap: var(--space-3); margin-top: var(--space-3);">
            <button class="btn btn-primary" id="btn-save-schedule">Guardar</button>
            <button class="btn btn-ghost" id="btn-cancel-schedule">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- Schedule Table -->
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Horario</th>
              <th>Programa</th>
              <th>Género</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="schedule-tbody">
            ${renderScheduleRows(schedule)}
          </tbody>
        </table>
      </div>

      ${schedule.length === 0 ? `
        <div class="admin-empty">
          <h3>No hay programas cargados</h3>
          <p>Agregá el primer programa para armar la grilla.</p>
        </div>
      ` : ''}
    </div>
  `;

  // --- Event Bindings ---

  const formContainer = document.getElementById('schedule-form-container');
  const formTitle = document.getElementById('schedule-form-title');
  const editIdInput = document.getElementById('schedule-edit-id');
  const timeStartInput = document.getElementById('schedule-time-start');
  const timeEndInput = document.getElementById('schedule-time-end');
  const programNameInput = document.getElementById('schedule-program-name');
  const genreInput = document.getElementById('schedule-genre');
  const descriptionInput = document.getElementById('schedule-description');
  const sortOrderInput = document.getElementById('schedule-sort-order');

  function clearForm() {
    editIdInput.value = '';
    timeStartInput.value = '';
    timeEndInput.value = '';
    programNameInput.value = '';
    genreInput.value = '';
    descriptionInput.value = '';
    sortOrderInput.value = schedule.length + 1;
    formTitle.textContent = 'Agregar programa';
  }

  // Add button
  document.getElementById('btn-add-schedule').addEventListener('click', () => {
    clearForm();
    formContainer.style.display = 'block';
    timeStartInput.focus();
  });

  // Cancel button
  document.getElementById('btn-cancel-schedule').addEventListener('click', () => {
    formContainer.style.display = 'none';
    clearForm();
  });

  // Save button
  document.getElementById('btn-save-schedule').addEventListener('click', async () => {
    const programName = programNameInput.value.trim();
    const timeStart = timeStartInput.value;
    const timeEnd = timeEndInput.value;

    if (!programName) {
      showToast('El nombre del programa es obligatorio.', 'error');
      return;
    }
    if (!timeStart || !timeEnd) {
      showToast('Los horarios son obligatorios.', 'error');
      return;
    }

    const item = {
      time_start: timeStart,
      time_end: timeEnd,
      program_name: programName,
      genre: genreInput.value.trim(),
      description: descriptionInput.value.trim(),
      sort_order: parseInt(sortOrderInput.value) || 0,
    };

    const editId = editIdInput.value;
    if (editId) {
      item.id = editId;
    }

    try {
      const saved = await saveScheduleItem(item);

      if (editId) {
        const idx = schedule.findIndex(s => s.id === editId);
        if (idx !== -1) schedule[idx] = saved;
        showToast('Programa actualizado');
      } else {
        schedule.push(saved);
        showToast('Programa agregado');
      }

      // Re-sort
      schedule.sort((a, b) => a.sort_order - b.sort_order);

      // Re-render table
      document.getElementById('schedule-tbody').innerHTML = renderScheduleRows(schedule);
      formContainer.style.display = 'none';
      clearForm();
    } catch (err) {
      showToast('Error al guardar: ' + err.message, 'error');
    }
  });

  // Table actions (event delegation)
  document.getElementById('schedule-tbody').addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.btn-edit-schedule');
    const deleteBtn = e.target.closest('.btn-delete-schedule');

    if (editBtn) {
      const id = editBtn.dataset.id;
      const item = schedule.find(s => s.id === id);
      if (!item) return;

      editIdInput.value = item.id;
      timeStartInput.value = item.time_start;
      timeEndInput.value = item.time_end;
      programNameInput.value = item.program_name;
      genreInput.value = item.genre || '';
      descriptionInput.value = item.description || '';
      sortOrderInput.value = item.sort_order || 0;
      formTitle.textContent = 'Editar programa';
      formContainer.style.display = 'block';
      timeStartInput.focus();
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      const name = deleteBtn.dataset.name;
      const confirmed = await showConfirm(
        '¿Eliminar programa?',
        `Se eliminará "${name}" de la grilla de programación.`
      );
      if (confirmed) {
        try {
          await deleteScheduleItem(id);
          const idx = schedule.findIndex(s => s.id === id);
          if (idx !== -1) schedule.splice(idx, 1);
          document.getElementById('schedule-tbody').innerHTML = renderScheduleRows(schedule);
          showToast('Programa eliminado');
        } catch (err) {
          showToast('Error al eliminar: ' + err.message, 'error');
        }
      }
    }
  });
}

function renderScheduleRows(schedule) {
  if (schedule.length === 0) {
    return `<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: var(--space-8);">No hay programas cargados.</td></tr>`;
  }

  return schedule.map(item => `
    <tr>
      <td style="white-space: nowrap; font-weight: var(--weight-semibold);">${item.time_start} – ${item.time_end}</td>
      <td class="admin-article-title" style="max-width: 200px;">${item.program_name}</td>
      <td style="font-size: var(--text-xs); color: var(--color-text-muted);">${item.genre || '—'}</td>
      <td style="font-size: var(--text-xs); color: var(--color-text-secondary); max-width: 300px;">${item.description || '—'}</td>
      <td>
        <div class="admin-actions">
          <button class="btn btn-ghost btn-sm btn-edit-schedule" data-id="${item.id}">Editar</button>
          <button class="btn btn-ghost btn-sm btn-delete-schedule" data-id="${item.id}" data-name="${item.program_name.replace(/"/g, '&quot;')}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}
