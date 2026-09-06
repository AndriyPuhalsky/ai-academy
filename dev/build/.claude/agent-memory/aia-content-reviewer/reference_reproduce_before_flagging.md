---
name: reproduce-before-flagging
description: Підозрілий рядок у .term-блоці спершу відтворити локальним запуском, і лише потім називати вигаданим — CLI друкує довгі «людські» речення
metadata:
  type: reference
---

Перш ніж записати екран у «непідтверджені факти», **відтвори команду сам** у
`/private/tmp/<щось>` — навіть якщо рядок виглядає як дописане автором пояснення.

**Why:** у `c15` (2026-09-06) вивід `claude plugin validate .claude/agents` містив речення
`YAML Parse error: Unexpected character. At runtime this agent does not load at all — with no
frontmatter name it is treated as a co-located reference document and skipped.` — воно
читається як авторський коментар англійською, і я був за крок від того, щоб позначити його
вигаданим. Локальний запуск на 2.1.263 дав **побайтово той самий рядок**, включно з тире й
кінцівкою про «co-located reference document». Claude Code справді друкує довгі пояснювальні
речення в помилках.

**How to apply:** зроби теку з файлами-зразками (правильний · зламаний YAML · без `description`
· без `name`), запусти команду, звір рядок у рядок і код виходу (`echo $?`). Тут же
підтверджуються супутні твердження уроку: `exit 1` на помилку, `exit 0` на попередження,
і те, що файл без `name` перевірка **не називає взагалі**. Так само дешево перевіряються
`claude agents --json --cwd /tmp` → `[]` і `strings "$(which claude)" | grep -c <КЛЮЧ>`
з контрольною вигаданою назвою.

⚠️ Зламаний YAML для демо треба робити справді зламаним: `name: [broken` парситься мовчки,
а `name: "unclosed` дає потрібну помилку.

Пов'язане: [[lesson-verification]], [[lesson-fact-sources]].
