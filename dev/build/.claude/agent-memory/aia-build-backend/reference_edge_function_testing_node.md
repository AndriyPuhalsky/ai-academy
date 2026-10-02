---
name: edge-function-testing-node
description: Deno на машині немає — Edge Function tg/telegram_index.ts перевіряється прогоном справжнього Deno.serve у Node 25 із підміненими Deno, fetch і createClient
metadata:
  type: reference
---

**`deno` на машині власника НЕ встановлений** (`deno not found`, станом на 2026-10-01;
Supabase CLI теж немає, папки `supabase/` в репозиторії немає). Тому `deno check` на
`tg/telegram_index.ts` запустити не вийде — і не треба вдавати, що перевірив.

**Чим замінюється (спрацювало в 013, 16 перевірок):** прогін **справжнього** обробника
`Deno.serve` у Node 25 зі стрипінгом типів. Node запускає `.ts` напряму:
`node --experimental-strip-types test.ts`.

Схема (усе в scratchpad, не в репозиторії):

1. скопіювати файл функції, замінивши рядок `import { createClient } from "https://esm.sh/…"`
   на `const createClient = globalThis.__fakeCreateClient;` — URL-імпорт Node не вирішує;
2. у тест-файлі **до** `await import("./handler.ts")` поставити заглушки:
   - `globalThis.Deno = { env: { get: k => ENV[k] }, serve: h => { handler = h } }` —
     так обробник ловиться в змінну й сервер не піднімається;
   - `globalThis.fetch` — записує `{api, payload}` замість справжніх викликів Telegram
     (`url.split("/").pop()` дає `sendMessage` / `sendDocument` / `answerCallbackQuery`);
   - `__fakeCreateClient` — мінімальний будівельник: `from/select/order/range/eq/
     maybeSingle` вертають `this`, плюс `then()`, щоб об'єкт був awaitable, як у
     supabase-js;
3. ганяти `handler(new Request(...))` і дивитись на записані виклики.

**Обов'язково додавати перевірки-регресії** на дії, яких не торкався (`/stats`, вебхук
`profiles`): саме вони ловлять зачеплену мимохідь маршрутизацію.

**Дві пастки самого методу, обидві дають хибний «провал»:**

1. **`Blob.text()` зрізає BOM** (так вимагає спека «UTF-8 decode»). Перевірка
   `csv.charCodeAt(0) === 0xFEFF` провалиться на цілком правильному файлі. Дивитись
   байти: `new Uint8Array(await blob.arrayBuffer())` → `EF BB BF`.
2. **Node не приймає не-ASCII у значенні заголовка** `Request` («Cannot convert argument
   to a ByteString»). Тестовий «хибний секрет» писати латиницею.

Для CSV додатково варто записати файл і прочитати Python'ом як `utf-8-sig`
(`csv.reader`): показує і BOM, і однакову кількість колонок у всіх рядках, і що ім'я
з комою розібралось в одну клітинку.

Деплой робить власник/коренева сесія — див. [[aia-migration-apply-via-chrome]].
