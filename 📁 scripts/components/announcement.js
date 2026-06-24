/**
 * <rf-announcement> — Barra de anúncio dispensável.
 *
 * Uso:
 *   <rf-announcement>
 *     🌴 Promoção — <strong>até 20% off</strong> em 5+ noites
 *   </rf-announcement>
 *
 * Lembra do estado dispensado via localStorage (key: "rf-announcement-dismissed").
 */

class RFAnnouncement extends HTMLElement {
  connectedCallback() {
    if (localStorage.getItem('rf-announcement-dismissed') === '1') {
      this.remove();
      return;
    }

    const text = this.innerHTML.trim();
    this.innerHTML = `
      <div class="announcement" role="region" aria-label="Aviso promocional">
        <span class="announcement__text">${text}</span>
        <button class="announcement__close" type="button" aria-label="Fechar aviso">✕</button>
      </div>
    `;

    this.querySelector('.announcement__close').addEventListener('click', () => {
      this.querySelector('.announcement').classList.add('is-hidden');
      localStorage.setItem('rf-announcement-dismissed', '1');
    });
  }
}

customElements.define('rf-announcement', RFAnnouncement);
