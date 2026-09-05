---
name: feedback-reference-method
description: Як робити добірки для цього проєкту — вимірювати CSS у браузері, писати дані на диск по ходу, будувати власні лабораторії
metadata:
  type: feedback
---

Три методи, які на 005 дали найбільше цінності на одиницю зусиль.

**Why:** у 003 попередник упав на API-ліміті на кроці збирання сторінки, і врятувало те, що дані
лежали окремим файлом. А описи руху «на око» власник читати не буде — він просив конкретики.

**How to apply:**

1. **Міряти, а не описувати.** Через `mcp__claude-in-chrome__javascript_tool` пройтись по
   `document.querySelectorAll('*')`, зібрати `transitionProperty/Duration/TimingFunction`,
   `animationName/Duration/IterationCount/Delay`, `borderRadius`, mono-шрифти, і вивести топ за
   частотою. Це дає точні криві й тривалості замість «гарно зʼявляється».
   **Обовʼязково відфільтрувати `claude-pulse 2s ease-in-out infinite`** — це анімація самого
   розширення Chrome, вона є на КОЖНІЙ сторінці й не належить сайту.
2. **Дані на диск по ходу, сторінка в кінці.** `data.js` (module.exports) + `build.js` → `index.html`.
   Схема з 003, спрацювала і на 005.
3. **Власна лабораторія б'є будь-яку статтю.** Написати HTML із варіантами прийому, підняти
   `python3 -m http.server`, відкрити `localhost` браузером (localhost розширенням дозволений) і
   заміряти різницю. На 005 це знайшло два дефекти, яких немає в жодній статті.
   `file://` не відкривається — потрібен http-сервер.

**Обмеження середовища:** частина доменів заблокована розширенням (`charm.sh`, `bun.com`,
`frontendmasters.com`, `inkandswitch` частково) — `navigate` віддає «Navigation to this domain is
not allowed» або `screenshot` — «Permission denied». Обходу немає, треба чесно писати в звіті.
Сайти з `scroll-behavior: smooth` не стрибають від `window.scrollTo` — потрібен
`scrollTo({behavior:'instant'})`, а сайти з IntersectionObserver-reveal вимагають покрокового
скролу, інакше секції лишаються порожніми.
