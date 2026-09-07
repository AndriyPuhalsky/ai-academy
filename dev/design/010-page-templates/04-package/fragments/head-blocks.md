# Дослівні блоки `<head>`, `<html>` і кінця `<body>`

Порядок обовʼязковий: **токени → компоненти → сторінковий файл → Tailwind CDN → тема**.
Tailwind іде **після** наших `<link>` навмисно: так його утиліти перебивають компонент там,
де верстка справді хоче виняток. Ціна цього рішення описана в `docs/P4-traps.md`, пастка 2.

---

## 1. Для сторінок у корені
(3 лендінги · 3 довідники · `roadmap.html` · `verify.html` · `certificate.html` — 9 файлів)

```html
  <script>document.documentElement.classList.add("js");</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <!-- Латиниця вантажиться СВІДОМО: український апостроф ʼ (U+02BC) лежить у
       латинській підмножині Google Fonts, а не в кириличній. -->
  <link href="https://fonts.googleapis.com/css2?family=Prata&family=Golos+Text:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/components.css">
  <!-- сторінковий файл — ТІЛЬКИ там, де він є: -->
  <!-- <link rel="stylesheet" href="css/roadmap.css"> -->
  <!-- <link rel="stylesheet" href="css/claude-code.css"> -->

  <script src="https://cdn.tailwindcss.com"></script>
  <script src="js/tw-theme.js"></script>
```

## 2. Для 57 сторінок у `modules/`

Той самий блок, усі локальні шляхи з `../`:

```html
  <script>document.documentElement.classList.add("js");</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prata&family=Golos+Text:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="../css/tokens.css">
  <link rel="stylesheet" href="../css/components.css">

  <script src="https://cdn.tailwindcss.com"></script>
  <script src="../js/tw-theme.js"></script>
```

**Що при цьому зникає з кожного `<head>`:** інлайновий `<script>tailwind.config = {…}</script>`
(66 копій), `<link>` на `css/custom.css`, `@import` шрифтів усередині CSS.

---

## 3. Атрибути `<html>` — замість `class="scroll-smooth"`

| Сторінки | `<html …>` |
| -------- | ---------- |
| `index.html` | `lang="uk" data-config="config.json" data-course="academy" data-density="landing" data-lit` |
| `modules/module-*.html` | `lang="uk" data-config="../config.json" data-course="academy" data-density="lesson" data-lit` |
| `architect.html` | те саме з `data-course="architect"` |
| `modules/architect-*.html` | те саме з `data-course="architect"`, `data-density="lesson"` |
| `claude-code.html` + `modules/claude-code-*.html` + 3 довідники | те саме з `data-course="terminal"` |
| `roadmap.html` | `data-course="academy"` **за замовчуванням**; `js/roadmap-render.js` перемикає його разом із брендом за `?from=` |
| `certificate.html` | `data-course="academy" data-density="lesson" data-lit` |
| `verify.html` | `data-course="academy" data-density="lesson"` — **`data-lit` НЕ ставиться** |

**Чому на `verify.html` немає `data-lit`.** Там єдиний `<input>` сайту, і саме на полі
ефект «світло згори» вже раз провалив SC 1.4.11 (контраст межі 2.22 при порозі 3:1,
дефект D-03 задачі 009). Це не забудькуватість — це рішення.

**`data-motion` не ставиться взагалі**: дефолт `standard`.

**`<body>` більше не має класів.** `bg-ink font-sans text-ivory antialiased` видаляється:
усе це робить `tokens.css` / `components.css` на `:root` і `body`.

---

## 4. Порядок скриптів наприкінці `<body>`

Змінюється у трьох місцях, решта лишається як є:

1. **`js/motion.js` підключається ПЕРШИМ із наших скриптів** на кожній сторінці — до
   `ui.js`, `config.js`, `module.js`, `*-render.js`. Причина: усі вони наприкінці свого
   `render()` викликають `AIA.motion.bind(root)`. Якщо `motion.js` іще не завантажений,
   виклику не буде, а помилки в консолі — теж (перевірка `window.AIA` тиха).
2. **`js/mermaid-theme.js`** — перед `js/mermaid-init.js` і **після** бібліотеки Mermaid.
3. **GSAP** (три файли 3.13.0 з jsDelivr) лишається рівно там, де є: `roadmap.html` і
   `claude-code.html`. **На уроки GSAP не додається** — щільність `lesson` його не потребує
   (заміряно: ScrollTrigger 0, циклів 0 на всіх 57 сторінках).

Приклад для уроку:

```html
  <script src="../js/motion.js"></script>
  <script src="../js/auth.js"></script>
  <script src="../js/auth-ui.js"></script>
  <script src="../js/ui.js"></script>
  <script src="../js/progress.js"></script>
  <script src="../js/module.js"></script>
  <script src="../js/quiz.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
  <script src="../js/mermaid-theme.js"></script>
  <script src="../js/mermaid-init.js"></script>
```
