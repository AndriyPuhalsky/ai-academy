---
name: reference-lesson-verification
description: Чим перевіряти урок «AI Терміналу» і чому екрани з 2026-09-04 більше не відтворюються дослівно
metadata:
  type: reference
---

**Перевірки уроку (запускати з кореня `AIA`):**
- `python3 dev/build/005-ai-terminal/01-authoring/check-lessons.py` — усі 23 сторінки курсу:
  заборонені звороти, розкид `answer`, довжина варіантів. Базовий стан на 2026-09-06:
  падає лише `claude-code-23.html` (найдовша правильна 10/26); «просто» світиться в
  `c03, c04, c06, c08, c12, c16, c17`. Нові помилки по своєму файлу — це твоє.
- `python3 dev/build/007-quiz-distractors/check-quiz.py --files <файл>` — числа по квізу
  одного уроку; `--verify dev/build/007-quiz-distractors/baseline.json` — що квізи не зачеплені.
- Дослівні екрани курсу: `dev/build/005-ai-terminal/00-research/screens/*.txt` (55 файлів,
  зняті 2026-09-03 зі stable-збірки).
- Живі докси: `curl -sL https://code.claude.com/docs/en/<сторінка>.md`. WebFetch великі
  сторінки обрізає; стара адреса `docs.claude.com/en/docs/claude-code/` дає 301.

**Пастка перевірки фактів: машина автора зʼїхала.** Уроки писались 2026-09-03/04 на
`claude` зі stable-каналу — `2.1.236`, `which claude` → `/opt/homebrew/bin/claude`. Станом
на 2026-09-06 на цій же машині стоїть native-збірка: `2.1.263`,
`which claude` → `~/.local/bin/claude`. Тобто **екрани з `/opt/homebrew/bin` і `2.1.236`
дослівно не відтворюються** — це датований знімок, а не помилка автора. Що досі
відтворюється точно: `sw_vers` → macOS 26.5.2, `zsh 5.9`, `cat /etc/paths` (6 рядків),
повідомлення zsh про помилки. Див. [[task-008-terminal-content-review]].
