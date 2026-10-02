---
name: method-lesson-ungate
description: Знімати шлагбаум #aiaGate треба ПОСТІЙНИМ прибиральником, а не одним викликом — js/module.js замикає вміст назад, і це мовчки дає нульові ширини
metadata:
  type: reference
---

# Зняття шлагбаума уроку: один виклик не працює

Заведено 2026-10-01 (012, коло 1). **Why:** восьма пастка заміру проєкту відома —
на сторінці уроку всі ширини нульові, поки `js/module.js` не відповів. Але звичний обхід
«дочекатися `#aiaGate` → прибрати його → зняти `hidden` з дітей `<main>` → міряти»
**спрацьовує не завжди**: у 012 з 23 уроків **13** замкнулися назад за ті 0,7 с, що
проходили між зняттям і виміром, і всі таблиці на 390 px видали `wrapW = 0`,
`minCol = −24`. Ознака в даних: нульові ширини рівно на **першій** ширині прогону
(тій, де відбувалась навігація) і правильні на решті.

**How to apply:** ставити прибиральник **до скриптів сторінки** через
`Page.addScriptToEvaluateOnNewDocument` і лишати його жити:

```js
(function add(){
  var r = document.documentElement;
  if (!r) { setTimeout(add, 0); return; }        // пастка: documentElement ще null
  setInterval(function(){
    var g = document.getElementById('aiaGate'); if (g) g.remove();
    var m = document.getElementById('main');
    if (m) Array.prototype.forEach.call(m.children, function(c){
      if (c.hasAttribute && c.hasAttribute('hidden')) c.removeAttribute('hidden'); });
    if (r.getAttribute('data-aia-gate')) r.removeAttribute('data-aia-gate');
  }, 40);
})();
```

Після цього — `window.AIA.winScrollers.sync()` (на сторінках Jira), бо `js/jira-win.js`
свідомо не чіпає вузол із нульовим `clientWidth` (`if (!el.clientWidth) return null`).

**Обовʼязкова самоперевірка в самому замірі:** виводити в результат
`gate: !!document.getElementById('aiaGate')` і `artW: article.ds-prose.clientWidth`.
Без цих двох полів зіпсований прогін виглядає як справжній дефект верстки — у 012
перша версія звіту мала б 415 «зламаних» таблиць замість 402, і 13 із них були б вигадані.

Див. [[reference_verification_traps]], [[method-cdp-own-chrome]].
