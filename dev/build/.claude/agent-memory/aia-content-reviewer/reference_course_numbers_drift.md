---
name: course-numbers-drift
description: Числа й тексти курсу «AI Термінал» (62 опції, 13 підкоманд, 19 контекстів, хелп `mcp add`/`add-json`) зняті на 2.1.236 і вже розійшлись із живою збіркою 2.1.263 — перевірено 2026-09-06
metadata:
  type: reference
---

Курс писався на Claude Code **2.1.236** (2026-09-03/04). Перевірено власним запуском
2026-09-06 на живій збірці **2.1.263** (`~/.local/bin/claude`) — чотири числа вже інші:

| що | у курсі (2.1.236) | наживо (2.1.263) |
| --- | --- | --- |
| опцій у `claude --help` | 62 | **65** |
| підкоманд у розділі `Commands` | 13 | **18** |
| контекстів у `keybindings.json` | 19 | **20** (додано `DiffPanel`, потребує v2.1.260) |
| `claude --restricted --zzz-bogus` | `unknown option '--restricted'` | скарга на `--zzz-bogus` — прапорець **зʼявився** |
| подій у переліку `claude doctor` | 31 | **33** — `PreModelSwitch` і `PostModelSwitch` дійшли (докси вимагали v2.1.251+) |
| `strings` по бінарнику: збігів на `PreModelSwitch` | 0 | **39** |
| те саме на `InstructionsLoaded` | 21 | **14** |
| вкладок у панелі `/plugin` | 4 (Discover, Installed, Marketplaces, Errors) | **5** — додано **Stats** (звіт `/skill-doctor`, потребує v2.1.252); джерело `discover-plugins.md` |
| рядків у таблиці «All settings» доксів | 222 (03.09) → 223 (04.09) | **225** (06.09); нові — `bashOutputMaxChars` і `taskOutputMaxChars` (обидва `Any file`, тема «Memory and context», v2.1.261+) |
| `keybindingFlavor` | робочий ключ, «потрібна 2.1.238+» | **Deprecated since v2.1.261 and has no effect** — діяв лише у v2.1.238–2.1.260; у бінарнику 2.1.263 ще є (4 збіги), але нічого не робить |
| `strings` на `blockReadsOutsideWorkingDirectories` | 0 (ключа не існувало) | **49** — ключ доїхав, докси вимагають v2.1.257+ |
| рядків у таблиці доксів «What runs before you trust a folder» | 7 (як пише `c22`) | **6** (`permissions.md`, 06.09) |
| `-H, --header` у `claude mcp add --help` | `Set WebSocket headers` (пастка курсу `c18`) | **`Set headers for HTTP/SSE servers`** — підказку виправили |
| опис `claude mcp add-json` | `(stdio or SSE)` | **`(stdio, SSE, HTTP, or WebSocket)`** — тепер сам хелп підтверджує шлях для `ws` |
| текст `claude doctor` на зламаному JSON | `Invalid or malformed JSON` | **`Expected object, but received undefined`** — однаково для зайвої коми, `//`, відсутньої дужки й сміття |
| рядків у таблиці «All commands» доксів | 111 (03.09 і 04.09) | **112** (06.09) — додано `/skill-doctor` (потребує v2.1.252 + feature-flag fetching) |
| назви нових підкоманд `claude` | — | `attach <id>`, `logs <id>`, `respawn`, `rm <id>`, `stop\|kill <id>` — керування фоновими сесіями винесене з `claude agents` в окремі підкоманди |

Що досі відтворюється дослівно: `claude --advisor --zzz-bogus` →
`Error: The model "--zzz-bogus" cannot be used as an advisor.`; `claude --hlep` →
`error: unknown option '--hlep'` + `(Did you mean --help?)`.

**Як застосовувати.** Це **не дефект автора** — курс свідомо є датованим знімком
(див. [[reference-lesson-verification]]). Дефект — коли число подане **без прив'язки до
дати чи версії**: тоді читач через півроку вважатиме його поточним. У `c05` таке
формулювання виправлено переносом «звірено 4 вересня 2026 року» на всі три числа вступу.
Окремий підвид: **вправа з жорстко зашитим результатом**. У `c17` читачеві пропонували
запустити `claude --restricted --zzz-bogus` і побачити «прапорця немає» — на будь-якій
збірці від 2.1.248 це вже неправда. Виправлено формулюванням «відповідь залежить від твоєї
збірки», без вилучення вправи.

Число «19 контекстів» **лишилось тільки в `c05`** (двічі: вступ і блок «часті питання»):
довідник `claude-code-ref-commands.html` і `claude-code.config.json` уже кажуть **20**, і це
підтверджено живими доксами 2026-09-06 — у таблиці `keybindings.md` рівно 20 рядків, а дій
120 у 23 групах (112 унікальних імен). Тобто розходиться саме урок, а не довідник.

**Перелік hook-подій знімається однією читальною командою** (`c16`): у порожній теці
`/private/tmp/<щось>/.claude/settings.json` написати подію з одруківкою (`PreToolUseX`) і
запустити `claude doctor` — він друкує `Unknown hook event ... Valid events: …` з **повним**
переліком того, що знає саме ця збірка. Так само відтворюється й друга помилка уроку
(`matcher` списком), але текст її на 2.1.263 уже інший: `Expected string, but received
undefined` + окремий рядок-попередження, замість `received array` на 2.1.236.
Пастка з уроку теж жива: `No installation issues found.` друкується в кінці **навіть тоді**,
коли вище стоїть `Invalid settings`.

**Що в `claude doctor` стабільне між 2.1.236 і 2.1.263, а що ні** (перевірено 2026-09-06,
`c13`): стабільні — заголовок розділу `Invalid settings`, повний шлях до файла, формат
`<шлях> › <ключ>: <повідомлення>` + рядок `Suggested fix:`, і дослівний текст помилки
значення (`cleanupPeriodDays: Number must be greater than or equal to 0` разом із порадою
про `3650` відтворився **побайтово**). Змінився лише текст помилки **розбору** JSON.
Наслідок для рецензії: вправа «зламай файл і подивись на екран» має вести читача до
розділу `Invalid settings`, а не до конкретного рядка помилки.

**Що в `claude mcp` НЕ зʼїхало** (2.1.263): 11 підкоманд ті самі; `-t, --transport` досі
`(stdio, sse, http)`; помилка `Invalid transport type: ${e}. Must be one of: stdio, sse, http
(or streamable-http)` і `Cannot add MCP server "${e}": this name is reserved.` — у бінарнику
дослівно. Тобто вся конструкція уроку `c18` про WebSocket жива.

Швидка перевірка чисел (читальна, сесію не запускає):
`claude --help | grep -cE '^  -'` · `claude --help | sed -n '/^Commands:/,$p' | grep -cE '^  [a-z]'`.
