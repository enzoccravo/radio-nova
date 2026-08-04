import { formatDate, getCategoryColor, icons } from '../utils.js';
import newsData from '../data/news.js';

/**
 * Render the sidebar
 */
export function renderSidebar() {
  return `
    <aside class="sidebar" id="sidebar">
      <!-- Weather Widget -->
      <div class="sidebar-widget" id="weather-widget">
        <div class="widget-header">
          <span class="widget-icon">🌞</span>
          <h3>Clima</h3>
        </div>
        <div class="widget-body">
          <div id="weather-content">
            <div class="weather-content">
              <div class="weather-icon">⏳</div>
              <div class="weather-data">
                <span class="weather-temp skeleton" style="width: 60px; height: 36px; display: block;"></span>
                <span class="weather-desc" style="color: var(--color-text-muted);">Cargando...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ad Space -->
      <div class="ad-space ad-space-sidebar" id="ad-sidebar">
        <div class="ad-placeholder">
          ${icons.ad}
          <span>Espacio publicitario</span>
        </div>
      </div>

      <!-- Recent News -->
      <div class="sidebar-widget" id="recent-news-widget">
        <div class="widget-header">
          <span class="widget-icon">📰</span>
          <h3>Últimas noticias</h3>
        </div>
        <div class="widget-body">
          <div class="recent-news-list">
            ${renderRecentNews()}
          </div>
        </div>
      </div>
    </aside>
  `;
}

/**
 * Render recent news for sidebar
 */
function renderRecentNews() {
  return newsData
    .slice(0, 5)
    .map(article => `
      <a href="/noticia/${article.slug}" data-link class="recent-news-item" style="text-decoration: none; color: inherit;">
        <div class="recent-news-thumb">
          <img src="${article.image}" alt="${article.title}" loading="lazy" />
        </div>
        <div class="recent-news-info">
          <span class="recent-news-cat" style="color: ${getCategoryColor(article.category)}">${article.categoryLabel}</span>
          <span class="recent-news-title">${article.title}</span>
          <span class="recent-news-date">${formatDate(article.date)}</span>
        </div>
      </a>
    `)
    .join('');
}

/**
 * Initialize weather widget
 */
export function initWeather() {
  fetchWeather();
}

async function fetchWeather() {
  const container = document.getElementById('weather-content');
  if (!container) return;

  try {
    // Using wttr.in — free, no API key needed
    const response = await fetch('https://wttr.in/Paso+de+los+Libres?format=j1');
    const data = await response.json();

    const current = data.current_condition[0];
    const tempC = current.temp_C;
    const humidity = current.humidity;
    const windKmph = current.windspeedKmph;
    const feelsLike = current.FeelsLikeC;

    // Map weather code to emoji
    const weatherCode = parseInt(current.weatherCode);
    const icon = getWeatherEmoji(weatherCode);

    // Get description in Spanish
    const desc = current.lang_es?.[0]?.value || current.weatherDesc[0].value;

    container.innerHTML = `
      <div class="weather-content">
        <div class="weather-icon">${icon}</div>
        <div class="weather-data">
          <span class="weather-temp">${tempC}°C</span>
          <span class="weather-desc">${desc}</span>
          <span class="weather-location">Paso de los Libres</span>
        </div>
      </div>
      <div class="weather-details">
        <div class="weather-detail">
          <span class="weather-detail-label">Sensación</span>
          <span class="weather-detail-value">${feelsLike}°C</span>
        </div>
        <div class="weather-detail">
          <span class="weather-detail-label">Humedad</span>
          <span class="weather-detail-value">${humidity}%</span>
        </div>
        <div class="weather-detail">
          <span class="weather-detail-label">Viento</span>
          <span class="weather-detail-value">${windKmph} km/h</span>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div class="weather-content">
        <div class="weather-icon">🌡️</div>
        <div class="weather-data">
          <span class="weather-desc">No se pudo cargar el clima</span>
          <span class="weather-location">Paso de los Libres</span>
        </div>
      </div>
    `;
  }
}

function getWeatherEmoji(code) {
  if (code === 113) return '☀️';
  if (code === 116) return '⛅';
  if (code === 119 || code === 122) return '☁️';
  if (code >= 176 && code <= 263) return '🌧️';
  if (code >= 266 && code <= 321) return '🌦️';
  if (code >= 323 && code <= 395) return '⛈️';
  if (code >= 200 && code <= 232) return '🌩️';
  return '🌤️';
}
