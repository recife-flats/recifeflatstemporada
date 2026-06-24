
/**
 * <rf-navbar> — Header sticky reutilizável.
 *
 * Uso:
 *   <rf-navbar over-hero></rf-navbar>
 *
 * Atributos:
 *   over-hero  : aplica o estilo claro inicial (texto branco) sobre hero escuro
 *   whatsapp   : número de WhatsApp (default: o de produção)
 *
 * Eventos emitidos:
 *   rf-menu-toggle  : disparado ao clicar no botão "Menu" (detail: { open: boolean })
 */

const WHATSAPP_DEFAULT = '558196601178';

class RFNavbar extends HTMLElement {
  connectedCallback() {
    const overHero  = this.hasAttribute('over-hero');
    const whatsapp  = this.getAttribute('whatsapp') || WHATSAPP_DEFAULT;
    const heroTarget = this.getAttribute('hero-target') || '#hero';

    this.innerHTML = /* html */`
      <header class="navbar ${overHero ? 'is-over-hero' : ''}" data-navbar>
        <div class="navbar__inner container">

          <a href="/" class="navbar__logo" aria-label="Recife Flats — Início">
            <span class="navbar__logo-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="8"  width="7" height="10" rx="1" fill="white" fill-opacity="0.9"/>
                <rect x="11" y="5" width="7" height="13" rx="1" fill="white" fill-opacity="0.7"/>
                <rect x="5"  y="11" width="1.5" height="2" rx="0.3" fill="#6E2410"/>
                <rect x="8"  y="11" width="1.5" height="2" rx="0.3" fill="#6E2410"/>
                <rect x="13" y="8"  width="1.5" height="2" rx="0.3" fill="#6E2410"/>
                <rect x="16" y="8"  width="1.5" height="2" rx="0.3" fill="#6E2410"/>
                <rect x="13" y="11" width="1.5" height="2" rx="0.3" fill="#6E2410"/>
                <rect x="16" y="11" width="1.5" height="2" rx="0.3" fill="#6E2410"/>
              </svg>
            </span>
            <span class="navbar__logo-text">
              <span class="navbar__logo-name">Recife Flats</span>
              <span class="navbar__logo-sub">Temporada</span>
            </span>
          </a>

          <div class="navbar__actions">
            <a href="https://wa.me/${whatsapp}"
               class="btn btn--whatsapp"
               target="_blank" rel="noopener"
               aria-label="Falar no WhatsApp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span class="btn__label">WhatsApp</span>
            </a>

            <button class="menu-toggle"
                    data-menu-toggle
                    type="button"
                    aria-label="Abrir menu de navegação"
                    aria-expanded="false"
                    aria-controls="rf-menu">
              <span class="menu-toggle__label">Menu</span>
              <span class="menu-toggle__icon" aria-hidden="true">
                <span></span><span></span><span></span>
              </span>
            </button>
          </div>
        </div>
      </header>
    `;

    this._navbar    = this.querySelector('[data-navbar]');
    this._toggle    = this.querySelector('[data-menu-toggle]');
    this._heroEl    = document.querySelector(heroTarget);

    // 1. Observa o hero — define is-over-hero / is-scrolled
    if (this._heroEl) {
      this._observer = new IntersectionObserver(
        ([entry]) => {
          const over = entry.isIntersecting;
          this._navbar.classList.toggle('is-over-hero', over);
          this._navbar.classList.toggle('is-scrolled',  !over);
        },
        { threshold: 0.05 }
      );
      this._observer.observe(this._heroEl);
    } else {
      this._navbar.classList.add('is-scrolled');
    }

    // 2. Emite evento global ao clicar no botão Menu
    this._toggle.addEventListener('click', () => {
      const isOpen = this._toggle.classList.toggle('is-open');
      this._toggle.setAttribute('aria-expanded', String(isOpen));
      window.dispatchEvent(new CustomEvent('rf-menu-toggle', { detail: { open: isOpen } }));
    });

    // 3. Escuta para sincronizar (caso o menu seja fechado por dentro)
    this._unsync = (e) => {
      const open = e.detail.open;
      this._toggle.classList.toggle('is-open', open);
      this._toggle.setAttribute('aria-expanded', String(open));
    };
    window.addEventListener('rf-menu-state', this._unsync);
  }

  disconnectedCallback() {
    this._observer?.disconnect();
    window.removeEventListener('rf-menu-state', this._unsync);
  }
}

customElements.define('rf-navbar', RFNavbar);
