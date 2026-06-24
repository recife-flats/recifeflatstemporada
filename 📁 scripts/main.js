/**
 * main.js — Ponto de entrada.
 * Importa todos os Web Components. Ao carregar, eles se auto-registram
 * via customElements.define() e ficam disponíveis em qualquer página.
 *
 * Carregado como módulo: <script type="module" src="/scripts/main.js"></script>
 */

// Registra plugin GSAP global
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

// Componentes (cada um se auto-registra)
import './components/announcement.js';
import './components/navbar.js';
import './components/menu.js';
import './components/hero.js';

// Aqui você adiciona futuramente:
// import './components/footer.js';
// import './components/apartment-card.js';
// import './components/testimonials.js';
