---
name: cdp-measurement-rig
description: Стенд, який зняв усі «неможливі» виміри AIA (fps, jank, справжній reduced-motion, слабкий процесор) — власний Chrome через DevTools Protocol із примусовими кадрами
metadata:
  type: reference
---

**Головний інструмент валідатора з 2026-09-07.** Раніше в памʼяті стояло «плавність і
jank виміряти неможливо ніколи» — це було правдою тільки для розширення
`mcp__claude-in-chrome`. Через CDP усе міряється.

Запуск: `spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
['--headless=new','--remote-debugging-port=NNNN','--user-data-dir=/tmp/…',
'--window-size=1440,900','--hide-scrollbars'])`, далі `fetch(http://127.0.0.1:NNNN/json/list)`
→ `new WebSocket(page.webSocketDebuggerUrl)`. Node 22+ має глобальний `WebSocket`, npm
не потрібен.

**⚠ Без `Page.startScreencast` стенд бреше.** Це ключ до всього: headless без нього не
доставляє `IntersectionObserver`, не крутить `requestAnimationFrame`, а CSS-переходи
повзуть у «кадровому» часі й дають ХИБНІ гонки (я так «довів» неіснуючий дефект діалогу,
а потім спростував себе). Зі скрінкастом: `ioWorks() === true`, rAF рівно 60 fps.

Що дає доказ:
- **fps і довгі кадри:** лічильник міжкадрової дельти + скриптований скрол 6 с. Норма
  здорової сторінки — 361 кадр / 6002 мс, p50 = p95 = 16.7 мс, нуль кадрів > 16.9.
- **Слабкий ноутбук:** `Emulation.setCPUThrottlingRate {rate:4|6}`. **Обовʼязковий
  контроль:** цикл 8 млн `Math.sqrt` має подорожчати (13.9 → 33.5 → 50.7 мс). Без
  контролю не писати «тримає під навантаженням».
- **Справжній prefers-reduced-motion:** `Emulation.setEmulatedMedia {features:[{name:
  'prefers-reduced-motion', value:'reduce'}]}` — це реальна медіа-ознака, а не клас
  і не підміна `matchMedia`. Перевіряти `matchMedia(...).matches === true` у виводі.
- **Клавіатура:** `Input.dispatchKeyEvent` (rawKeyDown + keyUp) реально рухає фокус.
- **Вʼюпорти:** `Emulation.setDeviceMetricsOverride` — справжній layout viewport,
  не iframe-обхід. 720 CSS px = 1440 при зумі 200 %.
- **Вага шрифтів:** `Network.enable` + `Network.loadingFinished.encodedDataLength`.

Не працює: системний буфер (`execCommand('copy')` → false, `clipboard.readText()` вимагає
фокуса вікна навіть із `setFocusEmulationEnabled`).

**Вкладку власника не піднімати.** `visibilityState: hidden`, 7 кадрів за 2.2 с ≈ 3 fps;
`osascript … set active tab index` спрацьовує й тут же відкочується назад — він у ній
працює. Живий Chrome лишається корисним рівно для одного: показати, що доставки
`IntersectionObserver` у нерендерованій вкладці НЕМАЄ.

Довгий CDP-скрипт друкувати покроково: `console.log` лише в кінці = таймаут без жодного
рядка. `Runtime.evaluate` з промісом вимагає `awaitPromise: true`, інакше повертає `{}`.
Дивись також [[verification-method]] і [[browser-harness-limits]].
