---
name: feedback-hypothesis-must-be-labelled
description: Never let a Claude-authored hypothesis pass into a spec as a decision, and always re-measure the brief's factual claims against the live site before quoting them
metadata:
  type: feedback
---

Two rules that came out of task 003, both aimed at the same failure mode — a plausible
sentence hardening into a fact by being repeated.

**1. A hypothesis stays labelled as a hypothesis.** The 003 brief contained a Claude-written
guess at the hierarchy of the owner's four goals, explicitly marked "це НЕ його слова". The
spec must carry that label forward into the open-questions section, not quietly adopt it as
the spec's position.
**Why:** the owner's stated rule for briefs is "незаповнене поле не страшне; страшне —
вигадати за власника й записати як факт". Downstream agents treat the spec as settled truth.

**2. The brief's factual claims about the site are claims, not facts.** On 003 the brief
said the footer's «Проєкт» column is "список із чотирьох рядків" in both platforms. Reality,
read in code and confirmed against prod: `architect.html` has five `<li>`, and
`js/config.js` deletes any `<li>` whose `data-link` value is empty — and `links.github` /
`links.telegram` are empty strings in both configs, in production. So users actually see
**two** rows on the academy page and **three** on architect. That single measurement
inverted the reasoning about how visible a new footer entry would be.

**How to apply:** before writing the spec, open the exact files the task touches, plus the
prod URL, and re-derive every number the brief asserts. Also check `dev/design/JOURNAL.md`
for owner decisions taken *after* the brief was written — they outrank it. State plainly
what could not be verified instead of filling the gap with something plausible.

See also [[aia-owner-decision-style]], [[aia-design-pipeline-staging]].
