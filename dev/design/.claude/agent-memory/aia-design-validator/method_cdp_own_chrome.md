---
name: method-cdp-own-chrome
description: Власний Chrome по CDP з Node — запуск, драйвер і сім замірів, що пройшли на 012; пастки методу
metadata:
  type: project
---

Пісочниця не має npm-оточення, але має `node` (25.x із глобальним `WebSocket`) і системний
Chrome. Цього досить — браузерне розширення не потрібне.

**Запуск** (тимчасовий профіль, видиме вікно, три прапорці проти приспання):
```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9333 --user-data-dir=<scratchpad>/chrome-profile \
  --no-first-run --no-default-browser-check \
  --disable-features=CalculateNativeWinOcclusion \
  --disable-backgrounding-occluded-windows --disable-renderer-backgrounding \
  --window-size=1280,800 about:blank
```
Сервер — `python3 -m http.server 8765` **з кореня репозиторію**, інакше макет не прочитає живі
`css/tokens.css` і `css/components.css`.

Драйвер: `fetch('http://127.0.0.1:9333/json/new?<url>', {method:'PUT'})` → `new WebSocket(ws)` →
`Page.enable`, `Runtime.enable`, `Network.setCacheDisabled`, `Emulation.setDeviceMetricsOverride`,
`Emulation.setEmulatedMedia({features:[{name:'prefers-reduced-motion',value:'reduce'}]})`.

**Сім замірів, що дали доказ на 012:**
1. **Контраст** — обхід `TreeWalker(SHOW_TEXT)`, фон збирається вгору по предках із
   накладанням `rgba` (зупинка на першому непрозорому). 1 975 вузлів за ~3 с.
2. **Переповнення** — `document.scrollingElement.scrollWidth > clientWidth`, і якщо так —
   перебір елементів із `right > clientWidth`. 7 сторінок × 7 ширин.
3. **Кегль поза шкалою** — ті самі текстові вузли, фільтр `fontSize > максимуму компонента`.
4. **A/B гліфа** — підміна `textContent` мітки на ` `, порівняння `getBoundingClientRect()`
   батьків до і після.
5. **A/B каскаду** — обхід `document.styleSheets` → `rules[i].style.cssText = ''` для правил, що
   згадують чужий селектор; порівняння `getComputedStyle` вибірки до/після.
6. **Гасіння руху** — обхід усіх елементів, збір `transitionDuration` / `animationDuration` /
   `animationIterationCount` + `document.getAnimations()`. Дає **використану** тривалість, а не
   наявність медіа-запиту.
7. **Таймлайн** — `getComputedStyle(el).transform` серією проб через 350–400 мс; показує, чи
   цикл реально йде.

**Пастки методу:**
- ⚠ **`el.focus()` НЕ вмикає `:focus-visible`** — усі кільця виглядають відсутніми. Справжній
  фокус дає `Input.dispatchKeyEvent` з `windowsVirtualKeyCode: 9` (`rawKeyDown` + `keyUp`).
  На 012 так зняті 16 зупинок табуляції лендінга, усі з кільцем.
- ⚠ `Page.addScriptToEvaluateOnNewDocument` виконується, коли `documentElement` ще `null` —
  ставити атрибут треба і зразу, і через `MutationObserver` на `document`.
- ⚠ `Page.captureScreenshot` з `clip` рахує `y` **від початку документа**, не від вʼюпорта.
- ⚠ Сторінки макета 012 переписують `href` усіх `<link>` на завантаженні (підмостки проти кешу
  `<link>`) — у `document.styleSheets` вони приходять із `?v=…`. Це не дефект.
- ⚠ `Selection.toString()` додає переноси на межах блоків — порівнювати з `textContent`
  **без усіх пробілів**, інакше 69 із 69 дадуть «не збігається».

Пов'язане: [[method_live_browser_checks]], [[reference_browser_harness_limits]].
