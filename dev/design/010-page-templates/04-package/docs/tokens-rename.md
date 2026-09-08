# Перейменування токенів роадмапа і лендінга Термінала

**Класи не перейменовуються жодного** — `rm-*` і `cc-*` це легальні сторінкові префікси.
Перейменовуються **токени**. І от це справді небезпечно, бо розсинхрону **не видно на екрані**:
`num()` тихо бере fallback, і сторінка анімується старими зашитими числами.

⚠ **Три файли роадмапа перейменовувати ОДНИМ комітом:**
`css/roadmap.css` · `js/roadmap-motion.js` · `js/roadmap-render.js`.
Готовий `css/roadmap.css` уже в пакеті; готові еталони JS — у `files/js/reference/`.

---

## 1. Читає `js/roadmap-motion.js` — 36 імен

| Було (глобальний `:root` у `custom.css`) | Стало | Де тепер |
| ---------------------------------------- | ----- | -------- |
| `--amp-done` · `--amp-now` · `--amp-ahead` · `--amp-lead` | `--rm-amp-*` | `roadmap.css` |
| `--node-r` · `--node-r-ahead` · `--node-r-now` · `--node-ring-now` · `--node-punch` | `--rm-node-*` | `roadmap.css` |
| `--group-tick` | `--rm-group-tick` | `roadmap.css` |
| `--trail-w` · `--trail-dash` · `--trail-fade-in` · `--trail-fade-out` · `--trail-start` · `--trail-end` | `--rm-trail-*` | `roadmap.css` |
| `--dur-line` · `--dur-outro` | `--rm-dur-*` | `roadmap.css`, через `--dur-u` |
| `--stag-line` · `--stag-done` · `--stag-ahead` | `--rm-stag-*` | `roadmap.css`, через `--dur-u` і `--motion-stagger` |
| `--delay-count` | `--rm-delay-count` | `roadmap.css`, через `--dur-u` |
| `--move-hero` · `--move-outro` | `--rm-move-*` | `roadmap.css`, через `--move-u` |
| `--opacity-pulse` | `--rm-opacity-pulse` | `roadmap.css` |
| `--scale-pulse` | `--rm-scale-pulse` = `calc(1 + var(--motion) * 0.9)` | `roadmap.css` |
| `--rm-delay` (пише JS інлайном) | без змін | — |
| `--scrub-trail` · `--scrub-outro` | **`--scrub`** | `tokens.css` (системний) |
| `--dur-count` 800 | **`--dur-count`** 900 | `tokens.css` |
| `--dur-pulse` 1900 | **`--dur-loop-pulse`** 1900 | `tokens.css`, збіг байт у байт |
| `--dur-pulse-in` 180 | **`--dur-enter`** 180 | `tokens.css`, збіг байт у байт |
| `--e-out` · `--e-breath` | без змін | `tokens.css` |
| `--e-slow` · `--e-count` | **`--e-out`** | кривих у системі рівно пʼять, шоста заборонена |

## 2. Три імені, яких немає в списку П-06 — і саме вони найнебезпечніші

| Було | Стало | Де | Чому список їх не бачить |
| ---- | ----- | -- | ------------------------ |
| `--sk-rows` | `--rm-sk-rows` | `roadmap-render.js:199` | П-06 перелічує лише те, що читає `roadmap-motion.js` |
| `--delay-skeleton` | без змін — імʼя вже збігається із системним | `roadmap-render.js:~92` | те саме |
| **`var(--c-ink)` усередині рядка** | `var(--c-bg)` | `roadmap-motion.js:342` | ⚠ **єдине імʼя, яке живе не в лапках `"--імʼя"`, а всередині рядка `var(…)`.** Автозаміна за шаблоном `"--імʼя"` його **не бачить**, помилки в консолі немає: SVG просто отримує невалідний `stroke`, і «пробій» вузла кольором тла зникає |

**Разом перейменувань, які читає JS: 37 + одне у формі `var()` = 38.**

## 3. Тільки CSS (перейменовуються в один бік, без JS)

`--c-trail-*` · `--c-now-*` · `--fs-hero|item|item-sm|count|row` · `--lh-item` · `--tr-item` ·
`--ch-desc|lead` · `--pad-page` · `--rail-w` · `--trail-x` · `--meta-w` · `--col-gap` ·
`--row-gap-*` · `--row-pad-y` · `--sec-gap` · `--sk-row-h` · `--hero-reserve` · `--move-row*` ·
`--move-arrow` · `--dur-row-*` · `--scale-node-hover` → усі з префіксом `--rm-`.

**Зведено до системних:** `--w-page` → `--w-content` · `--fs-meta` → `--fs-label` ·
`--fs-desc` → `--fs-ui` · `--lh-desc` → `--lh-small` · `--lh-hero` → `--lh-h1` ·
`--tr-hero` → `--tr-display` · `--tr-label` → `--tr-eyebrow` · `--dur-press` → `--dur-tap` ·
`--c-ink` → `--c-bg` · `--c-ivory` → `--c-text` · `--c-sand` → `--c-text` ·
`--c-muted` → `--c-text-3` · `--c-accent-deep` → `--c-accent-hover`.

**Викинуто як мертве:** `--c-node-core`, `--dur-state`(rm), `--dur-expand`, `--dur-page-in`(rm),
`--delay-outro`, `--trail-w-lit` (дорівнював `--trail-w`).

---

## 4. Лендінг Термінала — `--cc-*`

Дзеркально: класи `cc-*` лишаються, токени `--node-r`, `--rail-w`, `--ghost`, `--dur-term-*`,
`--stag-term-*`, `--move-term-*`, `--speed-term-cps`, `--e-term`, `--e-pop` → `--cc-*` / `--term-*`
(префікс завжди на першій позиції).

⚠ **`--speed-term-cps` → `--term-speed-cps` і НЕ множиться на `--motion`.** Нуль дав би
`Infinity` при діленні. Гілку `reduce` для друку бере JS, а не токен.

⚠ **Відступ Б1 (В-05), який треба знати:** пʼять токенів руху `--cc-*` **прибрані, а не
перейменовані** — їхні ролі вже є в L2 системи. Разом із ними зникають **15 імен, які
читав `claude-code-motion.js` із fallback**. Готовий `files/js/reference/claude-code-motion.js`
уже без них. Якщо повертати — повертати всі пʼять і всі 15 читань разом.

---

## 5. Куди переїжджають 104 токени з `css/custom.css:918–1104`

Сьогодні вони лежать у **глобальному `:root`** і роздаються всім 66 сторінкам, хоч потрібні
одній. Після міграції: `--rm-*` живуть **тільки** в `css/roadmap.css`, `--cc-*` — **тільки**
в `css/claude-code.css`. Це і є структурне закриття колізії `--rail-w` 184/132 (П-18):
два різні значення одного імені більше не зустрічаються в одному документі.

`--term-*` лишаються в `css/components.css` — термінал живе на 28 сторінках.
