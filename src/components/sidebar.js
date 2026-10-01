import { fetchSchedule } from '../lib/supabase.js';
import { getAdSlot, renderAdContent } from '../lib/ads.js';

/**
 * Get the currently airing program based on current time
 */
function getCurrentProgram(schedule) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const item of schedule) {
    const [startH, startM] = item.time_start.split(':').map(Number);
    const [endH, endM] = item.time_end.split(':').map(Number);
    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;

    // Handle overnight programs (e.g., 21:30 - 00:00)
    if (endMinutes <= startMinutes) {
      // Program crosses midnight
      if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
        return item;
      }
    } else {
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return item;
      }
    }
  }
  return null;
}

/**
 * Render the sidebar with radio schedule
 */
export async function renderSidebar() {
  let schedule = [];
  try {
    schedule = await fetchSchedule();
  } catch (err) {
    console.error('Error fetching schedule:', err);
  }

  const currentProgram = getCurrentProgram(schedule);

  const sidebarSlot = await getAdSlot('sidebar_home');
  const sidebarAdContent = renderAdContent(sidebarSlot);

  return `
    <aside class="sidebar" id="sidebar">
      <!-- Now Playing -->
      ${currentProgram ? `
        <div class="sidebar-widget now-playing-widget">
          <div class="widget-header">
            <span class="widget-icon">🔴</span>
            <h3>Ahora en vivo</h3>
          </div>
          <div class="widget-body">
            <div class="now-playing">
              <span class="now-playing-name">${currentProgram.program_name}</span>
              <span class="now-playing-time">${currentProgram.time_start} – ${currentProgram.time_end}</span>
              ${currentProgram.genre ? `<span class="now-playing-genre">${currentProgram.genre}</span>` : ''}
              ${currentProgram.description ? `<p class="now-playing-desc">${currentProgram.description}</p>` : ''}
            </div>
          </div>
        </div>
      ` : ''}

      ${sidebarAdContent ? `
        <div class="promo-space promo-space-sidebar" id="promo-sidebar">
          ${sidebarAdContent}
        </div>
      ` : ''}

      <!-- Full Schedule -->
      <div class="sidebar-widget" id="schedule-widget">
        <div class="widget-header">
          <span class="widget-icon">📻</span>
          <h3>Programación</h3>
        </div>
        <div class="widget-body">
          <div class="schedule-list">
            ${schedule.length > 0 ? schedule.map(item => `
              <div class="schedule-item ${currentProgram && currentProgram.id === item.id ? 'schedule-item-active' : ''}">
                <div class="schedule-item-time">${item.time_start} – ${item.time_end}</div>
                <div class="schedule-item-info">
                  <span class="schedule-item-name">${item.program_name}</span>
                  ${item.genre ? `<span class="schedule-item-genre">${item.genre}</span>` : ''}
                </div>
              </div>
            `).join('') : '<p style="color: var(--color-text-muted); font-size: var(--text-sm);">No hay programación cargada.</p>'}
          </div>
        </div>
      </div>
    </aside>
  `;
}

/**
 * No-op: weather widget removed, kept for backward compat
 */
export function initWeather() {}
