---
name: aia-design-system-010
description: Після 010 сайт стоїть на css/tokens.css + components.css + js/motion.js — де тепер живуть токени, як гаситься рух і що замінило 66 копій tailwind.config
metadata:
  type: project
---

**З 2026-09-07 (задача 010) дизайн-система живе у трьох спільних файлах, а не в
`css/custom.css`.** Стара мова (`custom.css`, 2535 рядків) лишається підключеною
**першою** до етапу 9 — саме вона тримає ще не мігровані сторінки читабельними.

**Why:** до 010 палітра була продубльована в 66 інлайнових `tailwind.config`, а токени
роадмапа й лендінга Термінала лежали в **глобальному `:root`** файла `custom.css` і
роздавались усім 66 сторінкам. Звідси колізія `--rail-w` 184/132 і 540 альфа-модифікаторів,
які після переходу теми на `var(--токен)` віддають `rgba(0,0,0,0)`.

**How to apply — де що шукати:**
- `css/tokens.css` — L1/L2 системні токени + `@property` (29 штук) + **рівно два рядки
  гасіння руху**: `@media (prefers-reduced-motion: reduce) { :root { --motion: 0;
  --loop-state: paused } }` і `html.rm { … }`. **Поіменного reduce-блока більше немає
  і заводити його не можна** — це пряма вимога системи (було 57 перевизначень).
- `css/components.css` — компоненти `ds-*` (+ `.rm-entry`, бо він потрібен на трьох сторінках).
- `js/tw-theme.js` — ОДИН `tailwind.config` на весь сайт, підключається після CDN.
- `js/motion.js` — `AIA.motion.on()/.dur()/.bind()`, єдиний власник `[data-reveal]`.
- Сторінкові токени: `--rm-*` **тільки** в `css/roadmap.css`, `--cc-*`/`--term-*` — у
  `css/claude-code.css` / `components.css`. Префікс завжди на першій позиції.

**Правило руху, яке замінило старе:** будь-яка тривалість = `calc(<число> * var(--dur-u))`,
зсув = `calc(<число> * var(--move-u))`, масштаб = `calc(1 ± var(--motion) * <дельта>)`.
Літерал `ms`/`px` у правилі руху = дефект. **Кожен складений токен, який читає JS, мусить
бути зареєстрований через `@property`** — інакше `getComputedStyle` віддає невирахуваний
рядок, `parseFloat` дає `NaN`, помічник бере fallback і рух лишається живим при
`prefers-reduced-motion` (П-01; на роадмапі перевірено: `--scrub` віддає рівно `"0"`).

**GSAP-файли — окремий випадок.** `gsap.matchMedia("(prefers-reduced-motion: reduce)")`
бачить **лише системну настройку** й не знає про `--motion`. Тому в кожному GSAP-файлі
мусять бути власні ворота `motionOn() { return num("--motion", 1) === 1 }` **перед**
`gsap.matchMedia()`, інакше `html.rm` і `data-motion="calm"` його не вимикають.

⚠ **`data-motion="calm"` НЕ вимикає рух** — він лишає `--motion: 1` і лише зменшує
`--motion-scale/travel/stagger` та ставить `--loop-state: paused`. `--loop-state` діє
тільки на CSS `animation-play-state`; **GSAP-цикли його не читають** (на роадмапі
перевірено: скелетонний shimmer стає, кільце «В роботі» продовжує пульсувати).

Повʼязане: [[aia-css-components]] · [[aia-roadmap-tokens-010]]
