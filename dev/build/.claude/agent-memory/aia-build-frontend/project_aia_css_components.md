---
name: aia-css-components
description: Що вже є в css/custom.css і за якими конвенціями — щоб не дублювати компоненти й токени в наступних задачах
metadata:
  type: project
---

`css/custom.css` (станом на 2026-08-24, ~1600 рядків) містить **дві системи, які треба не
переплутати**:

1. **Стара частина (рядки 1–620)** — літерали хексів прямо в правилах (`#D97757`, `#3A342E`).
   Сімʼї: `.skip-link`, `.hero-glow`, `.caret`, `.reveal`, `.badge*`, `.prose-aia*`,
   `.callout*` (є `.callout-sand`), `.tokens`, `.diagram*`, `.module-sidebar`, `.snav-*`,
   `.mnav*`, `.quiz-*`, `.example*`, `.lesson-no`.
2. **Частина задачі 001 (з рядка 624)** — усе через `var(--…)`, значення живуть в одному
   `:root` (порт `dev/design/001-oauth-google/04-variants/shared/tokens.css`).
   Сімʼї: `.slot*` (слот авторизації в шапці), `.sk*` (скелетон), `.aia-scrim/.aia-card/…`
   (модалка входу), `.gbtn*` (кнопка Google), `.aia-panel*` (панель помилки OAuth),
   `.paper*` + `.paper-warn` (прев'ю сертифіката), `.sheet*` (мобільний аркуш акаунта),
   `.aia-actions/.aia-text-btn`, `.sr-only`, `@keyframes aia-*` (8 штук).

**Why:** нові екрани мають складатись із наявного, а не заводити третю систему імен.
Перед новим класом — `grep` по обох частинах.

**How to apply:**
- нові токени класти **в той самий `:root`** блоку 001, не заводити другий;
- розмітка модалки/діалогів **не в HTML і не в `js/auth.js`**, а в `js/auth-ui.js`
  (шар вигляду, підключається класичним `<script>` перед модулем `js/auth.js`);
- палітра Tailwind продубльована **в 38 HTML** (`tailwind.config` у кожному), формати
  запису різні (3 варіанти форматування) — правити **тільки скриптом** з `grep -c` до і після;
  файлів із `js/auth.js` і слотом `#aiaAuth` — **37** (38-й, `verify.html`, свідомо без auth);
- `.slot__real { display: contents }` — на такий елемент CSS-анімація не діє (немає бокса);
- Tailwind CDN не генерує класи, які трапляються лише в динамічній розмітці
  (`sr-only` тому продубльований у `css/custom.css`).

Повʼязане: [[aia-frontend-verification]]

**Третя частина, з 2026-08-26 (задача 003 «Роадмап»)** — теж уся через `var(--…)`, але
токени лежать **в окремому іменованому блоці `:root`** нижче за блок 001, плюс два
брейкпойнти (`max-width: 1023px`, `max-width: 640px`) відразу під ним:
- **85 токенів** роадмапу (`--c-trail-*`, `--c-now-*`, `--fs-hero/h2/lead/item/desc/count/meta`,
  `--rail-w`, `--trail-x`, `--meta-w`, `--amp-done/now/ahead/lead`, `--node-*`, `--row-gap-*`,
  `--e-slow`, `--e-count`, `--e-breath`, `--dur-line/count/row-*/outro/pulse/pulse-in`,
  `--stag-*`, `--move-row/hero/arrow/outro`, `--scale-pulse`, `--opacity-pulse`,
  `--scrub-trail/outro`, `--hero-reserve`, `--sk-rows`);
- **один компонент — `.rm-entry`** (+`__arrow`, `__rule`, `__label` без правил). Він тут, а
  не в `css/roadmap.css`, бо потрібен на **трьох** сторінках: `index.html`, `architect.html`,
  `roadmap.html`;
- решта ~186 правил роадмапу (`.rm-head`, `.rm-hero`, `.rm-trail`, `.rm-sec`, `.rm-row`,
  `.rm-group`, `.rm-outro`, `.rm-sk`, `.rm-panel`, `.rm-void`, `.rm-cta`, `.rm-chan`) —
  **в окремому `css/roadmap.css`**, який підключений ТІЛЬКИ на `roadmap.html`, і **після**
  `custom.css` (це важливо: він перевизначає токени в `@media (max-height: 700px)`).

**Правило, яке легко зламати:** блок `@media (prefers-reduced-motion: reduce)` у
`css/custom.css` **не автоматичний** — кожен новий токен тривалості/затримки/зсуву/масштабу
треба дописати туди руками, бо `js/roadmap-motion.js` читає ті самі змінні через
`getComputedStyle`, і саме це обнулення вимикає GSAP. Механічна перевірка перед комітом:
кожен токен із префіксами `--dur-|--stag-|--delay-|--move-|--scale-|--opacity-|--scrub-`
із нового блоку мусить знайтись у reduce-блоці.

**Число «38 файлів палітри» уточнене:** `grep -rl 'tailwind.config' --include='*.html' .`
(без `dev/`) дає **44** файли після появи `roadmap.html`. Правити скриптом, як і досі.
