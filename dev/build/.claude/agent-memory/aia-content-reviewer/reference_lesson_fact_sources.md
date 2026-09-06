---
name: lesson-fact-sources
description: Де перевіряти факти уроків «AI Термінал» і як швидко зняти живі докси (curl у скретчпад замість WebFetch)
metadata:
  type: reference
---

Три дозволені джерела фактів уроку (`lesson-contract.md` §7): живі докси
`code.claude.com/docs/en/*.md`, `dev/build/005-ai-terminal/00-research/screens/*.txt`,
власний читальний запуск команди.

**Швидкий спосіб зняти докси:** `curl -sL "https://code.claude.com/docs/en/<page>.md" -o <скретчпад>/docs/<page>.md`
і далі `grep` по файлах. Це на порядок швидше за WebFetch по одному твердженню:
одна сторінка = один запит, і потім десятки цитат звіряються локально й посимвольно.
Сторінки, які закривають більшість тверджень про встановлення й вхід:
`setup`, `authentication`, `cli-reference`, `troubleshoot-install`, `troubleshooting`,
`commands`, `permission-modes`, `vs-code`.

**Мапа «урок → фактура»** — `dev/build/005-ai-terminal/01-authoring/facts-map.md`
(увага: § у `facts-c01-c08.md` зсунуті на одиницю — рядок `c03` уроку живе в § `c02` фактури).
Знахідки авторів, які часто підтверджують числа в уроці, — `01-authoring/cross-findings.md`.

Перевірено 2026-09-06: цитати з доксів у `c03` збіглися дослівно; `brew info --cask claude-code`
досі віддає `2.1.236`, `claude-code@latest` — `2.1.261`, тобто розрив каналів у курсі не вигаданий.

**WebFetch не годиться для дослівних цитат.** Він проганяє сторінку через маленьку модель і
віддає переказ: блок помилок `errors.md` прийшов як `Context exceeds the ...-token limit by
... tokens`, а той самий рядок через curl — з числами й пунктуацією
(`Context exceeds the 200k-token limit by 94k tokens — run /compact or /clear to continue.`).
Рядок помилки, назву прапорця, ключ налаштувань — тільки curl + grep.

**Покажчик усіх сторінок:** `https://code.claude.com/docs/llms.txt`. Терміни курсу дослівно —
`glossary.md`; «токен ≈ 3,5 англійських символи» — не там, а в
`https://platform.claude.com/docs/en/about-claude/glossary.md`.

**Сторінки, які закривають тему контексту й компакції** (`c06`): рядки помилок контексту —
`errors.md` · thrashing і `Not enough messages to compact.` — `troubleshooting.md` + `costs.md` ·
таблиця «що переживає компакцію» й числа симуляції — `context-window.md` · «правка CLAUDE.md
посеред сесії не діє» і кеш — `prompt-caching.md` · пороги автокомпакції — `model-config.md` ·
перелік категорій `/context` — `debug-your-config.md` · діалог `Resume from a summary` —
`sessions.md` · `Summarize from/up to here` — `checkpointing.md`.

**Безпечна перевірка прапорця на живій збірці:** `claude --<прапорець> <значення> --version`
друкує версію й одразу виходить; докси прямо кажуть, що `--autocompact` перекриває збережене
налаштування лише на цей запуск, не змінюючи його. Так на 2.1.263 дослівно відтворились обидва
екрани `c06`, зняті на 2.1.236 (розійшовся тільки номер версії).

**Сторінки, які закривають тему сесій, історії й відкату** (`c09`): визначення сесії,
пікер із клавішами, `/branch`, `Resume from a summary`, шлях `~/.claude/projects/<project>/<id>.jsonl`
і таблиця «Permission mode on resume» — `sessions.md` · чекпойнти, шість пунктів меню `/rewind`,
межі (bash, субагенти, symlink) — `checkpointing.md` · **усе про вміст `~/.claude`** —
`claude-directory.md`: `history.jsonl` («Every prompt you've typed…»), `file-history/`
(«Checkpoint restore for past sessions»), розділ `Plaintext storage` («not encrypted at rest»)
і повний приклад виводу `claude project purge --dry-run` · дослівні тексти помилок
(`No conversation found with session ID` з чотирма причинами, `Restored the code, but skipped N
files…` повним реченням) — `errors.md` · псевдоніми слеш-команд (`/rewind` = `/checkpoint`,
`/undo`; `/resume` = `/continue`; `/clear` = `/reset`, `/new`) — `commands.md` ·
`cleanupPeriodDays` (мінімум 1, `0` не проходить валідацію) — `settings-reference.md` ·
історія вводу по папках і `Ctrl+R` — `interactive-mode.md`, розділ «Command history».

**Безпечна перевірка помилки відновлення:** `claude --resume <неіснуючий-uuid> </dev/null` не
запускає сесії — друкує рядок помилки й виходить із кодом 1 (перевірено на 2.1.263).

Пов'язане: [[content-review-008]]
