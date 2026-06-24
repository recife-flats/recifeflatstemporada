/**
 * dom.js — helpers DOM minimalistas
 * Evita repetir querySelector/addEventListener por toda parte.
 */

export const $  = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

export const on = (el, evt, handler, opts) => {
  if (!el) return () => {};
  el.addEventListener(evt, handler, opts);
  return () => el.removeEventListener(evt, handler, opts);
};

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
