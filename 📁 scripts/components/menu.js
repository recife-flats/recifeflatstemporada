
/**
 * <rf-menu> — Catálogo de navegação que abre virando como página de livro.
 *
 * Uso:
 *   <rf-menu></rf-menu>
 *
 * Atributos opcionais:
 *   wraps  : seletor do elemento que será "virado" ao abrir o menu
 *            (default: ".site-content")
 *
 * Escuta o evento global 'rf-menu-toggle' (vindo da navbar) e
 * emite 'rf-menu-state' { open: boolean } quando muda de estado.
 *
 * Requer GSAP global.
 */

const NAV_ITEMS = [
  { num: '01', label: 'Início',       href: '/'              },
  { num: '02', label: 'Apartamentos', href: '/apartamentos.html' },
  { num: '03', label: 'Sobre nós',    href: '/sobre.html'    },
  { num: '04', label: 'Depoimentos',  href: '/#depoimentos'  },
  { num: '05', label: 'Contato',      href: '/contato.html'  },
];

class RFMenu extends HTMLElement {
  connectedCallback() {
    this._wrapsSel = this.getAttribute('wraps') || '.site-content';
    this._isOpen   = false;
    this._timeline = null;

    this.innerHTML = /* html */`
      <div class="menu-overlay"
           id="rf-menu"
           role="dialog"
           aria-modal="true"
           aria-label="Menu de navegação"
           aria-hidden="true"
           data-menu>

        <div class="menu-overlay__left">
          <header class="menu-overlay__header">
            <div>
              <span class="menu-overlay__logo">Recife Flats</span>
              <span class="menu-overlay__logo-sub">Temporada</span>
            </div>
            <button class="menu-overlay__close" type="button" data-menu-close aria-label="Fechar menu">
              Fechar
              <span class="menu-overlay__close-circle" aria-hidden="true">✕</span>
            </button>
          </header>

          <nav class="menu-overlay__nav" aria-label="Menu principal">
            ${NAV_ITEMS.map(item => `
              <div class="menu-overlay__item">
                <span class="menu-overlay__num">${item.num}</span>
                <div class="menu-overlay__link-wrap">
                  <a href="${item.href}" class="menu-overlay__link" data-menu-link>${item.label}</a>
                </div>
                <span class="menu-overlay__arrow" aria-hidden="true">→</span>
              </div>
            `).join('')}
          </nav>

          <footer class="menu-overlay__footer">
            <span class="menu-overlay__copy">© ${new Date().getFullYear()} Recife Flats</span>
            <div class="menu-overlay__socials">
              <a href="https://instagram.com/recifeflats" class="menu-overlay__social" target="_blank" rel="noopener">Instagram</a>
              <a href="https://airbnb.com" class="menu-overlay__social" target="_blank" rel="noopener">Airbnb</a>
              <a href="https://wa.me/558196601178" class="menu-overlay__social" target="_blank" rel="noopener">WhatsApp</a>
            </div>
          </footer>
        </div>

        <aside class="menu-overlay__right" aria-hidden="true">
          <div class="menu-overlay__bg"></div>
          <div class="menu-overlay__right-content">
            <span class="menu-overlay__edition">Recife · Pernambuco · Brasil</span>
            <p class="menu-overlay__tagline">
              Sua temporada com<br><em>vista para o mar</em><br>começa aqui.
            </p>
            <div class="menu-overlay__contact">
              <div class="menu-overlay__contact-item">
                <svg class="menu-overlay__contact-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>
                <a href="https://wa.me/558196601178" target="_blank" rel="noopener">(81) 9 9660-1178</a>
              </div>
              <div class="menu-overlay__contact-item">
                <svg class="menu-overlay__contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <a href="mailto:contato@recifeflats.com.br">contato@recifeflats.com.br</a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;

    this._menuEl  = this.querySelector('[data-menu]');
    this._wrapsEl = document.querySelector(this._wrapsSel);

    // Estado inicial via GSAP
    gsap.set(this._menuEl, { opacity: 0, xPercent: 5, rotateY: 6, transformPerspective: 1400 });

    // Wiring
    this.querySelector('[data-menu-close]').addEventListener('click', () => this.close());
    this.querySelectorAll('[data-menu-link]').forEach(a =>
      a.addEventListener('click', () => this.close())
    );
    window.addEventListener('rf-menu-toggle', this._onToggle = (e) => {
      e.detail.open ? this.open() : this.close();
    });
    document.addEventListener('keydown', this._onKey = (e) => {
      if (e.key === 'Escape' && this._isOpen) this.close();
    });
  }

  disconnectedCallback() {
    window.removeEventListener('rf-menu-toggle', this._onToggle);
    document.removeEventListener('keydown', this._onKey);
  }

  /**
   * Constrói a timeline GSAP da abertura.
   * Três atos simultâneos:
   *  1) #site-content "vira" — perspectiva 3D + escala menor + filtro escuro
   *  2) Menu emerge — slide+rotação para posição flat
   *  3) Conteúdo do menu surge — links em stagger
   */
  _buildTimeline() {
    const DUR = 0.88;
    const EASE = 'power3.inOut';

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: EASE, duration: DUR },
      onStart: () => {
        this._menuEl.classList.add('is-active');
        this._menuEl.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      },
      onReverseComplete: () => {
        this._menuEl.classList.remove('is-active');
        this._menuEl.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      },
    });

    // ATO 1 — Página recua
    if (this._wrapsEl) {
      tl.to(this._wrapsEl, {
        rotateY: -9,
        scale: 0.91,
        x: '-2.5%',
        transformPerspective: 1400,
        transformOrigin: 'right center',
        borderRadius: '14px',
        filter: 'brightness(0.65) saturate(0.8)',
      }, 0);
    }

    // ATO 2 — Menu emerge
    tl.fromTo(this._menuEl,
      { xPercent: 5, rotateY: 6, opacity: 0, transformOrigin: 'right center', transformPerspective: 1400 },
      { xPercent: 0, rotateY: 0, opacity: 1 },
      0
    );

    // ATO 3a — Links em stagger
    tl.fromTo(this.querySelectorAll('.menu-overlay__link'),
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.65, ease: 'power3.out', stagger: 0.07 },
      DUR * 0.42
    );

    // ATO 3b — Header, footer, painel direito
    tl.fromTo(
      [
        this.querySelector('.menu-overlay__header'),
        this.querySelector('.menu-overlay__footer'),
        this.querySelector('.menu-overlay__right-content'),
      ],
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.09 },
      DUR * 0.48
    );

    return tl;
  }

  open() {
    if (this._isOpen) return;
    this._isOpen = true;
    if (!this._timeline) this._timeline = this._buildTimeline();
    this._timeline.play();
    window.dispatchEvent(new CustomEvent('rf-menu-state', { detail: { open: true } }));
  }

  close() {
    if (!this._isOpen) return;
    this._isOpen = false;
    this._timeline?.reverse();
    window.dispatchEvent(new CustomEvent('rf-menu-state', { detail: { open: false } }));
  }
}

customElements.define('rf-menu', RFMenu);
