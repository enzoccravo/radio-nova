import { icons } from '../utils.js';

const STREAM_URL = 'https://autodj.nvradios.com/radio/8282/radio.mp3';
const METADATA_URL = 'https://autodj.nvradios.com/radio/8282';

/**
 * Render the live player bar
 */
export function renderPlayer() {
  return `
    <div class="player-bar" id="player-bar">
      <div class="container player-inner">
        <div class="player-live-badge">
          <span class="player-live-dot"></span>
          <span>En vivo</span>
        </div>

        <button class="player-btn" id="player-btn" aria-label="Reproducir Radio Nova en vivo">
          ${icons.play}
        </button>

        <div class="player-wave paused" id="player-wave">
          <span></span><span></span><span></span><span></span><span></span>
        </div>

        <div class="player-info">
          <span class="player-title" id="player-title">Radio Nova</span>
          <span class="player-subtitle">Paso de los Libres</span>
        </div>

        <div class="player-volume">
          <span id="volume-icon">${icons.volume}</span>
          <input
            type="range"
            id="player-volume"
            min="0"
            max="100"
            value="80"
            aria-label="Volumen"
          />
        </div>

        <audio id="player-audio" preload="none" src="${STREAM_URL}"></audio>
      </div>
    </div>
  `;
}

/**
 * Initialize player functionality
 */
export function initPlayer() {
  const audio = document.getElementById('player-audio');
  const btn = document.getElementById('player-btn');
  const wave = document.getElementById('player-wave');
  const volumeSlider = document.getElementById('player-volume');
  const volumeIcon = document.getElementById('volume-icon');
  const titleEl = document.getElementById('player-title');

  if (!audio || !btn) return;

  let isPlaying = false;

  // Set initial volume
  audio.volume = 0.8;

  // Play / Pause toggle
  btn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      // Reset source to stop buffering
      audio.src = '';
    } else {
      audio.src = STREAM_URL;
      audio.load();
      audio.play().catch(err => {
        console.error('Error al reproducir:', err);
      });
    }
  });

  audio.addEventListener('play', () => {
    isPlaying = true;
    btn.innerHTML = icons.pause;
    wave.classList.remove('paused');
  });

  audio.addEventListener('pause', () => {
    isPlaying = false;
    btn.innerHTML = icons.play;
    wave.classList.add('paused');
  });

  audio.addEventListener('error', () => {
    isPlaying = false;
    btn.innerHTML = icons.play;
    wave.classList.add('paused');
  });

  // Volume control
  volumeSlider.addEventListener('input', (e) => {
    const vol = e.target.value / 100;
    audio.volume = vol;
    volumeIcon.innerHTML = vol === 0 ? icons.volumeMute : icons.volume;
  });

  // Fetch current song metadata periodically
  fetchMetadata(titleEl);
  setInterval(() => fetchMetadata(titleEl), 15000);
}

/**
 * Fetch current playing song via JSONP-like approach
 */
async function fetchMetadata(titleEl) {
  try {
    // Use the Shoutcast stats endpoint
    const callbackName = `shoutCb_${Date.now()}`;

    const promise = new Promise((resolve, reject) => {
      window[callbackName] = (data) => {
        resolve(data);
        delete window[callbackName];
      };

      const script = document.createElement('script');
      script.src = `${METADATA_URL}/stats?json=1&callback=${callbackName}&sid=1&_=${Date.now()}`;
      script.onerror = () => {
        reject(new Error('Failed to load metadata'));
        delete window[callbackName];
      };

      // Clean up after timeout
      setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          script.remove();
        }
      }, 5000);

      document.body.appendChild(script);
      script.onload = () => script.remove();
    });

    const data = await promise;
    if (data && data.songtitle && titleEl) {
      titleEl.textContent = data.songtitle;
    }
  } catch {
    // Silently fail - metadata is optional
  }
}
