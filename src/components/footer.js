import { icons } from '../utils.js';

/**
 * Render the site footer
 */
export function renderFooter() {
  const year = new Date().getFullYear();

  return `
    <footer class="site-footer" id="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-brand-logo">
              <img src="/logo.jpeg" alt="Radio Nova" />
              <span>Radio Nova</span>
            </div>
            <p>
              Tu fuente de noticias locales de Paso de los Libres, Corrientes.
              Escuchanos en vivo y mantenete informado sobre todo
              lo que pasa en la región.
            </p>
          </div>

          <div class="footer-col">
            <h4>Secciones</h4>
            <ul>
              <li><a href="/categoria/locales" data-link>Locales</a></li>
              <li><a href="/categoria/politica" data-link>Política</a></li>
              <li><a href="/categoria/deportes" data-link>Deportes</a></li>
              <li><a href="/categoria/economia" data-link>Economía</a></li>
              <li><a href="/categoria/cultura" data-link>Cultura</a></li>
              <li><a href="/categoria/policiales" data-link>Policiales</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>La Radio</h4>
            <ul>
              <li><a href="/" data-link>Inicio</a></li>
              <li><a href="/contacto" data-link>Contacto</a></li>
              <li><a href="https://nova.nvradios.com/" target="_blank" rel="noopener">Escuchar en vivo</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Contacto</h4>
            <ul>
              <li><a href="#">Paso de los Libres, Corrientes</a></li>
              <li><a href="#">Argentina</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© ${year} Radio Nova. Todos los derechos reservados.</p>
          <div class="footer-social">
            <a href="#" aria-label="Facebook" title="Facebook">${icons.facebook}</a>
            <a href="#" aria-label="Instagram" title="Instagram">${icons.instagram}</a>
            <a href="#" aria-label="Twitter / X" title="Twitter / X">${icons.twitter}</a>
            <a href="#" aria-label="WhatsApp" title="WhatsApp">${icons.whatsapp}</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}
