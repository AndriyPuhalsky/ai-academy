---
name: reference-measurement-harness
description: Робочий стенд вимірювання референсів — playwright-core + CDP + Google Fonts API; що саме він дає і які пастки вже вирішені
metadata:
  type: reference
---

Стенд, зібраний на 009 і придатний до повторного вжитку. Chrome for Testing
`~/Library/Caches/ms-playwright/chromium-1228/...` + `playwright-core` (npm i у скретчпад, ~2 с).
Розширення `mcp__claude-in-chrome` не потрібне.

**Що стенд дає такого, чого не дасть скріншот:**
- `addInitScript`, який обгортає `IntersectionObserver` і `addEventListener('scroll')` **до**
  завантаження сторінки → точна кількість тригерів. Це число відрізняє «дорогий спокій»
  (Chipperfield: 1 IO на 22 000 px) від «каталогу» (Coursera: 78 IO на 79 карток).
- **CDP `CSS.forcePseudoState`** для `:hover` / `:active` / `:focus-visible` замість руху миші.
  Дає точний дифф computed-стилів. Саме так знайдено подвійне кільце фокуса й те, що
  Radix на `:active` робить `brightness(1.08)`, а не `scale`.
- `Emulation.setCPUThrottlingRate` — показує ціну прийому на слабкій машині (посимвольний
  друк: 68 мс головного потоку → 181–230 мс при ×6).
- Обхід банерів згоди: **не клацати**, а видаляти фіксовані оверлеї з DOM перед знімком
  (регекс по id/class: cookie|consent|gdpr|onetrust|didomi|usercentrics…). Клік по «Прийняти»
  — дія, на яку немає дозволу; видалення для знімка нічого не приймає.

**Шрифти міряються трьома джерелами, і всі три потрібні:**
1. `https://fonts.google.com/metadata/fonts` — JSON на 1946 родин: `subsets`, `designers`,
   `axes`, `category`. Так знаходяться всі родини з кирилицею (294) одним запитом.
2. CSS-API `css2?family=X:wght@...` з десктопним UA → блоки `/* cyrillic */ @font-face`;
   качаєш `woff2` і **важиш реально**, а не за описом.
3. **Рендер-тест у канвасі:** гліф малюється обраною гарнітурою і дефолтним фолбеком,
   порівнюються пікселі. Контроль «A» доводить, що родина взагалі завантажилась.
   ⚠ Пастка: Google Fonts вантажить підмножину лише коли символ **вжито в DOM**. Спершу
   намалювати зразок у сторінці, тоді `await document.fonts.load(w+' 42px "X"', 'ҐєіЇʼ')`,
   і аж тоді тестувати — інакше все дасть «NOTLOADED».

**Дві знахідки про підмножини, які варто памʼятати:** український апостроф `ʼ` (U+02BC)
лежить у підмножині `latin`, не `cyrillic`; `₴` (U+20B4) — у жодній із двох.

Див. також [[feedback-measure-dont-estimate]], [[feedback-reference-method]].
