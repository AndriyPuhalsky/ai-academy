---
name: aia-design-task-files
description: Reading order and authority ranking of files inside a dev/design/NNN-slug task folder — 00-decisions beats 00-review beats task.md
metadata:
  type: reference
---

A task folder in `dev/design/NNN-slug/` may contain more than the template's `task.md`.
Authority order, highest first:

1. `00-decisions.md` — owner decisions captured in live dialogue **after** the brief was
   written. These are **inputs, not proposals**: never re-open them as questions.
2. `00-review.md` — technical reconciliation of the brief against real site code, done by
   session `design_1` before the pipeline starts (contrast numbers, code line references,
   gaps in the brief). Don't re-verify what it already verified; cite it — but do
   spot-check its arithmetic, 001 contained one wrong threshold.
3. `task.md` — the brief itself. May be stale where scope changed later; such places are
   marked inline (e.g. `[LinkedIn: відкладено]`).

**Why:** the owner refines the brief in conversation rather than rewriting it, so the
newest file wins and the brief keeps its original reasoning for later iterations.

**How to apply:** read all three before writing `01-spec.md`, in that order. If the
launching message says open questions go at the end of the spec (the template puts them at
the top), follow the message and leave a pointer at the top.

See also [[aia-design-conventions]].
