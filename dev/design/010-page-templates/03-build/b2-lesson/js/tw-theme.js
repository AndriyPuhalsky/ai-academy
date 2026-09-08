/* ============================================================================
   AIA · ТЕМА TAILWIND CDN → ТОКЕНИ ДИЗАЙН-СИСТЕМИ (задача 010)
   ----------------------------------------------------------------------------
   ⚠ ЦЕ КОПІЯ §4.3 СПЕКИ, ДОСЛІВНО. Канонічний власник файла — Б1.
   Тут вона лежить лише для того, щоб кадри Б2 відкривались і мірялись
   самостійно. При злитті пакета беруть копію Б1, а цю викидають.

   Замінює 66 інлайнових копій tailwind.config (1210 рядків) одним файлом.
   Тут НЕМАЄ ЖОДНОГО ЗНАЧЕННЯ — тільки посилання на токени з css/tokens.css.
   Саме через var() працює слот акценту курсу: [data-course] на <html> міняє
   --c-accent, і всі утиліти *-accent міняються разом із ним.

   ⚠ АЛЬФА-МОДИФІКАТОРИ ЗАБОРОНЕНІ. Проба 010 (00-probe-result.md) виміряла
   наслідок, гірший за описаний у спеці: bg-accent/50 віддає
   `background-color: rgba(0, 0, 0, 0)` — елемент лишається ПОВНІСТЮ
   ПРОЗОРИМ, і помилки в консолі немає. 540 вживань у 72 файлах.
   Замість них — окремі токени: accent-quiet, ok-quiet, warn-quiet,
   err-quiet, info-quiet, veil-hover, veil-press.

   Підключати РІВНО ПІСЛЯ cdn.tailwindcss.com і ДО </head>.
   ========================================================================== */
tailwind.config = {
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
