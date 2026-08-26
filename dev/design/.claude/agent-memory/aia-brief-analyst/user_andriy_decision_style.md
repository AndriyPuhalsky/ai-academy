---
name: aia-owner-decision-style
description: Andriy (AIA owner) decides visual direction by looking at options, not by describing taste in words; he answers "all of the above" when given a list of goals
metadata:
  type: user
---

Andriy runs AI Академія / AI Architect single-handed and delegates execution readily, but
keeps direction decisions for himself.

Two observed patterns worth designing around:

- **He picks with his eyes, not with words.** He left the references/anti-references field
  of task 003 completely empty and said the research agent should bring them. The right
  way to get a decision out of him is to lay out options along a named axis and let him
  point, not to ask him to describe what he likes.
- **Given a list of goals, he takes all of them.** On 003 he selected all four "what the
  user should feel" options at once (alive / honest / wow / want-to-join), which conflict.
  Do not silently resolve this into a hierarchy — surface it as the top open question and
  make the reference stage the instrument that answers it.

**How to apply:** structure specs so every unresolved matter has a visible default and a
cheap way for him to overturn it by choosing rather than by writing. Keep the owner-facing
summary to one screen — he will not read a long report.

See also [[aia-design-pipeline-staging]], [[feedback-hypothesis-must-be-labelled]].
