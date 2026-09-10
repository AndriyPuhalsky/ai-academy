---
name: browser-measure-traps
description: Пастки заміру через mcp__claude-in-chrome у цьому проєкті — вʼюпорт вкладки не дорівнює resize_window, урок гостя дає нульові ширини
metadata:
  type: reference
---

Замір геометрії через `mcp__claude-in-chrome` у AIA має три пастки, кожна з яких
мовчки дає хибне число.

**1. `resize_window` не керує лейаут-вʼюпортом надійно.** У сесії 011 (хвиля 2)
після `resize_window(1280, 900)` сторінка звітувала `innerWidth 1440`,
`outerWidth 784`, `devicePixelRatio 2`; після `resize_window(900, 800)` геометрія
взагалі не змінилась, а пізніше та сама вкладка віддала `innerWidth 1280`.
**Завжди читати `innerWidth`/`innerHeight` тим самим викликом, що й геометрію**, і
записувати у звіт фактичну ширину, а не замовлену. Для точних ширин (390, 768,
1024) — власний Chrome по CDP (`dev/build/011-open-tails/stand/`), не розширення.

**2. Урок гостя віддає нульові (і навіть відʼємні) ширини.** `js/module.js`
ставить `hidden` на всі діти `main` під замком, тож `offsetHeight − clientHeight`
дає `-2` (самі бордери). Обхід для заміру: `document.getElementById('aiaGate')
.remove()` + зняти `hidden` з дітей `main` + `dispatchEvent(new Event('resize'))`.
Фальшивий ключ `localStorage['sb-probe-auth-token']` знімає лише **ранній**
замок (`guestForSure`), пізній усе одно прийде після відповіді Supabase.
**Ключ обовʼязково прибирати** — інакше наступний гостьовий замір хибний.

**3. Читання атрибута одразу після програмної прокрутки бреше.** Кілька
`el.scrollLeft = …` + `await setTimeout` в одному інжектованому скрипті дали
`data-scroll-fade`, що відставав на крок. Правильно: одна дія — один виклик
`javascript_tool`, або перевіряти стан у наступному виклику.

**Що працює добре:** `getComputedStyle` для доказу, що правило застосувалось;
обхід `document.styleSheets` (`cssRules`) — доказ, що CSS розібрався без помилок
(рахувати правила, а не дивитись очима); `performance.getEntriesByType('paint')`.

Див. також [[wave-report-via-final-message]].
