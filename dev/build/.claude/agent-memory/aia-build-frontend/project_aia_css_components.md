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
