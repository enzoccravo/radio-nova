import { icons } from '../utils.js';

/**
 * Render the contact page
 */
export function renderContactPage(contentEl) {
  document.title = 'Contacto — Radio Nova';

  contentEl.innerHTML = `
    <main class="main-content">
      <div class="container">
        <div class="contact-page animate-fade-in">
          <div class="contact-grid">
            <div class="contact-info">
              <h1 style="font-family: var(--font-heading); font-size: var(--text-3xl); font-weight: var(--weight-extrabold);">
                Contactanos
              </h1>
              <p>
                ¿Tenés una noticia, querés pautar publicidad o simplemente
                mandarnos un saludo? Estamos para escucharte. Completá el
                formulario o escribinos por cualquiera de nuestros canales.
              </p>

              <div class="contact-detail">
                <div class="contact-detail-icon">${icons.location}</div>
                <div class="contact-detail-text">
                  <h4>Dirección</h4>
                  <p>Paso de los Libres, Corrientes, Argentina</p>
                </div>
              </div>

              <div class="contact-detail">
                <div class="contact-detail-icon">${icons.mail}</div>
                <div class="contact-detail-text">
                  <h4>Email</h4>
                  <p>contacto@radionova.com.ar</p>
                </div>
              </div>

              <div class="contact-detail">
                <div class="contact-detail-icon">${icons.phone}</div>
                <div class="contact-detail-text">
                  <h4>Teléfono</h4>
                  <p>Consultá por WhatsApp</p>
                </div>
              </div>

              <div style="margin-top: var(--space-4);">
                <h4 style="font-weight: var(--weight-semibold); margin-bottom: var(--space-3);">Seguinos en redes</h4>
                <div class="footer-social" style="justify-content: flex-start;">
                  <a href="#" aria-label="Facebook" style="background: var(--color-primary-bg); color: var(--color-primary);">${icons.facebook}</a>
                  <a href="#" aria-label="Instagram" style="background: var(--color-primary-bg); color: var(--color-primary);">${icons.instagram}</a>
                  <a href="#" aria-label="Twitter / X" style="background: var(--color-primary-bg); color: var(--color-primary);">${icons.twitter}</a>
                  <a href="#" aria-label="WhatsApp" style="background: var(--color-primary-bg); color: var(--color-primary);">${icons.whatsapp}</a>
                </div>
              </div>
            </div>

            <form class="contact-form" id="contact-form" onsubmit="return false;">
              <h3 style="font-family: var(--font-heading); font-size: var(--text-xl); font-weight: var(--weight-bold); margin-bottom: var(--space-6);">
                Envianos un mensaje
              </h3>

              <div class="form-group">
                <label for="contact-name">Nombre completo</label>
                <input type="text" id="contact-name" placeholder="Tu nombre" required />
              </div>

              <div class="form-group">
                <label for="contact-email">Email</label>
                <input type="email" id="contact-email" placeholder="tu@email.com" required />
              </div>

              <div class="form-group">
                <label for="contact-subject">Asunto</label>
                <input type="text" id="contact-subject" placeholder="¿Sobre qué nos escribís?" required />
              </div>

              <div class="form-group">
                <label for="contact-message">Mensaje</label>
                <textarea id="contact-message" placeholder="Contanos..." required></textarea>
              </div>

              <button type="submit" class="btn-primary" id="contact-submit" style="width: 100%;">
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  `;

  // Form handling
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('contact-submit');
      btn.textContent = '¡Mensaje enviado!';
      btn.style.background = 'var(--color-success)';
      setTimeout(() => {
        btn.textContent = 'Enviar mensaje';
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }
}
