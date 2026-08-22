# Атрибуція вендорених скілів

Скіли в цій папці — **не наш код**. Це копії сторонніх відкритих скілів, які лежать
у репозиторії, щоб `git clone` на будь-якому ноутбуці одразу давав робочий конвеєр
без окремого кроку встановлення. Походження й хеші файлів веде `../../skills-lock.json`.

Репозиторій `github.com/AndriyPuhalsky/ai-academy` публічний, тому копії тут
розповсюджуються далі — а MIT вимагає зберігати копірайт і текст ліцензії. Цей файл
і є виконанням цієї умови.

Перевірено 2026-08-22 через GitHub API + `raw.githubusercontent.com`.

## Джерела

| Скіл | Апстрім | Ліцензія | Правовласник |
| ---- | ------- | -------- | ------------ |
| `accessibility` | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) | MIT | Addy Osmani |
| `performance` | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) | MIT | Addy Osmani |
| `animation-vocabulary` | [emilkowalski/skills](https://github.com/emilkowalski/skills) | MIT | Emil Kowalski |
| `find-animation-opportunities` | [emilkowalski/skills](https://github.com/emilkowalski/skills) | MIT | Emil Kowalski |
| `improve-animations` | [emilkowalski/skills](https://github.com/emilkowalski/skills) | MIT | Emil Kowalski |
| `review-animations` | [emilkowalski/skills](https://github.com/emilkowalski/skills) | MIT | Emil Kowalski |
| `extract-design-system` | [arvindrk/extract-design-system](https://github.com/arvindrk/extract-design-system) | MIT | Arvind |
| `gsap-core` | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | MIT | GreenSock |
| `gsap-timeline` | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | MIT | GreenSock |
| `gsap-scrolltrigger` | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | MIT | GreenSock |
| `gsap-plugins` | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | MIT | GreenSock |
| `gsap-performance` | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | MIT | GreenSock |

Зміни з нашого боку: жодних. Файли лежать як є, побайтово — саме тому `skills-lock.json`
тримає `computedHash`. Якщо колись доведеться правити скіл під себе — не правити копію
всередині, а зробити свій окремий скіл у `.claude/skills/`, інакше хеш розійдеться
й буде незрозуміло, де наше, а де апстрімне.

Оновлювати ці копії: `npx skills add <owner/repo@skill> -y` з папки `dev/design/`
(**без** `-g` — інакше поїде в `~/.claude/`). Після оновлення звірити цю таблицю
з новим `skills-lock.json`.

## Окремо: `web-design-guidelines` (Vercel) — у гіт не їде

`vercel-labs/agent-skills` **не має жодної ліцензії** — ні поля `license` в GitHub API,
ні файлу `LICENSE` у корені репозиторію (перевірено 2026-08-22). За замовчуванням це
означає «всі права збережено»: використовувати локально можна, а розповсюджувати копію
в нашому публічному репозиторії — формально не можна.

Тому цей скіл:
- **лишається локально** й далі працює в конвеєрі (`.claude/skills/web-design-guidelines`);
- **виключений з гіта** — зроблено кореневою сесією в коміті `ecb39af`, правила в кореневому
  `.gitignore` (рядки 13–14). Перевірено незалежно: `git ls-files | grep web-design-guidelines`
  віддає лише handoff-документ, `git check-ignore -v` підтверджує обидва правила, симлінк
  на диску цілий;
- **на новому ноутбуці його треба поставити окремо** — `git clone` його не принесе:
  `npx skills add vercel-labs/agent-skills@web-design-guidelines -y` з папки `dev/design/`.

Якщо Vercel колись додасть LICENSE — можна повернути в гіт і дописати в таблицю вище.

## MIT License

Стосується всіх скілів з таблиці вище. Правовласники — за колонкою «Правовласник»
(Copyright (c) 2026 Addy Osmani; Copyright (c) 2026 Emil Kowalski;
Copyright (c) 2026 Arvind; Copyright (c) 2026 GreenSock).

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
