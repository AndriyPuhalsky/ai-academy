---
name: aia-design-conventions
description: Cross-task design decisions for AIA — CSS class prefix rule (one task = one prefix), the reduced-motion by-name token list, and the .prose-aia specificity trap
metadata:
  type: project
---

Decisions that must stay consistent across design tasks. Verified in code 2026-09-03.

**One task = one CSS prefix, BEM inside it.** `css/custom.css` has three generations of
names: legacy flat (`.badge`, `.example`, `.quiz-*`), task 001 → `aia-*` (`.aia-panel__title`,
`.aia-card--paper`), task 003 → `rm-*` (`.rm-row--done`). Task 005 therefore gets `term-*`
(component) and `cc-*` (landing page only). Grep before claiming a prefix is free — all
three above were verified empty for `term`/`cc` at the time of writing.
**Why:** `css/custom.css` is shared by ~45 pages, and short/generic classes collide silently.
**How to apply:** every new component spec needs a full old→new rename table, not "pick
something safe".

**`@media (prefers-reduced-motion: reduce)` in `css/custom.css` works from a BY-NAME token
list** (around lines 1034–1088). A new duration token that is not written into that block
stays alive under reduced motion. Task 003 already made this an acceptance criterion; the
file's own comment at ~1028 says so.
**Why:** the site's motion numbers live in CSS custom properties and JS reads them via
`getComputedStyle` (`js/roadmap-motion.js:57–92`), so zeroing the tokens is what disables
GSAP too. Miss one token and both CSS and JS keep moving.
**How to apply:** any spec that introduces motion must list its new tokens and make
"each one present by name in the reduce block" a numbered acceptance criterion.

**Specificity trap on module pages:** lesson content lives in
`<article class="prose-aia max-w-3xl">`, and `.prose-aia pre` (specificity 0,1,1) sets
`white-space: pre-wrap`, `word-break: break-word`, plus its own border/background/padding.
Any new single-class `<pre>` component placed inside a lesson loses to it — columns of diffs
/ trees / CLI output collapse.
**How to apply:** new `<pre>`-based components need selectors at ≥ (0,2,0) and an explicit
reset of margin, border, background, radius, padding, white-space, word-break.

**GSAP is attached exactly one way in this project** — 3.13.0 from jsDelivr, three files
(core + ScrollTrigger + CustomEase), see `roadmap.html:174–176`. New pages copy this, they
do not invent their own set.

See also [[aia-design-pipeline-staging]], [[feedback-hypothesis-must-be-labelled]].
