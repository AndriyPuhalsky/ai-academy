---
name: auth-js-split-contract
description: js/auth.js was split into auth.js (backend, data) + auth-ui.js (frontend, markup) so the two agents never touch the same file
metadata:
  type: project
---

Рішення плану 001 (2026-08-23): `js/auth.js` розрізано навпіл.

- `js/auth.js` — **бекендер**: Supabase, сесія, OAuth, ім'я як дані, `window.AIAAuth`.
  Нуль HTML-рядків.
- `js/auth-ui.js` — **фронтендер, новий файл**: уся розмітка, фокус, рух, стани,
  `window.AIAAuthUI`. Нуль звернень до `window.sb`.

Підключення в 37 HTML: `<script src="js/auth-ui.js">` (класичний, виконується одразу)
**перед** `<script type="module" src="js/auth.js">` (модуль відкладений за специфікацією),
тому `window.AIAAuthUI` гарантовано існує на момент `boot()`.

**Why:** зони запису в `dev/build/CLAUDE.md` віддають `js/auth.js` бекендеру, а HTML/CSS/
«JS інтеракцій» — фронтендеру. Але старий `auth.js` змішував і дані, і вигляд, тож обидва
агенти мусили б його переписувати → гарантований конфлікт при мержі й втрата паралельності,
на якій тримається весь конвеєр.

**How to apply:** цей самий прийом брати щоразу, коли один файл потрапляє в дві зони —
різати по межі «дані ↔ вигляд» і описувати інтерфейс між половинами в контракті даних,
а не домовлятись постфактум. Плюс завжди фіксувати **порядок push**: сторона, чия
половина адитивна (тут — фронтендер), пушить першою; сторона, чия половина без другої
не працює, пушить другою і перевіряє
`git fetch origin dev && git cat-file -e origin/dev:<файл-партнера>`.

Пов'язане: [[design-handoff-source-of-truth]]
