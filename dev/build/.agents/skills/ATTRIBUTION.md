# Атрибуція вендорених скілів

Скіли в цій папці — **не наш код**. Це копії сторонніх відкритих скілів, які лежать
у репозиторії, щоб `git clone` на будь-якому ноутбуці одразу давав робочий конвеєр
без окремого кроку встановлення. Походження й хеші файлів веде `../../skills-lock.json`.

Репозиторій `github.com/AndriyPuhalsky/ai-academy` публічний, тому копії тут
розповсюджуються далі — а MIT вимагає зберігати копірайт і текст ліцензії. Цей файл
і є виконанням цієї умови.

Перевірено 2026-08-23 через GitHub API (`api.github.com/repos/<owner>/<repo>` → `spdx_id`).

## Джерела

| Скіл | Кому потрібен | Апстрім | Ліцензія | Правовласник |
| ---- | ------------- | ------- | -------- | ------------ |
| `writing-plans` | PM | [obra/superpowers](https://github.com/obra/superpowers) | MIT | Jesse Vincent |
| `brainstorming` | PM | [obra/superpowers](https://github.com/obra/superpowers) | MIT | Jesse Vincent |
| `spec-driven-development` | PM | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | MIT | Addy Osmani |
| `documentation-and-adrs` | PM | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | MIT | Addy Osmani |
| `supabase` | бекенд | [supabase/agent-skills](https://github.com/supabase/agent-skills) | MIT | Supabase |
| `supabase-postgres-best-practices` | бекенд | [supabase/agent-skills](https://github.com/supabase/agent-skills) | MIT | Supabase |
| `security-and-hardening` | бекенд | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | MIT | Addy Osmani |
| `deno` | бекенд | [denoland/skills](https://github.com/denoland/skills) | MIT | Deno Land Inc. |
| `systematic-debugging` | бекенд | [obra/superpowers](https://github.com/obra/superpowers) | MIT | Jesse Vincent |
| `gsap-core` | фронтенд | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | MIT | GreenSock |
| `gsap-timeline` | фронтенд | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | MIT | GreenSock |
| `gsap-scrolltrigger` | фронтенд | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | MIT | GreenSock |
| `animation-vocabulary` | фронтенд, QA | [emilkowalski/skills](https://github.com/emilkowalski/skills) | MIT | Emil Kowalski |
| `accessibility` | фронтенд, QA | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) | MIT | Addy Osmani |
| `performance` | фронтенд, QA | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) | MIT | Addy Osmani |
| `browser-testing-with-devtools` | QA | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | MIT | Addy Osmani |
| `web-quality-audit` | QA | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) | MIT | Addy Osmani |
| `review-animations` | QA | [emilkowalski/skills](https://github.com/emilkowalski/skills) | MIT | Emil Kowalski |
| `verification-before-completion` | QA | [obra/superpowers](https://github.com/obra/superpowers) | MIT | Jesse Vincent |

Зміни з нашого боку: жодних. Файли лежать як є, побайтово — саме тому `skills-lock.json`
тримає `computedHash`. Якщо колись доведеться правити скіл під себе — не правити копію
всередині, а зробити свій окремий скіл, інакше хеш розійдеться й буде незрозуміло,
де наше, а де апстрімне.

## Свідомо НЕ поставлені

- **`vercel-labs/agent-skills@web-design-guidelines`** — у репозиторію немає ліцензії
  (перевірено 2026-08-22: `license: null` у GitHub API, файлу `LICENSE` немає), тобто
  «всі права збережено». Локально користуватись можна, розповсюджувати копію в публічному
  репозиторії — ні. Дизайн-майстерня його використовує з виключенням із гіта
  (`dev/design/.agents/skills/web-design-guidelines/` у кореневому `.gitignore`); сюди
  його не тягнемо, щоб не заводити другу таку виїмку. Фронтендер тут — столяр за готовим
  макетом, гайдлайни візуального дизайну йому й не потрібні.
- **`extract-design-system`, `find-animation-opportunities`, `improve-animations`,
  `gsap-plugins`, `gsap-performance`** — це інструменти *проєктування* дизайну, вони
  живуть у `dev/design/`. Тут вони підштовхували б фронтендера вигадувати замість втілювати.

## Як додати ще один

```bash
cd /Users/ander1.sage/Downloads/AIA/dev/build
npx skills add <owner/repo@skill> -y        # БЕЗ -g, інакше поїде в ~/.claude/
curl -s https://api.github.com/repos/<owner>/<repo> | grep spdx_id
```

Немає ліцензії — **не комітити**, лишити локально й додати виїмку в кореневий `.gitignore`.
Після встановлення — дописати рядок у таблицю вище й звірити `skills-lock.json`.

## MIT License

Стосується всіх скілів з таблиці вище. Правовласники — за колонкою «Правовласник»
(Copyright (c) 2026 Jesse Vincent; Copyright (c) 2026 Addy Osmani;
Copyright (c) 2026 Supabase Inc.; Copyright (c) 2026 Deno Land Inc.;
Copyright (c) 2026 GreenSock; Copyright (c) 2026 Emil Kowalski).

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
