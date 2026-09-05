---
name: method-pdf-link-click-testing
description: Як довести, що посилання в PDF реально клікається — стенд pdf.js з AnnotationLayer; вбудований переглядач Chrome для цього непридатний; стенд працює лише в АКТИВНІЙ вкладці
metadata:
  type: reference
---

Перевірено 2026-09-05 на сертифікаті задачі 005 (коло 3).

**Вбудований переглядач PDF у Chrome для екстеншена непридатний.** Підтверджено незалежно
від бекендера: після відкриття `http://127.0.0.1:PORT/файл.pdf` перший кадр порожній
(мініатюри білі), після одного кліку кадр один раз оновлюється — і далі **завмирає
назавжди**: скрол, зум кнопкою «−», кліки вже не змінюють знімок. П'ять взаємодій, нуль
результату. Клікати доводиться наосліп, а «не спрацювало» неможливо відрізнити від
«кадр старий». Не витрачати на це більше 2–3 спроб.

**Що працює: власний стенд на pdf.js із шаром анотацій.** Це не сурогат — `AnnotationLayer`
будує справжні `<a href>` **із самого словника анотацій PDF**, тим самим кодом, яким це
робить переглядач Firefox. Клік по такому якорю — чесний доказ клікабельності.

```
pdf.min.js + pdf_viewer.min.js (+ css) з cdnjs, версії мають збігатися
pdfjsLib.GlobalWorkerOptions.workerSrc = .../pdf.worker.min.js
const layer = new pdfjsLib.AnnotationLayer({div, page, viewport: vp.clone({dontFlip:true})});
layer.render({viewport: vp.clone({dontFlip:true}), div, annotations, page,
              linkService: new pdfjsViewer.SimpleLinkService()});
```

Три пастки, на які пішов час:
1. **`AnnotationLayer` у pdf.js 3.11 — клас, не обʼєкт зі статичним `render`.** Старий
   виклик `pdfjsLib.AnnotationLayer.render({...})` дає `is not a function`.
2. **`await layer.render(...)` іноді не резолвиться** — обгортати без `await`, читати
   `div.querySelectorAll('a[href]')` через ~1 с.
3. 🔴 **Стенд працює лише в АКТИВНІЙ вкладці.** У фоновій вкладці зависає вже перший
   `await img.decode()` / рендер сторінки: `QA` лишається порожнім, якорів 0, у лозі — нічого.
   Лікується одним `computer:screenshot` по цій вкладці перед `navigate` (знімок активує
   вкладку). Це той самий клас проблем, що [[method-cls-measurement]].

**jsQR на cdnjs немає** (`/ajax/libs/jsQR/1.4.0/jsQR.min.js` → 404). Робоче джерело —
`https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js`; надійніше скачати `curl`-ом і
роздати з локального сервера.

**Розбір байтів PDF (без бібліотек) лишається найдешевшим першим кроком:**
`/Subtype /Link` = кількість посилань · `/URI` = удвічі більше (`/S /URI` + `/URI (...)`) ·
`/DCTDecode` = кількість JPEG-сторінок · `/Annots` = масиви анотацій · JPEG-потоки
витягуються пошуком `ffd8ff`…`ffd9` і читаються як звичайні картинки.

⚠️ **`find -newermt '-20 minutes'` на macOS мовчки не знаходить нічого** — BSD `find` так
не вміє. Шукати завантажений файл через `python3 os.listdir`, а не `find`/glob: імена з
кирилицею ще й лежать у NFD, тому літеральний рядок у `grep`/`ls` не збігається.
