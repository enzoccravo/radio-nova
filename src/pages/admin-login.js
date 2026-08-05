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
    errorEl.classList.remove('visible');
    submitBtn.textContent = 'Ingresando...';
    submitBtn.disabled = true;

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      await login(email, password);
      // Navigate to admin dashboard
      window.history.pushState(null, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (err) {
      errorEl.textContent = 'Email o contraseña incorrectos.';
      errorEl.classList.add('visible');
      submitBtn.textContent = 'Iniciar sesión';
      submitBtn.disabled = false;
    }
  });
}
