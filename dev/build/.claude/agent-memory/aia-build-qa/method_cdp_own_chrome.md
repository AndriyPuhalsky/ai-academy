---
name: method-cdp-own-chrome
description: Власний Chrome із --remote-debugging-port + CDP через вбудований WebSocket Node знімає ВСІ пастки схованого вікна одразу — справжній вʼюпорт, справжній Tab, справжній CLS, справжній rAF
metadata:
  type: reference
---

# Власний Chrome по CDP — один інструмент замість шести обхідних шляхів

Перевірено 2026-09-08 (задача 010, коло 2, загальний прогін). **Нуль інсталяцій:**
Node 25 має вбудований `WebSocket`, Chrome уже стоїть, CDP — це просто JSON по вебсокету.

**Why:** вікно під розширенням `claude-in-chrome` завжди `visibilityState === "hidden"`
(див. [[method-hidden-window-traps]]), і через це мовчки брешуть `resize_window`,
`rAF`, `IntersectionObserver`, `ResizeObserver`, `layout-shift`, `:focus-visible`,
`getComputedStyle` під час переходу. Кожну з цих пасток можна обходити окремо — або
підняти власний Chrome, де жодної з них немає взагалі. У цьому колі власний Chrome
дав `visibilityState: "visible"`, `hasFocus: true`, 60,0 fps і живі записи `layout-shift`
**з першої спроби**.

**How to apply:**

## Запуск

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9333 --user-data-dir=<тимчасовий профіль> \
  --no-first-run --no-default-browser-check \
  --disable-features=CalculateNativeWinOcclusion \
  --disable-backgrounding-occluded-windows --disable-renderer-backgrounding \
  --window-size=1500,1000 --window-position=0,0 about:blank &
```

Три `--disable-*` обовʼязкові: без них Chrome сам приспить вікно, щойно воно перекриється,
і повернуться ті самі пастки. `--user-data-dir` на тимчасовій теці = **нуль доступу до
живої сесії**, тобто гостьові тести безпечні без localhost-обхідного шляху.

## Що це дає, чого немає інакше

| Потреба | Виклик CDP | Заміна, якої більше не треба |
| ------- | ---------- | ---------------------------- |
| справжній вʼюпорт 320/390/768/1024/1440 | `Emulation.setDeviceMetricsOverride` | iframe, підміна `--w-prose` |
| справжній `Tab`, що вмикає `:focus-visible` | `Input.dispatchKeyEvent` (`rawKeyDown` + `keyUp`) | клас-двійник, розбір CSSOM |
| справжній CLS і LCP | `Page.addScriptToEvaluateOnNewDocument` з `PerformanceObserver` **до** скриптів сторінки | заміри геометрії пробниками |
| `prefers-reduced-motion: reduce` без перезапуску | `Emulation.setEmulatedMedia` | клас-двійник `html.rm` |
| «бекенд лежить», «конфіг лежить», «CDN лежить» | `Network.setBlockedURLs` | нічого, це було недоступно |
| offline | `Network.emulateNetworkConditions` | — |
| доступні імена без здогадок | `Accessibility.getFullAXTree` | читання атрибутів руками |

## Дві пастки самого методу

1. **Не запускати два прогони паралельно.** Через конкуренцію за CPU Mermaid не встигає
   домалювати, і замір показує «78 діаграм зі 100 без `<svg>`» — дефекту, якого немає.
   Правильно: у кожному замірі **чекати умову**, а не таймаут
   (`while(pre.mermaid:not([data-processed]).length || svg.length !== pre.length)`),
   тоді результат не залежить від завантаженості машини.
2. **`Page.captureScreenshot` не атомарний із `Runtime.evaluate`.** Між перевіркою
   «`h1` ще порожній» і знімком гідратація встигає завершитись, і знімок «до» показує
   стан «після». Для доказу зсуву вірити **трасі геометрії кожні 20–25 мс** і записам
   `layout-shift`, а не знімку.

## Дрібниця, що коштувала виклику

`$(curl -s …)` у shell **зʼїдає кінцевий перенос рядка**, тому SHA-1 не збігається.
Звіряти файли тільки через `curl -sL -o файл` + `shasum` (і `-L` обовʼязково: Workers
віддає 307 на `.html`-форму, без `-L` хешується порожнє тіло).

## Третя пастка методу (зловлена в колі 3, коштувала цілого прогону)

`Page.addScriptToEvaluateOnNewDocument` виконується **до того, як існує
`document.documentElement`**. Тому звичне
`(document.head||document.documentElement).appendChild(style)` кидає
`TypeError: Cannot read properties of null` — і найгірше не це, а те, що виняток
потрапляє у **власний лічильник помилок консолі**. Перший прогін дав «58 сторінок
із помилками консолі», хоча всі 58 помилок були мої, а сторінки чисті.

```js
(function add(){ var r = document.head || document.documentElement;
  if (!r) { setTimeout(add, 0); return; }          // ← без цього падає
  var s = document.createElement('style'); s.textContent = '…'; r.appendChild(s); })();
```

І окремо: у фільтрі помилок відсікати свої (`!/<anonymous>/.test(text)`), інакше
власний стенд назавжди імітує дефект сторінки.

## Що варто мірити саме тут, бо інакше воно бреше

- **Прод проти дева — тільки через один і той самий хост.** `ai-academia.com.ua` і
  `*.workers.dev` кешуються по-різному, і на CLS це видно. Брати
  `ai-academy.andriy-puhalsky.workers.dev` як «прод».
- **Повільна мережа як окремий режим:** `Network.emulateNetworkConditions`
  (latency 150, down 180000) + `Emulation.setCPUThrottlingRate {rate:4}` гарантує,
  що гідратація не встигне до першого кадру. Без цього швидка машина ховає CLS,
  який реальний мобільний користувач бачить.
- **`mobile:true` у `setDeviceMetricsOverride`** для ширин < 700 — інакше медіа-запити
  й обробка `meta viewport` не ті, що на телефоні.
