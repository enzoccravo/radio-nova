import { login } from '../lib/supabase.js';

/**
 * Render the admin login page
 */
export function renderAdminLoginPage(contentEl) {
  document.title = 'Iniciar sesión — Radio Nova Admin';

  contentEl.innerHTML = `
    <div class="admin-login-page">
      <div class="admin-login-card animate-fade-in">
        <div class="admin-login-logo">
          <img src="/logo.jpeg" alt="Radio Nova" />
          <h1>Radio Nova</h1>
          <p>Panel de administración</p>
        </div>

        <div class="admin-login-error" id="login-error"></div>

        <form id="login-form">
          <!-- Honeypot field (hidden from real users, catches simple bots) -->
          <div style="opacity: 0; position: absolute; top: 0; left: 0; height: 0; width: 0; z-index: -1; overflow: hidden;">
            <label for="login-website">Website (dejar en blanco)</label>
            <input type="text" id="login-website" name="website" tabindex="-1" autocomplete="off" />
          </div>

          <div class="admin-field">
            <label for="login-email">Email</label>
            <input type="email" id="login-email" placeholder="tu@email.com" required autocomplete="email" />
          </div>

          <div class="admin-field">
            <label for="login-password">Contraseña</label>
            <input type="password" id="login-password" placeholder="Tu contraseña" required autocomplete="current-password" />
          </div>

          <button type="submit" class="btn btn-primary" id="login-submit" style="width: 100%; padding: var(--space-3) var(--space-4); font-size: var(--text-base);">
            Iniciar sesión
          </button>
        </form>

        <p style="text-align: center; margin-top: var(--space-6); font-size: var(--text-sm); color: var(--color-text-muted);">
          <a href="/" data-link style="color: var(--color-primary);">← Volver al sitio</a>
        </p>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  const submitBtn = document.getElementById('login-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Honeypot check: If the hidden field is filled, it's a bot.
    const honeypot = document.getElementById('login-website').value;
    if (honeypot) {
      // Fake a loading state and do nothing to trick the bot
      submitBtn.textContent = 'Ingresando...';
      submitBtn.disabled = true;
      setTimeout(() => {
        submitBtn.textContent = 'Iniciar sesión';
        submitBtn.disabled = false;
      }, 2000);
      return;
    }

    // 2. Rate Limiting Check (Frontend)
    const lockoutData = JSON.parse(localStorage.getItem('admin_login_lockout') || '{"attempts": 0, "lockUntil": 0}');
    const now = Date.now();

    if (now < lockoutData.lockUntil) {
      const remainingSecs = Math.ceil((lockoutData.lockUntil - now) / 1000);
      errorEl.textContent = `Demasiados intentos. Esperá ${remainingSecs} segundos.`;
      errorEl.classList.add('visible');
      return;
    }

    errorEl.classList.remove('visible');
    submitBtn.textContent = 'Ingresando...';
    submitBtn.disabled = true;

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      // Artificial delay to slow down brute force
      await new Promise(resolve => setTimeout(resolve, 600));

      await login(email, password);
      
      // Reset attempts on success
      localStorage.removeItem('admin_login_lockout');

      // Navigate to admin dashboard
      window.history.pushState(null, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (err) {
      // Track failed attempt
      lockoutData.attempts += 1;
      
      // Calculate lockout time based on attempts (Exponential-ish backoff)
      if (lockoutData.attempts >= 10) {
        lockoutData.lockUntil = now + (15 * 60 * 1000); // 15 mins
      } else if (lockoutData.attempts >= 5) {
        lockoutData.lockUntil = now + (3 * 60 * 1000); // 3 mins
      } else if (lockoutData.attempts >= 3) {
        lockoutData.lockUntil = now + (30 * 1000); // 30 seconds
      }
      
      localStorage.setItem('admin_login_lockout', JSON.stringify(lockoutData));

      submitBtn.disabled = false;
      submitBtn.textContent = 'Iniciar sesión';
      errorEl.textContent = 'Email o contraseña incorrectos.';
      errorEl.classList.add('visible');
    }
  });
}
