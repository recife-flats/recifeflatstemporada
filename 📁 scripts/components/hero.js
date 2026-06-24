/**
 * <rf-hero> — Hero stop-scroll com vídeo em loop infinito.
 *
 * Uso:
 *   <rf-hero
 *     video="/assets/videos/recife-loop.mp4"
 *     video-webm="/assets/videos/recife-loop.webm"
 *     poster="/assets/images/hero-poster.jpg"
 *     eyebrow="Recife · Boa Viagem · Pina"
 *     title='Viva o melhor de <em>Recife</em> com conforto real'
 *     description="Apartamentos totalmente equipados para temporada, a passos da praia."
 *     primary-href="#apartamentos"
 *     primary-label="Ver Apartamentos"
 *     ghost-href="#contato"
 *     ghost-label="Consultar disponibilidade">
 *   </rf-hero>
 *
 * Stats são passados via slot:
 *   <ul slot="stats">
 *     <li data-num="4"   data-label="Apartamentos"></li>
 *     <li data-num="200+" data-label="Hóspedes felizes"></li>
 *     <li data-num="4.9" data-label="Nota média"></li>
 *   </ul>
 *
 * Requer GSAP global.
 */

import { splitTextIntoLetters } from '../utils/split-text.js';
import { prefersReducedMotion } from '../utils/dom.js';

class RFHero extends HTMLElement {
  connectedCallback() {
    const video       = this.getAttribute('video')       || '';
    const videoWebm   = this.getAttribute('video-webm')  || '';
    const poster      = this.getAttribute('poster')      || '';
    const eyebrow     = this.getAttribute('eyebrow')     || 'Recife · Boa Viagem · Pina';
    const title       = this.getAttribute('title')       || 'Viva o melhor de <em>Recife</em> com conforto real';
    const description = this.getAttribute('description') || '';
    const primaryHref  = this.getAttribute('primary-href')  || '#apartamentos';
    const primaryLabel = this.getAttribute('primary-label') || 'Ver Apartamentos';
    const ghostHref    = this.getAttribute('ghost-href')    || '#contato';
    const ghostLabel   = this.getAttribute('ghost-label')   || 'Consultar disponibilidade';

    // Stats vindos do slot
    const statsSlot = this.querySelector('[slot="stats"]');
    const stats = statsSlot ? [...statsSlot.children].map(li => ({
      num:   li.dataset.num   || '',
      label: li.dataset.label || '',
    })) : [];

    this.innerHTML = /* html */`
      <section class="hero" id="hero" aria-label="Apresentação">

        ${poster ? `<img class="hero__poster" src="${poster}" alt="" loading="eager" aria-hidden="true">` : ''}

        ${video ? `
          <video class="hero__video"
                 autoplay muted loop playsinline preload="metadata"
                 ${poster ? `poster="${poster}"` : ''}
                 aria-hidden="true">
            ${videoWebm ? `<source src="${videoWebm}" type="video/webm">` : ''}
            <source src="${video}" type="video/mp4">
          </video>
        ` : ''}

        <div class="hero__overlay"></div>
        <div class="hero__grain"></div>

        <div class="hero__container container">
          <span class="hero__eyebrow" data-hero-eyebrow>
            <span class="hero__eyebrow-dot"></span>
            <span class="hero__eyebrow-text">${eyebrow}</span>
          </span>

          <h1 class="hero__title" data-hero-title>${title}</h1>

          ${description ? `
            <p class="hero__description" data-hero-desc>${description}</p>
          ` : ''}

          <div class="hero__cta" data-hero-cta>
            <a href="${primaryHref}" class="btn btn--primary">
              ${primaryLabel}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="${ghostHref}" class="btn btn--ghost">
              ${ghostLabel}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>

          ${stats.length ? `
            <div class="hero__stats" data-hero-stats>
              ${stats.map((s, i) => `
                ${i > 0 ? '<span class="hero__stat-div" aria-hidden="true"></span>' : ''}
                <div class="hero__stat">
                  <span class="hero__stat-num">${s.num}</span>
                  <span class="hero__stat-label">${s.label}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div class="hero__scroll" aria-hidden="true">
          <span class="hero__scroll-text">Scroll</span>
          <span class="hero__scroll-line"></span>
        </div>
      </section>
    `;

    this._animate();
  }

  _animate() {
    const reduce = prefersReducedMotion();
    const titleEl   = this.querySelector('[data-hero-title]');
    const eyebrowEl = this.querySelector('[data-hero-eyebrow]');
    const descEl    = this.querySelector('[data-hero-desc]');
    const ctaEl     = this.querySelector('[data-hero-cta]');
    const statsEl   = this.querySelector('[data-hero-stats]');

    // Split title em letras
    const letters = titleEl ? splitTextIntoLetters(titleEl) : [];

    if (reduce) {
      // Sem animação — mostra tudo direto
      [eyebrowEl, descEl, ctaEl, statsEl].forEach(el => {
        if (!el) return;
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      letters.forEach(l => { l.style.opacity = '1'; l.style.transform = 'none'; });
      return;
    }

    // Sequência de entrada
    const tl = gsap.timeline({ delay: 0.15 });

    if (letters.length) {
      tl.to(letters, {
        opacity: 1, y: 0,
        duration: 0.5, ease: 'power2.out',
        stagger: 0.022,
      }, 0);
    }

    if (eyebrowEl) {
      tl.to(eyebrowEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.1);
    }
    if (descEl) {
      tl.to(descEl, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.4);
    }
    if (ctaEl) {
      tl.to(ctaEl, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.55);
    }
    if (statsEl) {
      tl.to(statsEl, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.75);
    }
  }
}

customElements.define('rf-hero', RFHero);
