---
name: defect-js-overrides-system-token
description: JS, що пише системний токен руху інлайн-стилем, затирає пресет data-motion="calm" — тест на 30 секунд
metadata:
  type: project
---

**Правило: JS, який керує системним токеном (`--loop-state`, `--motion`, `--motion-*`), має
писати ТІЛЬКИ обмежувальне значення, а «все гаразд» виражати `removeProperty`, не `"running"`.**

**Why:** інлайн-стиль на елементі сильніший за будь-яке правило каскаду. Рядок
`el.style.setProperty("--loop-state", stop ? "paused" : "running")` виглядає симетричним, але
гілка `"running"` назавжди затирає `[data-motion="calm"] { --loop-state: paused }` з
`css/tokens.css` (рядок 707). Сторінка далі крутить цикл у режимі, який за контрактом системи
має бути нерухомим, і в консолі нічого немає.

Це вже третя форма одного дефекту: 010 D-11 (GSAP не читав `--loop-state`), 012 D-01 (інлайн
затирав його). Білдер 012 навіть посилався на D-11 як на причину відмовитись від GSAP — і
відтворив той самий дефект іншим способом.

**How to apply — тест, який ловить це за півхвилини:**

```js
// CDP: Page.addScriptToEvaluateOnNewDocument, бо атрибут треба поставити ДО завантаження
const set = () => { if (document.documentElement) document.documentElement.setAttribute('data-motion','calm'); };
set();
new MutationObserver((m,o)=>{ if(document.documentElement){ set(); o.disconnect(); } }).observe(document,{childList:true,subtree:true});
```
далі 5 проб `getComputedStyle(анімований).transform` через 400 мс. Якщо значення змінюється —
дефект. Другий знак: `getComputedStyle(html)['--loop-state'] === 'paused'`, а
`getComputedStyle(el).animationPlayState === 'running'`.

Перевір обидва гасильники окремо: `html.rm` і `prefers-reduced-motion` зазвичай працюють
(бо знімають клас `.is-playing`), а `calm` — ні: він гасить **лише** цикли, не весь рух.

Пов'язане: [[project_timing_defect_class]], [[method_live_browser_checks]].
