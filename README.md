# Recife Flats Temporada — Arquitetura do site

Site institucional com componentes reutilizáveis em **vanilla HTML/CSS/JS**.
Sem framework. Sem build step. Pode subir direto na Netlify.

---

## Por que essa estrutura

A pergunta de origem foi: "como reutilizar a `nav` (e outros pedaços) em
várias páginas?". A resposta é **Web Components nativos** + **CSS tokenizado**.

- **Web Components** são `customElements` do navegador. Você define uma classe
  uma vez (`<rf-navbar>`), e usa em qualquer HTML como uma tag comum. Quando
  precisar mudar a navbar do site todo, mexe num único arquivo.
- **CSS por componente** (BEM) com **tokens centralizados** garante que cores,
  espaçamentos e fontes nasçam de um único lugar.
- **Sem framework** mantém o site rápido, simples de hospedar e fácil de
  manter — alinhado com o que já existe no `recife-flats-sistema`.

---

## Estrutura de pastas

```
recife-flats/
├── index.html                  ← exemplo: home com hero+vídeo
├── apartamentos.html           ← exemplo: página interna sem hero
├── README.md
│
├── assets/
│   ├── images/                 ← fotos dos apartamentos, ícones SVG, etc.
│   ├── videos/                 ← vídeos do hero (MP4 + WebM otimizados)
│   └── fonts/                  ← (opcional) fontes self-hosted
│
├── styles/
│   ├── tokens.css              ← variáveis de design: cores, fontes, espaços
│   ├── base.css                ← reset, defaults do body, foco acessível
│   ├── utilities.css           ← .container, .eyebrow, .sr-only, .stack…
│   │
│   ├── components/             ← UM arquivo CSS por componente
│   │   ├── announcement.css
│   │   ├── button.css
│   │   ├── navbar.css
│   │   ├── menu-overlay.css
│   │   └── hero.css
│   │
│   └── pages/                  ← CSS específico de uma página (raro)
│       └── home.css
│
└── scripts/
    ├── main.js                 ← ponto de entrada. importa os componentes.
    │
    ├── components/             ← UM arquivo JS por Web Component
    │   ├── announcement.js     ← <rf-announcement>
    │   ├── navbar.js           ← <rf-navbar>
    │   ├── menu.js             ← <rf-menu>
    │   └── hero.js             ← <rf-hero>
    │
    ├── modules/                ← lógica reutilizável (futuro)
    │   └── (ex: scroll-effects.js, form-validation.js)
    │
    └── utils/                  ← helpers minimalistas
        ├── dom.js              ← $, $$, on, prefersReducedMotion
        └── split-text.js       ← quebra texto em letras pra animar
```

---

## Convenções

### Nomenclatura

- **Componentes JS**: prefixo `rf-` (Recife Flats) — `<rf-navbar>`, `<rf-hero>`.
  Web Components exigem hífen no nome.
- **Classes CSS**: padrão **BEM** — `.menu-overlay`, `.menu-overlay__link`,
  `.menu-overlay__link--active`.
- **Variáveis CSS**: kebab-case com prefixo de categoria — `--space-4`,
  `--fs-lg`, `--ease-out`, `--clay-light`.

### Ordem de carregamento do CSS

Sempre nessa ordem:

```html
1. tokens.css        ← define variáveis (não tem regras de visual)
2. base.css          ← reset + defaults globais
3. utilities.css     ← classes utilitárias (.container, etc.)
4. components/*.css  ← componentes (a ordem entre eles não importa)
5. pages/*.css       ← último, pode sobrescrever componentes da página
```

### Hierarquia de container

Todo conteúdo do site deve viver dentro de `.container`. Ele é a coluna
central de **1440px max**, com padding lateral fluido. É isso que faz
o início do menu, o logo, o hero, e qualquer seção abaixo ficarem
**verticalmente alinhados** na mesma "calha".

```html
<section>
  <div class="container">
    <!-- conteúdo aqui -->
  </div>
</section>
```

---

## Como criar um novo componente

Vamos criar um `<rf-footer>` como exemplo.

### 1. Crie o CSS

`styles/components/footer.css`:

```css
.footer {
  background: var(--ocean);
  color: var(--white);
  padding-block: var(--space-9);
}
.footer__grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-8);
}
```

### 2. Crie o Web Component

`scripts/components/footer.js`:

```js
class RFFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="footer">
        <div class="container footer__grid">
          <!-- conteúdo -->
        </div>
      </footer>
    `;
  }
}
customElements.define('rf-footer', RFFooter);
```

### 3. Registre em `main.js`

```js
import './components/footer.js';
```

### 4. Inclua o CSS no HTML

```html
<link rel="stylesheet" href="/styles/components/footer.css">
```

### 5. Use em qualquer página

```html
<rf-footer></rf-footer>
```

Pronto. Toda página que incluir o `main.js` e o CSS pode usar `<rf-footer>`.
Mudar o footer = mexer em **um** arquivo, e propaga para o site inteiro.

---

## Como funciona o menu (catálogo que abre virando)

O comportamento envolve **três** elementos coordenados:

1. **`<rf-navbar>`** — botão "Menu" dispara o evento global `rf-menu-toggle`.
2. **`<rf-menu>`** — escuta esse evento, abre/fecha sua própria timeline GSAP.
   Anima o `.site-content` (quem é definido pelo atributo `wraps=".site-content"`)
   com rotação 3D + escala + filtro, criando o efeito de página virando.
3. **`.site-content`** — todo o resto do site fica dentro dele.

A comunicação é via **CustomEvent** no `window`, sem acoplamento direto entre
os componentes:

```
[botão menu] → window: 'rf-menu-toggle' → [rf-menu] abre
[rf-menu] → window: 'rf-menu-state'   → [rf-navbar] sincroniza ícone
```

---

## Como funciona o hero com vídeo

```html
<rf-hero
  video="/assets/videos/recife-loop.mp4"
  video-webm="/assets/videos/recife-loop.webm"
  poster="/assets/images/hero-poster.jpg"
  title='Sua temporada em <em>Recife</em> começa por aqui'
  description="..."
  primary-href="#apartamentos"
  primary-label="Ver apartamentos">
  <ul slot="stats" hidden>
    <li data-num="4"   data-label="Apartamentos"></li>
    <li data-num="200+" data-label="Hóspedes felizes"></li>
    <li data-num="4.9" data-label="Nota média"></li>
  </ul>
</rf-hero>
```

### Dicas para o vídeo do hero

- **Formatos**: forneça WebM (VP9) e MP4 (H.264). WebM é menor; MP4 é fallback.
- **Tamanho-alvo**: ≤ 3 MB para o MP4 1080p. Comprima em [HandBrake](https://handbrake.fr/)
  com preset *Fast 1080p30* e mexa no bitrate até chegar perto disso.
- **Duração**: 8–15 segundos. Loop perfeito = primeiro e último frame iguais.
- **Sem áudio**: o `<video>` está `muted` (exigência de autoplay nos navegadores)
  e nem renderiza a faixa de áudio. Exporte sem áudio para economizar bytes.
- **Poster**: imagem estática do primeiro frame, otimizada (WebP, ~80kb).
  Aparece instantaneamente enquanto o vídeo baixa.
- **Mobile**: o atributo `playsinline` impede o vídeo de abrir em fullscreen
  no iOS. Já está incluído.

---

## Acessibilidade

- Toda imagem decorativa tem `aria-hidden="true"`.
- Botões têm `aria-label` quando o texto não é visível (ex: mobile).
- O menu é `role="dialog"` com `aria-modal="true"` e `aria-hidden` sincronizado.
- O foco recebe `outline: 2px solid var(--sand)` (definido em `base.css`).
- `prefers-reduced-motion` é respeitado: animações são desligadas (ver `tokens.css`).
- ESC fecha o menu.

---

## Performance

- **HTML, CSS, JS** servidos diretamente (sem build). Latência mínima.
- **GSAP via CDN** com cache compartilhado entre sites.
- **Fontes do Google** com `preconnect` para reduzir DNS lookup.
- **Lazy loading**: imagens não críticas devem usar `loading="lazy"`.
- **Web Components** só rodam quando seu elemento aparece no DOM.

---

## Próximos componentes sugeridos

- `<rf-apartment-card>` — card de apartamento (recebe dados via atributos
  ou fetch do Supabase).
- `<rf-testimonials>` — carrossel de depoimentos.
- `<rf-footer>` — rodapé global.
- `<rf-booking-form>` — formulário "Verificar disponibilidade" do print.
- `<rf-gallery>` — galeria de fotos de um apartamento.
