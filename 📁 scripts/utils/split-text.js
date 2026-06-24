/**
 * split-text.js — quebra um elemento em <span class="letter"> por caractere.
 * Preserva tags internas (ex.: <em>).
 */

export function splitTextIntoLetters(el) {
  if (!el) return [];

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      [...node.textContent].forEach((ch) => {
        const s = document.createElement('span');
        s.className = 'letter';
        s.style.display = 'inline-block';
        s.innerHTML = ch === ' ' ? '&nbsp;' : ch;
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      [...node.childNodes].forEach(walk);
    }
  };

  [...el.childNodes].forEach(walk);
  return el.querySelectorAll('.letter');
}
