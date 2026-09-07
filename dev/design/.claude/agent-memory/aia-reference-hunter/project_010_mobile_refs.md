---
name: project-010-mobile-refs
description: Добірка 010 «мобільні вʼюпорти» — що вже заміряно, які числа авторитетні, і чого не міряти вдруге
metadata:
  type: project
---

Добірка закрита 2026-09-07. Вихід — `dev/design/010-page-templates/02-references-mobile/`
(`index.html` + `data.json` + `build.js` + `findings.md` + `lab/` ×2 + `shots/` 26 знімків, 960 КБ разом).
Закрила відкритий пункт №2 з `009-design-system/SUMMARY.md` і дала число для пункту №1.

**Why:** уся добірка 009 знята на 1440; повторно ці ж сайти на мобілці міряти немає сенсу —
числа лежать у `data.json` і відтворюються `build.js`.

**How to apply:** перед новим мобільним виміром звірятись із цим списком.

Заміряно на 320 · 390 · 430 · 768 · 1440 (справжня емуляція: `isMobile`, `hasTouch`, DPR, мобільний UA):
react.dev · docs.astro.build · laravel.com/docs · supabase.com/docs · polaris.shopify.com ·
animations.dev · fluent2.microsoft.design · atlassian.design · m3.material.io ·
**додані свідомо** developer.mozilla.org, tailwindcss.com/docs, radix-ui.com/primitives, emilkowal.ski ·
**наші** урок c05 / c14, урок architect-07, довідник команд, лендінг, роадмап, verify, styleguide 009 variant-a.

**Числа, які є авторитетними (один 200-символьний зразок, шрифт справді завантажений, живий вимір):**
IBM Plex Sans 17px укр `8.494` / англ `7.580` · Golos Text 17px укр `8.926` / англ `8.159` ·
JetBrains Mono 13.52px крок `8.11` · IBM Plex Mono 12px крок `7.20`.
⚠️ **Не змішувати зразки тексту:** інший рядок дає інше середнє (розбіжність 1 % уже змінює 86,0 на 86,9).
Ранній вимір 8.403 / 8.842 зроблений іншим 400-символьним зразком — **не використовувати**.

**Головні висновки, які не треба перевідкривати:** кегль тіла на мобілці не зменшує ніхто (11 із 12) ·
правило 45–75 символів на телефоні не виконує ніхто (25,9–41,2 укр.) · липку шапку при скролі не
ховає ніхто (19 із 20) · рух на мобілці не гасить ніхто (18 із 20 однакові переходи), react.dev
єдиний скорочує — і не анімацію, а слухачів скролу 53→30 · маски-фейду на краю горизонтального
скролера немає в жодного з ~30 · `overflow-wrap: anywhere` тримає 208 інлайнових `code` на 320,
а `break-word` і `normal` ламаються (Radix 7, Tailwind 5 виходять за вʼюпорт).

**Заміряні дефекти 009, передані в 010:** `.ds-tbl thead th { position: sticky }` мертвий
(скролпорт — сам `.ds-tbl__wrap` заввишки 4917 px) · загублено `overscroll-behavior-x: contain`,
`env(safe-area-inset-*)` і `-webkit-tap-highlight-color` · немає `scroll-padding-top` на `html` ·
0 із 10 правил `:hover` захищені `@media (hover: hover)`.

Див. також [[feedback-reference-method]] і [[feedback-measure-dont-estimate]].
