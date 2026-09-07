---
name: method-mermaid-mass-audit
description: Як за хвилини зміряти всі 100 діаграм Mermaid одразу — один документ-стенд замість 58 iframe; і чому iframe НЕ годиться для нативного шляху Mermaid
metadata:
  type: reference
---

# Масовий аудит діаграм Mermaid: стенд в одному документі

## Швидкий шлях (перевірено 2026-09-08, задача 010)

Не вантажити 58 сторінок по iframe (≈3 с кожна, тайм-аут CDP 45 с ⇒ 4 сторінки за виклик).
Замість цього:

1. Стати на будь-яку **сторінку модуля** превʼю — вона вже має `mermaid`, `AIA.mermaidTheme`,
   `tokens.css`, `components.css`.
2. `fetch()` усі 58 URL (тільки HTML, без сабресурсів) → `DOMParser` → зібрати `pre.mermaid`
   textContent. 58 фетчів ≈ 5 с.
3. Побудувати офскрін-стенд з ТІЄЮ Ж ієрархією, що на сторінці:
   `main > article.ds-prose > section > div.ds-diag > pre.mermaid`.
4. Ширина `main` → ширина `.ds-diag`: **768 → 766 (вʼюпорт 1440) · 704 → 702 (768) ·
   350 → 348 (390)**. Ці три значення однакові для всіх трьох курсів.
5. Рендерити **послідовно з `await`** (див. [[project_mermaid_id_collision]]) і міряти.

100 діаграм за ~2 виклики. Валідація: 20 реальних сторінок превʼю проти стенда —
ширина SVG збіглася до 1 px, кількість вузлів — точно.

## ⛔ iframe НЕ годиться для нативного шляху Mermaid

Плоский `<iframe src="/modules/module-01">` (з `sandbox` і без) на цьому сайті у **3 з 4**
завантажень дає `pre.mermaid` з `data-processed="true"`, **без жодного елемента всередині** —
лишається тільки текст мермейдівського `<style>`. Помилки в консолі немає, `.ds-diag__fallback`
не зʼявляється. У вкладці верхнього рівня та сама сторінка малюється чисто щоразу.
Схоже на DOMPurify (`securityLevel: "strict"`) у контексті iframe.

**Наслідок:** будь-який висновок «у iframe зламалось» треба перевіряти у вкладці верхнього
рівня, інакше репортуєш артефакт стенда. Перевірка гіпотези про рендер — тільки top-level.

## Метрики, які варто знімати з кожної діаграми

- **накладання:** попарний перетин `getBoundingClientRect()` для `g.node`
  (для `sequenceDiagram` — `rect.actor`, `g.node` там немає);
- **вихід тексту за коробку:** `foreignObject.firstElementChild.scrollWidth` проти атрибута
  `width`. Шум субпікселя до ~1 px — поріг ставити 1,2;
- **масштаб:** `svg.getBoundingClientRect().width / svg.viewBox.baseVal.width`.
  Це головна метрика читабельності, див. [[project_mermaid_shrink_to_fit]];
- `aria-roledescription` → `flowchart-v2` / `sequence` / `error`.

`foreignObject` у Mermaid має `overflow: hidden`, а `.nodeLabel` — `white-space: nowrap`.
Тому переливи **обрізаються**, а не налазять на сусіда. Якщо на екрані видно накладання —
причина інша (див. [[project_mermaid_id_collision]]).
