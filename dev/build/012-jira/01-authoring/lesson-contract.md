# Контракт сторінки уроку «Jira з нуля»

**Складено кореневою сесією 2026-09-17**, звірено з живим кодом сайту після задачі 010
(`modules/claude-code-01.html`, `css/components.css`, `js/module.js`, `js/quiz.js`), з програмою
`00-research/program.md` і брифом дизайну `dev/design/012-jira/task.md`. Успадковує контракт 005
(`dev/build/005-ai-terminal/01-authoring/lesson-contract.md`) там, де він не застарів; **де вони
розходяться — вірити цьому файлу**: 005 писався до 010 і згадує `css/custom.css` та `.lesson-no`,
яких більше немає.

Цей файл відповідає на одне питання: **як має бути влаштований файл `modules/jira-NN.html`**, щоб
він працював із наявним каркасом і зійшовся з версткою, яку дизайн ще малює. **Що писати — каже
`00-research/program.md` (картка уроку).** Де брати матеріал — `01-authoring/facts-map.md`.

> ⚠ **Порядок 012: контент пишеться ДО дизайну.** Компонент «вікно застосунку» ще не має CSS.
> Розмітка вікна в §4 — **тимчасова семантична**, узгоджена з брифом (`figure / figcaption / ul /
> table / ol`). Дизайн зафіксує імена класів і токени; білд зробить один прохід заміни по всіх
> файлах. Тому: **класи з §4 копіювати дослівно**, нічого не вигадувати й не «стилізувати» —
> однорідна розмітка = дешева заміна.

---

## 0. Читач і межа доступності

Успадковано з 005 §0 без змін: **людина, яка не знає нічого** — не «джун», не «технічний новачок».
Тут це людина не з ІТ: маркетолог, бухгалтер, виконроб, власник кав'ярні. Вона може не знати, що
таке «статус», «workflow», «фільтр». Після кожного абзацу — питання «а звідки читач це знає?».
Кожне поняття вводиться при першій появі **в курсі** (див. розділ 4 програми — хто «дім» поняття).

**Заборонені звороти:** `просто` · `очевидно` · `як відомо` · `елементарно` · `всі знають` ·
`не забудь, що` · `звісно`. Тон: на «ти», спокійно, конкретно, без бадьорості; перше речення уроку
пояснює, навіщо він існує.

**Широта = покриття, не щільність:** усе з поля «Теми» картки мусить прозвучати; вичерпні
таблиці (усі поля JQL, усі тригери) — у довідниках, не в уроці.

### 0.1 Принципи стійкості (рішення власника, `dev/jira-course-plan.local.md`)

1. **Урок про поняття, а не про кнопку.** Кнопки перемальовують тричі на рік; поняття
   (контейнер → робота → поля · workflow · JQL · дошка · ієрархія · люди · сповіщення · тип
   спейсу · фільтри → дашборди · автоматизація) — ні.
2. **Термінологія: поточна + колишня в дужках при першій згадці в курсі:** work item (issue),
   space (project), work type (issue type), **flow (automation rule)**. У JQL / smart values / URL —
   колишні слова, це пояснюється один раз (`j04`, `j07`, `j14`) і далі не коментується.
3. **Уроки не називають чисел лімітів.** Лише «обмежено — дивись довідник 3». Винятки: **10
   користувачів** Jira Free і **3 агенти** JSM Free (це визначення планів).
4. **Летюче — в одному місці:** карта інтерфейсу, глосарій, ліміти з датою — довідник 3.
5. **Жоден урок не залежить від стороннього застосунку** (Marketplace — лише приклад у `j17`).
6. **Кожне вікно датоване** у заголовку: «Jira Cloud · … · звірено 2026-09-DD».
7. **Англійський UI, українське пояснення.** У вікні — написи EN як на екрані; у легенді й
   тексті — UA. Української локалізації Jira не існує (перевірено: акаунт українською → UI англійський).
8. **Шлях у «Зроби сам» — словами** («Space settings → Work types → Task → Edit workflow»),
   не картинкою.
9. **Посилання — на розділи** `support.atlassian.com/<product>/docs/`, не на сторінки (слаги
   застарівають); суть дублюється в уроці.

---

## 1. Що автор віддає

**Рівно один HTML-файл `modules/jira-NN.html` + один звіт `01-authoring/reports/jNN.md`.**
Звіт — вимога власника (2026-09-10): джерела (URL + дата), що описано словами замість вікна,
чого не знайшов підтвердження (⚠), розбіжності доксів зі `screens/` або програмою, знахідки для
сусідніх уроків. Якщо запис `.md` відхилено дозволами — віддати повний вміст фінальним
повідомленням і сказати про це прямо. Більше нічого: ні CSS, ні JS, ні конфігів, ні інших уроків.

---

## 2. Каркас сторінки

**База — `modules/claude-code-01.html`** (урок Термінала після 010; у ньому правильні шрифти,
порядок CSS, шапка з `#navProgress`, сайдбар, `data-page-in`, футер, порядок скриптів). Коли
`modules/jira-01.html` буде закомічений — база для `j02`+ **він**.

Що змінити відносно `claude-code-01.html` — **рівно дев'ять місць** (перші п'ять — «курс»,
решта — «урок»):

| # | Де | У `claude-code-01.html` | Стає |
| - | -- | ----------------------- | ---- |
| 1 | `<html … data-config data-course>` | `../claude-code.config.json`, `terminal` | **`../jira.config.json`**, **`jira`** (`data-density="lesson" data-lit` — як є) |
| 2 | `<a class="ds-hdr__brand" href>` і футер «На головну ↑» | `../claude-code.html` | **`../jira.html`** (двічі) |
| 3 | `<span class="ds-hdr__mark" data-site="shortName">` | `AIT` | **`AIJ`** (заповнюється з конфіга; ⚠ монограма — рішення дизайну, замінити разом) |
| 4 | `<a class="ds-nav__link" href>` «До програми» | `../claude-code.html#map` | **`../jira.html#map`** |
| 5 | `#configError` — назва конфіга в тексті | `claude-code.config.json` | **`jira.config.json`** |
| 6 | `<body data-module>` | `c01` | **`jNN`** — свій код (у базі ще немає; вигадувати не можна) |
| 7 | `<title>` + `<meta name="description">` | про `c01` | «Урок N · Назва — Jira з нуля» + опис уроку одним реченням |
| 8 | `<span class="ds-hdr__crumb">` | `Модуль 01` | **`Урок NN`** |
| 9 | вміст `<article class="ds-prose">` + `#quizData` | матеріал `c01` | свій матеріал і свій квіз |

Решта — `<head>` (шрифти, `tokens.css` → `components.css` → Tailwind → `tw-theme.js`),
`ds-skip`, `#ariaLive`, `<noscript>`, шапка, `#sidebarOverlay`, сітка, `<aside id="moduleSidebar">`,
`<main id="main" data-page-in>`, картка «Модуль позаду?» (`#completeBtn`), `<nav id="moduleNav">`,
футер `ds-ftr--short` з `data-site="disclaimer"`, **порядок скриптів** — переноситься як є:

```html
<script src="../js/motion.js"></script>
<script src="../js/progress.js"></script>
<script src="../js/ui.js"></script>
<script src="../js/config.js"></script>
<script src="../js/module.js"></script>
<script src="../js/quiz.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
<script src="../js/mermaid-theme.js"></script>
<script src="../js/mermaid-init.js"></script>
<script src="../js/auth-ui.js"></script>
<script type="module" src="../js/auth.js"></script>
```

**Коди модулів — несуча конструкція.** `js/auth.js` будує `AIA_MODULE_MAP` без фільтра за курсом;
зайняте: `m01`–`m12`, `a01`–`a22`, `c01`–`c23`. Код `jNN` — **точно з програми**. Поки міграція
`012-1` не застосована, квіз пише в консоль «невідомий модуль» — це очікувано, не лагодити.

**Вступ уроку** (до `<hr />`), як у базі: `p.ds-eyebrow` — «Фаза N · Назва фази» (з таблиці
`tracks` програми) · `h1.ds-h1` — назва уроку · `p.ds-small.ds-num` — «Початковий · 8 блоків ·
≈ NN хв читання» · `p.ds-lead` — одне-два речення, навіщо урок · абзац · `div.ds-note` з
`span.ds-note__title` «Що в цьому уроці є, а чого немає» (**Немає:** … **Є:** …).

**Виміряно в базі: `<h3>` є, `<h4>` немає** (22 проти 0). `<details>`, `<blockquote>`, `<kbd>` —
не вживати (правил у `components.css` для них немає). Клавіші й пункти меню — у `<code>`.
Таблиця — **лише** `div.ds-tbl__wrap[tabindex="0" role="region" aria-label="Таблиця: …"] >
table.ds-tbl`; **перша колонка — ідентифікатор, не речення** (`white-space: nowrap`, дефект
2026-09-09). Виноски під вікном/діаграмою — `p.ds-diag__caption[data-align="start"]`. Інлайновий
код у прозі — `<code>`, у `.ds-note` — `<code class="ds-code--inline">` (як у базі).
**Апостроф — тільки `'` (U+0027).**

---

## 3. Вісім блоків уроку → секції

Кожен блок — окрема `<section>` з двома обов'язковими атрибутами; `js/module.js` читає
`data-lesson` і будує з нього бічну навігацію та прогрес по уроку:

```html
<section id="l3" data-lesson="3. Як це працює">
  <h2><span class="ds-prose__no">3</span>Як це працює</h2>
  …
</section>
```

| # | `data-lesson` | Що всередині (для цього курсу) |
| - | ------------- | ------------------------------ |
| 1 | `1. Навіщо це` | яку задачу закриває — у сюжеті «Кориці» |
| 2 | `2. Як це виглядає на екрані` | **вікно застосунку** (§4) з легендою — де на екрані що; 1–3 вікна тут, решта — там, де доречно |
| 3 | `3. Як це працює` | **Mermaid** (§5) — що з чим пов'язано і в якому порядку |
| 4 | `4. Зроби сам` | покрокова дія у своєму сайті, шлях словами, у сюжеті (картка уроку) |
| 5 | `5. Як перевірити, що вийшло` | ознака «так/ні» на екрані, з картки уроку |
| 6 | `6. Типові граблі` | 2–4 з картки, кожна — `h3` + абзац або `ul` |
| 7 | `7. Часті питання` | `h3`-питання + абзац, як у базі |
| 8 | `8. Підсумок і наступний крок` | `div.ds-note.ds-note--accent` з `span.ds-note__title` «Підсумок уроку» + `ul`; `h3` «Наступний крок» |
| — | `Квіз: перевір себе` | `id="quiz"`, §6 |

Порядок незмінний. **Норма насиченості: 1–5 вікон, ≥ 1 Mermaid** (іспит `j23` — 0 вікон,
0 діаграм, 26 питань).

---

## 4. Компонент «вікно застосунку» — тимчасова розмітка (до дизайну)

Аналог `term` (005 §4), але для GUI. Джерело анатомії — бриф, поле 2 і поле 11: `figure` →
`figcaption`-шапка → тіло = рейка + головна область; шість станів; мітки ①②③ (`aria-hidden`) +
легенда `<ol>`; **лише текст**, жодного `<img>`, `<svg>`, `<canvas>`. Робочий префікс класів —
`win` (остаточний — за реєстром §7.0 системи 009, рішення дизайн-сесії).

### 4.1 Спільний скелет (усі стани)

```html
<figure class="win" data-state="board" id="w1">
  <figcaption class="win__chrome">
    <span class="win__dots" aria-hidden="true"></span>
    <span class="win__title" id="w1t">Jira Cloud · дошка спейсу Маркетинг · звірено 2026-09-17</span>
    <span class="win__addr" aria-hidden="true">…/jira/software/projects/MARK/boards/1</span>
  </figcaption>
  <div class="win__body" role="group" aria-labelledby="w1t">
    <ul class="win__rail" aria-label="Бічна панель Jira">
      <li class="win__rail-item">For you</li>
      <li class="win__rail-item win__rail-item--active">Spaces</li>
      <li class="win__rail-item">Filters</li>
      <li class="win__rail-item">Dashboards</li>
    </ul>
    <div class="win__main">
      <div class="win__bar">
        <span class="win__crumb">Spaces / Маркетинг</span>
        <span class="win__tabs"><span>Summary</span><span>List</span><span class="win__tab--active">Board</span><span>Calendar</span></span>
        <span class="win__btn win__btn--primary">+ Create <b class="win__mark" aria-hidden="true">②</b></span>
      </div>
      <!-- тіло стану: 4.2 -->
    </div>
  </div>
</figure>
<ol class="win__legend" aria-label="Пояснення до вікна «дошка спейсу Маркетинг»">
  <li>Колонка = етап роботи (статус)</li>
  <li>Create — створити нову роботу (work item)</li>
</ol>
```

Правила скелета:
- `id` вікна `w1`…`w5` по порядку в уроці; `id` заголовка `w1t`…; `aria-labelledby` на `.win__body`
  — **обов'язково**, як `term__body`.
- **Заголовок датований:** «Jira Cloud · <що показано> · звірено РРРР-ММ-ДД». Дата — день, коли
  екран бачили (`screens/*.md` шапка або живий sandbox через кореневу сесію). Вікно, зібране
  з доксів без екрана, — «… · за документацією, РРРР-ММ-ДД».
- `.win__addr` — умовна адреса без домену, з `…` на початку; `aria-hidden`.
- **Мітки** — `<b class="win__mark" aria-hidden="true">①</b>` (символи ①–⑨), стоять **усередині**
  елемента, який позначають, після його тексту. **Легенда** — `<ol class="win__legend">` одразу
  за `</figure>`, рівно стільки `<li>`, скільки міток, у тому ж порядку. Вікно без міток —
  без легенди, валідне.
- `.win__rail` — `<ul>` з написами EN як на екрані (`screens/01`, `03`); стан `portal` рейки не має.
- `.win__bar` — рядок над тілом: крихти / назва, вкладки виглядів, кнопки; усе EN.
- Категорії статусів позначаються **не лише кольором**: `data-cat="todo|progress|done"` на
  колонках/статусах — дизайн додасть форму/гліф (§7.2 системи).
- Увесь текст — справжній текст (виділяється, копіюється, знаходиться `Cmd+F`).

### 4.2 Тіло за станом

**`board`** — колонки й картки:
```html
<ul class="win__cols">
  <li class="win__col" data-cat="todo">
    <h4 class="win__col-title">To Do <span class="win__count">2</span> <b class="win__mark" aria-hidden="true">①</b></h4>
    <ul class="win__cards">
      <li class="win__card">
        <span class="win__card-title">Пост про новий круасан</span>
        <span class="win__card-meta"><span class="win__type" aria-label="Task">☑</span> <span class="win__key">MARK-1</span> <span class="win__due">Sep 24</span> <span class="win__who" title="Марта Лисенко">МЛ</span></span>
      </li>
    </ul>
  </li>
  <li class="win__col" data-cat="progress">…</li>
  <li class="win__col" data-cat="done">…</li>
</ul>
```
Варіанти: доріжки (Group by) — `ul.win__lanes > li.win__lane > h4.win__lane-title + ul.win__cols`;
сітка гаджетів (`j08`) — `ul.win__gadgets > li.win__gadget > h4 + вміст` (таблиця або список).

**`list`** — таблиця:
```html
<table class="win__table">
  <thead><tr><th>Work</th><th>Assignee</th><th>Status</th><th>Due date</th></tr></thead>
  <tbody>
    <tr><td><span class="win__key">MARK-4</span> Розсилка «Осіннє меню»</td><td>МЛ</td><td data-cat="progress">In Progress</td><td>Sep 26, 2026</td></tr>
  </tbody>
</table>
```
Варіанти списку: Spaces, Filters, Dashboards, Audit log, черги JSM, Marketplace-картки
(`ul.win__tiles`), Text-режим workflow (дві таблиці: статуси, переходи), Summary-плитки
(`ul.win__stats > li`), JQL-рядок над таблицею — `p.win__query > code`; стан помилки —
`p.win__error` з дослівним текстом.

**`item`** — картка роботи:
```html
<div class="win__item">
  <p class="win__crumb">Spaces / Друга точка / <span class="win__key">REM-1</span> / <span class="win__key">REM-2</span></p>
  <h4 class="win__item-title">Електрика: погодити кошторис <b class="win__mark" aria-hidden="true">①</b></h4>
  <p class="win__status" data-cat="progress">In Progress ▾</p>
  <dl class="win__fields">
    <dt>Assignee</dt><dd>Тарас Мельник <b class="win__mark" aria-hidden="true">②</b></dd>
    <dt>Parent</dt><dd><span class="win__key">REM-1</span> Ремонт другої точки</dd>
    <dt>Priority</dt><dd>High</dd>
    <dt>Labels</dt><dd>електрика</dd>
    <dt>Due date</dt><dd>Oct 3, 2026</dd>
    <dt>Reporter</dt><dd>Оксана Коваль</dd>
  </dl>
  <div class="win__desc"><h5>Description</h5><ul class="win__checks"><li data-done>Отримати два кошториси</li><li>Погодити з Оксаною</li></ul></div>
  <div class="win__sub"><h5>Subtasks</h5><ul><li><span class="win__key">REM-3</span> Розводка під кавомашину</li></ul></div>
  <div class="win__comments"><h5>Activity · Comments</h5><ul><li><span class="win__who">ТМ</span> Кошторис №2 дешевший на 12 %, беремо його. @Оксана</li></ul></div>
</div>
```

**`form`** — діалог **або** вертикальний ланцюжок:
```html
<div class="win__dialog" role="presentation">
  <h4 class="win__dialog-title"><span class="win__chip">MARK</span> <span class="win__chip">Task</span></h4>
  <dl class="win__fields">
    <dt>Summary <b class="win__mark" aria-hidden="true">①</b></dt><dd>Пост про новий круасан</dd>
    <dt>Description</dt><dd class="win__placeholder">Add a description or type / for actions</dd>
  </dl>
  <p class="win__chips"><span class="win__chip">Automatic</span><span class="win__chip">Parent</span><span class="win__chip">Medium</span><span class="win__chip">Labels</span><span class="win__chip">Due date</span></p>
  <p class="win__actions"><span>Create another</span> <span class="win__btn win__btn--primary">Create</span></p>
</div>
```
```html
<ol class="win__chain">
  <li class="win__step" data-kind="when"><span class="win__step-kind">When</span> Work item created <b class="win__mark" aria-hidden="true">①</b></li>
  <li class="win__step" data-kind="if"><span class="win__step-kind">If</span> Work type equals Task</li>
  <li class="win__step" data-kind="then"><span class="win__step-kind">Then</span> Assign work item to Марта Лисенко</li>
</ol>
```

**`settings`** — рейка розділів + активна сторінка:
```html
<ul class="win__rail win__rail--settings" aria-label="Space settings">
  <li class="win__rail-item">Details</li><li class="win__rail-item">Access</li><li class="win__rail-item win__rail-item--active">Work types <b class="win__mark" aria-hidden="true">①</b></li><li class="win__rail-item">Fields</li><li class="win__rail-item">Features</li>
</ul>
<div class="win__main"><div class="win__page"><h4>Task</h4><p class="win__btn">Edit workflow</p><dl class="win__fields">…</dl></div></div>
```
(У стані `settings` `.win__rail--settings` **замінює** звичайну рейку — одна рейка на вікно.)
Варіант «матриця» (сповіщення) — `table.win__table` з колонками In product / Email і `✓`.

**`portal`** — без рейки:
```html
<div class="win__portal">
  <h4 class="win__portal-title">Бухгалтерія «Кориці»</h4>
  <p class="win__search">Search for help <b class="win__mark" aria-hidden="true">②</b></p>
  <ul class="win__tiles">
    <li class="win__tile">Подати рахунок <b class="win__mark" aria-hidden="true">①</b></li>
    <li class="win__tile">Заявка на аванс</li>
    <li class="win__tile">Замовити довідку</li>
    <li class="win__tile">Закупівля</li>
  </ul>
  <p class="win__link">Requests <b class="win__mark" aria-hidden="true">③</b></p>
</div>
```

### 4.3 Довідник класів (усі тимчасові; не додавати своїх)

`win` (`figure`, `data-state` = один із шести) · `win__chrome` · `win__dots` · `win__title` (з `id`)
· `win__addr` · `win__body` (`role="group"` + `aria-labelledby`) · `win__rail` / `--settings`,
`win__rail-item` / `--active` · `win__main` · `win__bar`, `win__crumb`, `win__tabs`, `win__tab--active`,
`win__btn` / `--primary` · `win__cols`, `win__col`, `win__col-title`, `win__count`, `win__cards`,
`win__card`, `win__card-title`, `win__card-meta`, `win__type`, `win__key`, `win__due`, `win__who` ·
`win__lanes`, `win__lane`, `win__lane-title` · `win__gadgets`, `win__gadget` · `win__table` ·
`win__tiles`, `win__tile` · `win__stats` · `win__query` · `win__error` · `win__item`, `win__item-title`,
`win__status`, `win__fields`, `win__desc`, `win__checks`, `win__sub`, `win__comments`, `win__placeholder`
· `win__dialog`, `win__dialog-title`, `win__chip`, `win__chips`, `win__actions` · `win__chain`,
`win__step`, `win__step-kind` · `win__page` · `win__portal`, `win__portal-title`, `win__search`,
`win__link` · `win__mark` · `win__legend`.

Потрібен елемент, якого тут немає — **написати про це у звіті**, а в розмітці взяти найближчий
із наявних. Дизайн вирішить, чи заводити новий.

### 4.4 `term` лишається — для JQL, smart values і CLI (`j22`)

Розмітка `term` — з 005 §4 без змін (`figure.term.term--cmd > figcaption.term__chrome > …;
pre.term__body[tabindex=0][role=group][aria-labelledby]`, кожен рядок `span.term__line`,
копіюється лише `.term__in`). Один запит = один блок; заголовок блоку — що робить запит.
`.term--enter` і `.term--hero` в уроках **заборонені** (двічі давали «opacity: 0 назавжди»).
`.term--long` — не вживати.

---

## 5. Mermaid

Розмітка — як у базі:
```html
<div class="ds-diag">
  <pre class="mermaid">
flowchart LR
  A["Тригер"] --> B["Умова"] --> C["Дія"]
  </pre>
  <p class="ds-diag__caption">Підпис одним реченням</p>
</div>
```
- **Workflow — тільки `stateDiagram-v2`** (`j10`, `j19`): стани = статуси, примітки з категоріями.
- Текст вузлів у лапках; **`<br/>` у вузлах не писати** (пастка 010: неекранований `<br/>` ламав
  рендер); довгі підписи ділити на два вузли.
- Тема — з `js/mermaid-theme.js`; `style` у діаграмі не писати.
- Мінімум одна діаграма на урок; іспит — без.

---

## 6. Квіз

Без змін від 005 §6 і §9.1 (`js/quiz.js` тасує варіанти):
```html
<section id="quiz" data-lesson="Квіз: перевір себе">
  <h2>Квіз: перевір себе</h2>
  <p>Шість питань без оцінок і дедлайнів…</p>
  <div data-quiz="quizData"></div>
</section>
```
Одразу за `</article>` — `<script type="application/json" id="quizData">{"questions":[…]}</script>`.
- **6 питань** в уроці, **26** в іспиті; `answer` — індекс з нуля; `explain` обов'язковий і
  **не посилається на позицію** («перший варіант» — заборонено).
- Питання ситуаційні («Ігор створив flow … і в Audit log — No actions performed. Що сталось?»),
  не «скільки».
- **Довжина варіанта не підказує** (007): «правильна = найдовша» ≤ 35 %, «найкоротша» ≤ 35 %;
  розкид `answer` — жоден індекс > 40 %. `check-lessons.py` ловить обидва.
- JSON валідний (`python3 -m json.tool`), інакше квіз мовчки не з'явиться.

---

## 7. Свіжість — правило без винятків

**Памʼять моделі джерелом не є. Ніколи.** Jira перейменувала issue → work item, project → space,
rule → flow за два роки; будь-який туторіал у мережі може описувати кнопки, яких немає.

**Дозволені джерела рівно три:**
1. **Живі докси Atlassian** через WebFetch: `support.atlassian.com/jira-software-cloud/docs/`,
   `…/jira-cloud-administration/docs/`, `…/cloud-automation/docs/`,
   `…/jira-service-management-cloud/docs/`, `…/confluence-cloud/docs/`, `…/atlassian-account/docs/`,
   `developer.atlassian.com/cloud/…`. Слаг дав 404 — шукати нову адресу через індекс розділу або
   WebSearch, не здаватись і не вигадувати.
2. **`00-research/screens/*.md`** — текстові знімки sandbox з датою в шапці; напис у вікні береться
   звідси дослівно.
3. **Живий sandbox** — лише через кореневу сесію (у автора немає Chrome): попросити у фінальному
   повідомленні зняти екран, якого бракує, і позначити в уроці ⚠.

**Плюс:** `00-research/facts-free-plan.md` (перевірені факти з цитатами й датою) і `program.md`
картка уроку (джерела — розділи). **Розбіжність доксів із sandbox — знахідка, а не помилка:**
іде в урок (наприклад, у доксах «rule», на екрані «flow») і у звіт.

**Обов'язково:** дата в заголовку кожного вікна; жодного вигаданого напису; числа лімітів —
тільки в довіднику 3 (§0.1 п. 3); «Ask AI», «Improve Task», «Add agent», «See plans», «Try
Confluence now» — апсели, не функції Free.

---

## 8. Чого не робити

- Не чіпати нічого поза своїм файлом і своїм звітом: ні `js/`, ні `css/`, ні `jira.config.json`,
  ні інших уроків, ні `program.md`.
- Не вигадувати класи (§4.3) і не додавати `style=""`.
- Не копіювати `user-scalable=no` (у базі його немає — не тягнути з інших сторінок).
- Не використовувати `.term--enter`, `.term--hero`, `.term--long`.
- Не вставляти `<img>`, `<svg>`, `<canvas>` у вікно; не робити «скріншот словами» довшим за
  екран — вікно показує суть, а не все.
- Не переказувати сусідній урок — межі в `program.md`, розділ «Межі між сусідами».
- Не називати чисел лімітів (крім 10 і 3); не описувати Rovo/AI в UI як доступне на Free.
- Не робити `git`-операцій. Комітить коренева сесія.

---

## 9. Формат фінального повідомлення (і звіту `reports/jNN.md`)

1. **Файл** — шлях і розмір; **звіт** — шлях.
2. **Джерела** — URL прочитаних сторінок і дата; які `screens/*.md` використано; які рядки
   `facts-free-plan.md`.
3. **Вікна** — список: id · стан · заголовок · звідки написи (screens/докси) · скільки міток.
4. **Що описано словами замість вікна** — і чому (немає знімка / JSM не додано / інтерактивне).
5. **Чого не знайшов підтвердження** — і що через це не потрапило в урок (⚠ у тексті).
6. **Розбіжності** доксів зі `screens/` або з програмою.
7. **Що в контракті виявилось незручним** — зокрема, якого елемента вікна бракувало (§4.3).
8. **Знахідки для сусідніх уроків** — коренева сесія допише в `cross-findings.md`.
