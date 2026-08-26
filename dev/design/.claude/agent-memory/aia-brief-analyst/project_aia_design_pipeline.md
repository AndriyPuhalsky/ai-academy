---
name: aia-design-pipeline-staging
description: Owner runs the AIA design pipeline in stages and approves direction between them; task 003 was explicitly capped at agents 1-2 (spec + references)
metadata:
  type: project
---

The four-agent design pipeline in `dev/design/` is **not** a fire-and-forget chain. The
owner keeps a gate between steps and decides personally when the next agent runs. On task
003 (roadmap page, opened 2026-08-25) he capped the run at agent №1 + agent №2 and stopped:
no mockup (№3), no variants (№4) until he approves a direction from the references.

**Why:** he does not want a mockup built on a visual direction he never chose. On 003 he
gave zero references and zero anti-references on purpose — the agreed order of work is
"mood is decided by research, not by words" (`dev/design/CLAUDE.md`).

**How to apply:** before writing a spec, check the task's `Етап` field and
`dev/design/JOURNAL.md` → «Активне». If the run stops at references, the spec's job changes:
§«Що передати далі → агенту №2» becomes the primary deliverable (search angles, diversity
axes, explicit "do not search for" list, per-motion-slot coverage requirement), and the
mockup-facing sections are written for later rather than for now. Also: he asked for the
reference deliverable as a **browsable HTML page**, not a markdown list of links — that
request lives in `JOURNAL.md`, not in the agent definition, so it is easy to miss.

See also [[aia-owner-decision-style]], [[feedback-hypothesis-must-be-labelled]].
