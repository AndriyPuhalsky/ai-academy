---
name: headless-visual-check
description: Як реально побачити макет своїми очима в цьому середовищі — headless Chrome, його дві пастки й обхідні прийоми
metadata:
  type: reference
---

Браузерних MCP-інструментів у мене немає, але **візуальна перевірка можлива**:
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless=new --disable-gpu
--hide-scrollbars --virtual-time-budget=5000 --window-size=W,H --screenshot=/tmp/x.png URL`
плюс `--dump-dom` для читання обчислених стилів через тимчасову probe-сторінку з iframe.

**Дві пастки, на яких легко зробити хибний висновок (обидві виміряні 2026-09-03):**

1. **`requestAnimationFrame` викликається рівно один раз** — композитора немає, тому GSAP
   не тікає взагалі (перевірено тестом: `raf=1, gsap=true, x=0`). IntersectionObserver із
   тієї ж причини не спрацьовує. Наслідок: анімацію в русі headless показати НЕ може.
   Обхід: `--force-prefers-reduced-motion` дає фінальний кадр, а проміжний кадр знімається
   підстановкою анімованої CSS-змінної руками через probe-сторінку.

2. **Десктопний Chrome не робить вікно вужче ~500px** — `--window-size=390,844` мовчки
   віддає скріншот ширшого в'юпорта, обрізаний до 390. Виглядає як зламана мобілка, хоча
   верстка ціла. Обхід: probe-сторінка з `<iframe style="width:390px">` і скріншот її.

**Чого немає:** poppler (PDF не рендериться), PIL, playwright, puppeteer.
`sips` є, але кроп працює не так, як очікується — простіше знімати потрібну область,
скролячи iframe скриптом.

**Що ще зручно робити тим самим probe-прийомом:** побайтовий тест копіювання
(`Range` + `selection.toString() === pre.textContent`), пошук горизонтального скролу
(`documentElement.scrollWidth` vs `clientWidth` на списку ширин), заміри частки площі
першого екрана, читання `getComputedStyle` для доведення, що конфлікт специфічностей знято.

Пов'язане: [[aia-005-terminal-build]]
