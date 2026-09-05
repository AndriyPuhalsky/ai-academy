---
name: aia-two-flow-tasks
description: Task 005 (AI Термінал) deliberately mixes design-from-scratch (flow А) and approved-prototype (flow Б) in one folder; the spec must keep them separate all the way to acceptance
metadata:
  type: project
---

Task 005 (`dev/design/005-ai-terminal/`, opened 2026-09-03) is the first AIA task that runs
**both pipeline flows in one folder**, on purpose:

- **Flow Б — the «термінал» component.** Owner already saw and approved the prototype
  (`prototype-term-blocks.html.txt`, `prototype-styles.css.txt`). No references to hunt, no
  variants to build. The work is reproduction + finishing what the prototype lacks. It is
  not landing-page decoration: it carries the content of all 17 course module pages, 2–5
  blocks per lesson.
- **Flow А — the landing `claude-code.html`.** Full pipeline, design from zero.

**Why it matters:** an agent that treats the folder as one task will either invent an
alternative to an already-approved component (wasted work, and the owner sees something he
rejected), or apply "one component, no variants" logic to the landing.

**How to apply:** in a mixed task, give each flow its own scope, its own acceptance-criteria
namespace (005 used Б-1…Б-16 and А-1…А-15), and an explicit priority rule — in 005 the
component wins over the landing, because it lives on 18 pages and the landing on one.
Also tell agent №2 in writing which flow it must NOT search references for.

**Related fact:** the third platform block is «AI Термінал» (Claude Code CLI course, 16
modules + a final exam module), sitting beside AI Академія and AI Architect, with its own
`claude-code.config.json`. `https://ai-academia.com.ua/claude-code` returned 404 on
2026-09-03 — the page genuinely does not exist yet.

See also [[aia-design-conventions]], [[aia-design-pipeline-staging]].
