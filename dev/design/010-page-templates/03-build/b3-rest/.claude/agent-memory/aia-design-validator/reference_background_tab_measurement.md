---
name: background-tab-measurement
description: У фоновій вкладці Chrome rAF не викликається взагалі — будь-який замір руху, fps і IntersectionObserver там дає хибний нуль. Ознака і обхід.
metadata:
  type: reference
---

**Нерендерена вкладка не отримує ні `requestAnimationFrame`, ні колбеків
`IntersectionObserver`, і GSAP у ній стоїть.** Це не «повільно» — це нуль кадрів.

**Ознака:** `document.visibilityState === "hidden"`. ⚠ `document.hasFocus()` може бути
`true` при цьому — клік по сторінці дає фокус, але не робить вікно видимим. Перевіряти
треба саме `visibilityState`, а не `hasFocus`.

**Швидкий тест:**
```js
await new Promise(r=>{const t=setTimeout(()=>r(false),700); requestAnimationFrame(()=>{clearTimeout(t);r(true)})})
```
`false` = приладу немає.

**Що ПРАЦЮЄ навіть у фоновій вкладці** (перевірено 010): `getComputedStyle`,
`getBoundingClientRect`, `scrollWidth`/`clientWidth`, обхід CSSOM, скріншоти через
розширення. Тобто розкладка, контраст, скрол, специфічність міряються надійно.

**Що НЕ працює:** заміри кадрів (критерій «60 fps / нуль кадрів > 32 мс» закрити
неможливо), поява через IO, GSAP-таймлайни, будь-яке «відкриття» у формі
`hidden=false` + `rAF` + перемикання атрибута.

**Обхід для макетів:** `gsap.updateRoot(gsap.globalTimeline.rawTime() + 6)` для таймлайнів
і тимчасовий `* { transition: none }` для переходів.

**Наслідок для коду сайту:** відкриття діалогів треба робити через примусовий reflow
(`void el.offsetWidth`), а не через `rAF`.

**Замість заміру fps — статичний аудит:** обійти всі `transition-property` і всі
`@keyframes` і перевірити, що серед властивостей немає таких, що змушують рахувати
розкладку (`width`, `height`, `top`, `left`, `margin`, `padding`, `font-size`,
`grid-template-columns`). Це сильний непрямий доказ, і його треба **називати непрямим**.

Це вже четвертий випадок у проєкті: 003 D-01, 005 Б-01, 009 IO, 010.
Див. [[validator-falsify-builder-numbers]].
