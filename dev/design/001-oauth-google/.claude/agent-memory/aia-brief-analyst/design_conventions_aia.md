---
name: aia-design-conventions
description: Token and motion conventions decided for AIA in task 001 (line-strong, clay-deep AA fix, no GSAP in-system, dialog timings) — reuse these instead of re-deciding
metadata:
  type: project
---

Conventions fixed while specifying task 001 (`dev/design/001-oauth-google/01-spec.md`).
Future AIA design tasks should follow them unless the owner changes direction.

**Palette facts (recomputed, WCAG 2.x, card bg `surface` #1E1B18):**
- `faint` #7A7164 = 3.57:1 → **fails AA as small text**. It is nonetheless used at 11–12px
  all over `css/custom.css` (`.badge-soon`, `.snav-track`, `.quiz-status`,
  `.diagram-caption`, `.example-head`). Do not add new `faint` text; the site-wide sweep
  is a design-system-level task, not a per-feature one.
- `line` #3A342E = 1.40:1 → fails SC 1.4.11 (3:1) as a control-identifying border.
  Inputs (`bg-ink` inside a `surface` card = 1.19:1) are today identified by that border
  alone, so the existing inputs already fail.
  → Convention: new token **`line-strong` #736A5E** (3.23 on surface, 3.49 on ink) for any
  border that identifies a control; `line` stays for decorative hairlines only.
  (Note: `00-review.md` §2 suggested "≈#6A6055 and lighter" — that value is 2.79 and fails.)
- `clay-deep` #BD5F40 with `text-ink` = 4.31:1 → fails AA on hover.
  → Convention: **`clay-deep` = #C4674A** (4.76:1). Safe because the token is used *only*
  as `hover:bg-clay-deep` (45 occurrences); the literal `#BD5F40` lives solely in
  `js/certificate.js` (PDF on cream) and does not read the token.
- Global `:focus-visible` (2px #D97757, offset 3px) = 5.49:1 — already compliant, do not
  touch. Caveat: it hardcodes `border-radius: 6px`, which looks broken around pill buttons.

**Motion conventions:**
- **No GSAP for `у межах системи` tasks.** The site has zero GSAP (`grep` = 0 hits); adding
  a CDN script to 37 HTML pages for a modal fade is disproportionate. GSAP arrives with the
  design system, not with feature tasks.
- Utility dialogs: enter 180–220ms ease-out, **exit 130ms** (faster than enter),
  **no inner stagger** (frequency-of-use principle — the login modal is seen often and in a
  "just let me in" state).
- Any new motion must be written into the `prefers-reduced-motion` block in
  `css/custom.css` explicitly — the existing block only covers `.reveal`, `.caret` and
  `scroll-behavior`, nothing inherits.

**Structural facts worth not rediscovering:**
- `architect.html` has a byte-identical `tailwind.config` palette to `index.html` — "both
  platforms" means one visual, not two.
- On <640px a logged-in user sees only "Вийти" in the header: no name, no certificates link.
- `js/quiz.js` never talks to the server. `rpc("submit_quiz")` fires from `#completeBtn`
  in `js/module.js`, so "before the last quiz submit" means before that button's click.

See also [[aia-design-task-files]].
