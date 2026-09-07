/* ============================================================================
   AIA · ТЕМА TAILWIND CDN → ТОКЕНИ ДИЗАЙН-СИСТЕМИ (задача 010)
   ----------------------------------------------------------------------------
   Замінює 66 інлайнових копій tailwind.config (1210 рядків) одним файлом.
   Тут НЕМАЄ ЖОДНОГО ЗНАЧЕННЯ — тільки посилання на токени з css/tokens.css.
   Саме через var() працює слот акценту курсу: [data-course] на <html> міняє
   --c-accent, і всі утиліти *-accent міняються разом із ним.

   ⚠ АЛЬФА-МОДИФІКАТОРИ ЗАБОРОНЕНІ. Спека §4.3 припускала, що bg-accent/10 з
   var()-кольором «мовчки віддасть непрозорий колір». ЗАМІРЯНО В ЖИВОМУ CHROME
   2026-09-07 (00-probe-result.md, має перевагу над спекою) — наслідок гірший:

       bg-accent/50  →  background-color: rgba(0, 0, 0, 0)

   Тобто елемент лишається ПОВНІСТЮ ПРОЗОРИМ, помилки в консолі немає.
   У проді таких класів 540 у 72 файлах, серед них bg-ink/85 ×65 — це липка
   шапка, крізь яку їхав би текст сторінки.
   Замість них — окремі токени: accent-quiet, ok-quiet, warn-quiet, err-quiet,
   info-quiet, veil-hover, veil-press.

   Підключати РІВНО ПІСЛЯ cdn.tailwindcss.com і ДО </head>.
   ========================================================================== */
tailwind.config = {
  /* ⚠ ДОДАНО Б1, У СПЕЦІ §4.3 ЦЬОГО РЯДКА НЕМАЄ.
     Причина — висновок 8 мобільної добірки (02-references-mobile): жодне з
     10 правил :hover системи не захищене, а на тач-екрані :hover «залипає»
     після тапу. Дельта components-010-b1.css знімає це для десяти ІМЕНОВАНИХ
     правил, але не може дістати до утиліт `hover:*`, яких у 66 HTML сотні.
     Прапорець Tailwind 3.4 загортає КОЖНУ утиліту `hover:` у
     @media (hover: hover) — одним рядком і без поіменного списку.
     Tailwind Docs дає 96 % захищених правил, Laravel 91 %; ми — 100 %. */
  future: { hoverOnlyWhenSupported: true },
  theme: {
    screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1440px" },
    extend: {
      colors: {
        bg: "var(--c-bg)", surface: "var(--c-surface)", raised: "var(--c-raised)",
        sunken: "var(--c-sunken)", desk: "var(--c-desk)", overlay: "var(--c-overlay)",
        "veil-hover": "var(--c-veil-hover)", "veil-press": "var(--c-veil-press)",

        fg: "var(--c-text)", "fg-2": "var(--c-text-2)", "fg-3": "var(--c-text-3)",
        "fg-off": "var(--c-text-disabled)", prose: "var(--c-prose)",
        "on-accent": "var(--c-on-accent)", "on-paper": "var(--c-on-paper)",

        line: "var(--c-line)", "line-lit": "var(--c-line-lit)",
        "line-strong": "var(--c-line-strong)", "line-accent": "var(--c-line-accent)",
        focus: "var(--c-focus)",

        accent: "var(--c-accent)", "accent-hover": "var(--c-accent-hover)",
        "accent-quiet": "var(--c-accent-quiet)", "accent-edge": "var(--c-accent-edge)",

        ok: "var(--c-ok-text)", "ok-edge": "var(--c-ok-edge)", "ok-quiet": "var(--c-ok-quiet)",
        warn: "var(--c-warn-text)", "warn-edge": "var(--c-warn-edge)", "warn-quiet": "var(--c-warn-quiet)",
        err: "var(--c-err-text)", "err-edge": "var(--c-err-edge)", "err-quiet": "var(--c-err-quiet)",
        info: "var(--c-info-text)", "info-edge": "var(--c-info-edge)", "info-quiet": "var(--c-info-quiet)",

        "paper-bg": "var(--c-paper-bg)", "paper-text": "var(--c-paper-text)",
        "paper-quiet": "var(--c-paper-quiet)", "paper-rule": "var(--c-paper-rule)"
      },
      fontFamily: {
        display: "var(--f-display)",
        sans: "var(--f-sans)",
        mono: "var(--f-mono)"
      },
      /* Перекриваємо ШТАТНУ шкалу Tailwind: text-xs/sm/base/lg по всьому сайту
         (1080 вживань) починають означати системні кеглі БЕЗ жодної заміни в
         розмітці. Заголовкові розміри тут свідомо ВІДСУТНІ — заголовки беруть
         класи ds-h1…ds-h4, бо --fs-h1/h2 уже fluid, і другий адаптив зверху
         дав би подвійну чутливість до ширини. */
      fontSize: {
        xs:    ["var(--fs-label)",   { lineHeight: "var(--lh-label)" }],
        sm:    ["var(--fs-ui)",      { lineHeight: "var(--lh-ui)" }],
        base:  ["var(--fs-body)",    { lineHeight: "var(--lh-body)" }],
        lg:    ["var(--fs-lead)",    { lineHeight: "var(--lh-lead)" }],
        small: ["var(--fs-small)",   { lineHeight: "var(--lh-small)" }],
        code:  ["var(--fs-code)",    { lineHeight: "var(--lh-code)" }],
        eyebrow: ["var(--fs-eyebrow)", { lineHeight: "var(--lh-eyebrow)" }]
      },
      lineHeight: { body: "var(--lh-body)", ui: "var(--lh-ui)", code: "var(--lh-code)" },
      letterSpacing: { eyebrow: "var(--tr-eyebrow)", display: "var(--tr-display)" },
      fontWeight: { regular: "var(--w-regular)", medium: "var(--w-medium)", semi: "var(--w-semi)" },
      borderRadius: {
        inner: "var(--r-inner)", control: "var(--r-control)",
        card: "var(--r-card)", sheet: "var(--r-sheet)", pill: "var(--r-pill)"
      },
      maxWidth: {
        wide: "var(--w-wide)", content: "var(--w-content)", prose: "var(--w-prose)",
        narrow: "var(--w-narrow)", card: "var(--w-card)", sidebar: "var(--w-sidebar)"
      },
      zIndex: {
        header: "var(--z-header)", sidebar: "var(--z-sidebar)", drawer: "var(--z-drawer)",
        scrim: "var(--z-scrim)", dialog: "var(--z-dialog)", toast: "var(--z-toast)",
        skip: "var(--z-skip)"
      },
      boxShadow: { dialog: "var(--sh-dialog)", sheet: "var(--sh-sheet)", desk: "var(--sh-desk)" },
      height: { ctl: "var(--ctl-h-md)", "ctl-sm": "var(--ctl-h-sm)", "ctl-lg": "var(--ctl-h-lg)" }
    }
  }
};
