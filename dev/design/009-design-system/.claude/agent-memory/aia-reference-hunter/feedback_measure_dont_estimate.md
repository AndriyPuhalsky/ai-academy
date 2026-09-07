---
name: feedback-measure-dont-estimate
description: Verify brand guidelines and layout limits by rendering and measuring them, not by reading docs or trusting upstream spec numbers
metadata:
  type: feedback
---

When a spec states a constraint as fact, re-derive it by measurement before passing it
on. On task 001 this changed three conclusions:

- The spec called 320 px "the only real constraint on the composition" and forbade a
  label for not fitting. Measured in IBM Plex Sans Medium 14/0.25px: the default label
  had **37 px of slack**, and the "forbidden" one actually fit with 4.8 px. The ban was
  still right, but for a different reason (no safety margin), and the panic was not.
- The spec treated substituting Google Sans as a named deviation. Rendering Google's own
  widget showed it declares `"Google Sans", arial, sans-serif` and fetches **no webfont
  at all** on third-party origins — so Google's own button ships the same substitution.
- The spec estimated the header auth control at "≈80×30". It is **75×32** for guests and
  **307×34** when signed in — a 232 px difference that decides whether the skeleton
  causes layout shift.

**Why:** these numbers become acceptance criteria for agent №4, so an estimate passed
along as fact gets validated as fact and ships wrong.

**How to apply:** for brand assets, render the vendor's official widget with the real
locale on the real background colour instead of reading the guidelines page alone — the
live widget and the normative doc can disagree (Google's light stroke is `#747775` in
the doc, `#DADCE0` in the widget). For layout limits, measure text in the actual font
and weight the site loads. Use [[reference-browser-fallback]] to do it.

Corollary: state plainly what could **not** be verified. Do not fill gaps with plausible
numbers.
