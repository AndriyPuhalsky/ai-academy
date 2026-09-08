---
name: project-009-design-system-refs
description: Що зібрано, вирішено й відхилено в добірці 009 «Єдина дизайн-система» — не приносити вдруге
metadata:
  type: project
---

Добірка 009 закрита 2026-09-07. Вихід — `dev/design/009-design-system/02-references/`
(`index.html` згенерований з `data.json` через `build.js`, `shortlist.md`, `lab/` × 3, 82 кадри).
76 переглянутих сторінок, 38 відібраних, 31 гарнітура через рендер-тест.

**Why:** власник обирає очима і не хоче бачити вдруге те, що вже бачив; наступні добірки
мають починатись із цього списку, а не з нуля.

**How to apply:** перед новим пошуком по темній системі / типографіці звірятись із цим файлом.

**Чотири типопари, які пішли як вісь варіантів (усі OFL, усі у Figma, усі пройшли рендер-тест):**
A Prata / Golos Text / JetBrains Mono (215 КБ) · B Unbounded / Onest / Martian Mono (197 КБ) ·
C Yeseva One / Commissioner / Geist Mono (210 КБ) · D резерв Arsenal / Wix Madefor Text /
JetBrains Mono (164 КБ). Рекомендація як точка відліку — **A**; найсильніший зсув — **B**.

**Взято в добірку (не описувати наново):** Herzog & de Meuron, Gagosian, A. Lange & Söhne,
Chipperfield, Bang & Olufsen, Phillips, Fitzcarraldo, teenage engineering · Radix Colors,
Radix Themes Playground, Vercel Geist, IBM Carbon, Atlassian, Material 3, Adobe Spectrum,
animations.dev, motion.dev, shadcn/ui Themes · banda.agency, Fixel (MacPaw), Мистецький
арсенал, Ukraїner, Довженко-Центр, PinchukArtCentre · scroll-driven-animations.style,
Apple MacBook Pro, basement.studio, Rive, Radix Accordion, minimal.gallery ·
react.dev, Astro Docs, Laravel Docs, Supabase Docs.

**Антиреференси, названі з вимірами:** LangChain (`#030710` холодний синьо-чорний),
Projector (`#3548FE` на весь екран), Coursera (78 IO на 79 карток), Udemy (фіолетовий
`oklch(0.4841 0.2342 293.93)`).

**Мертві джерела:** `kyivtype.com` не резолвиться · `rastvortsev.com` таймаут ·
`land-book.com/?tag=dark` і `s2.spectrum.adobe.com` віддають порожню сторінку ·
Udemy-головна за бот-стіною (міряти `/courses/development/`).

**Три негативні результати, які цінніші за половину позитивних:**
1. **Стагера немає в жодного з пʼяти преміальних сайтів** (godly, minimal.gallery, HdM, Lange, B&O) —
   інкрементних `transition-delay` нуль.
2. **Жодна з чотирьох темних систем не масштабує на `:active`** — усі міняють альфу або `brightness`.
3. **Лічильника-тікера немає в жодного люксу поза IT** — він живе тільки на SaaS-лендінгах.

**Знайдено в чинному проді (передано в `index.html`, розділ 02):** `quiz bad #C0564F` провалює
AA на всіх трьох поверхнях (4.14/3.82/3.48, 57 сторінок уроків); `term-err #C97070` провалює на
`raised` (4.48); `clay #D97757` під білим — 3.12.

Див. [[project-005-ai-terminal-refs]], [[reference-measurement-harness]].
