# Стенд замірів 011 (2026-09-10)

Власний Chrome по CDP (Node 25, вбудований `WebSocket`, нуль інсталяцій) + два локальні
сервери: **8312 — незмінна копія `HEAD` («до»)**, **8311 — робоче дерево («після»)**.

```bash
cd /Users/ander1.sage/Downloads/AIA && python3 -m http.server 8311 --bind 127.0.0.1 &
mkdir -p /tmp/aia-base && git archive HEAD | tar -x -C /tmp/aia-base && (cd /tmp/aia-base && python3 -m http.server 8312 --bind 127.0.0.1 &)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9333 \
  --user-data-dir=/tmp/aia-chrome --no-first-run --no-default-browser-check \
  --disable-features=CalculateNativeWinOcclusion --disable-backgrounding-occluded-windows \
  --disable-renderer-backgrounding --window-size=1500,1000 about:blank &
cd dev/build/011-open-tails/stand && S=$PWD/shots BASE=http://127.0.0.1:8311 node t10-gate.mjs
```

| Скрипт | Що міряє | Результат |
| ------ | -------- | --------- |
| `cdp.mjs` | клієнт CDP: вкладка, вʼюпорт, eval, знімок, `CLS_PROBE`; **кеш вимкнено завжди** | — |
| `t1.mjs` | меню на прокрученій сторінці, гейт гостя, hero по ширинах, CLS лендінга (база) | `t1.out.json` |
| `t2-hero.mjs` | сітка hero: 115 ширин (база) | `base-hero.json` → `../measure-hero.md` |
| `t3-tables.mjs` | ширини колонок усіх таблиць, 3 ширини (`TOKEN=1` обходить замок) | `base-tables.json`, `after-tables.json`; порівняння — `diff-tables.py` |
| `t3b-lines.mjs` | те саме + СПРАВЖНЯ кількість рядків першої клітинки (Range) | `base-lines.json` (39a70a3, 3 ширини), `after-lines-1280.json` (робоче дерево після wrap-set); порівняння — `diff-lines.py base-lines-1280.json after-lines-1280.json` |
| `t4-diag.mjs` | діаграми (база): svg, корінь, центрування | `base-diag.json` |
| `t5-verify.mjs` | роадмап ×4, Mermaid на 4 сторінках, зламана проба, гейт, D-26/D-19, меню | `t5.out.json` (секції 2 і 5 знято до вимкнення кеша; секція 6 застаріла) |
| `t5-menu.mjs` | секція 6 окремо: меню на прокрученій сторінці, замок СПРАВЖНІМ колесом (`Input.dispatchMouseEvent`), компенсація, 640×360 | `t5-menu.out.json` (2026-09-10, після компенсації) |
| `t6-probe.mjs` | проба зламаної діаграми (`../probe-broken-diagram.html`) | у stdout |
| `t7-diag-after.mjs` | діаграми після: скролер = `<pre>`, tabindex/role/name, fade | `after-diag.json` (до переносу скролера), `after3-diag.json` (після) |
| `t8-fade.mjs` | стани `data-scroll-fade` + знімки чотирьох типів скролерів | `t8.out.json`, `shots/t8-*` |
| `t9-hero-reserve.mjs` | резерв hero (конфіг заблокований) проти фактичних висот; CLS на 9 ширинах | `t9.out.json` (перезнято 2026-09-10: 115/115, CLS ≤ 0,009), `t9.out.prev.json` — попередній |
| `t10-gate.mjs` | замок гостя: час появи, CLS, «схожий на залогіненого», OAuth-повернення | `t10.out.json` (перезнято 2026-09-10 з чистим сховищем) |
| `apply-011-b.py` | скрипт, яким застосовано другу партію правок (таблиці, скролер, підказка) | уже застосовано |

**Пастки стенда:** (1) кеш Chrome по CDP віддає старі `css/js` — у `cdp.mjs` вимкнено;
(2) фальшивий ключ `sb-probe-auth-token` у `localStorage` лишається в origin — гостьові
заміри після нього хибні (`t10` тепер прибирає його); (3) синхронний замок гостя дає нульові
ширини на уроках — обходити тим самим ключем; (4) не ганяти два Mermaid-важкі прогони
паралельно; (5) `window.scrollBy` під `overflow: hidden` усе одно прокручує — замок скролу доводити лише подією колеса через CDP.
