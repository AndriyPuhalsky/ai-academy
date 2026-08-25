---
name: reference-dark-auth-sources
description: Which live sites actually pay off for dark premium auth/dialog/motion research on this project, and which are dead ends
metadata:
  type: reference
---

Vetted 2026-08-22 for task 001. Reuse rather than re-searching from scratch.

**High yield (public login pages, no auth needed, all dark):**
- `app.cal.com/auth/login` — closest analogue to a modal: a *card* on dark, social above,
  "or" divider, full-width primary. Auto-localises to Ukrainian from an EU IP, which is
  how to get a real Ukrainian dark auth screen for free.
- `supabase.com/dashboard/sign-in` — vendor of this project's own auth stack; also
  renders a full OAuth error panel if you append
  `?error=access_denied&error_description=...`. Best way to see a post-redirect error
  state without actually failing an OAuth flow.
- `vercel.com/login` — strict size discipline; exposes Geist motion tokens
  (`--ds-motion-*`) via CSS custom properties.
- `linear.app/login`, `railway.com/login`, `login.framer.com` — useful mainly as
  **anti-references** (recoloured provider buttons, 30 px controls).

**Motion values, read from CSS rather than looked at:**
- `raycast.com` — Radix-style dialog: overlay + content both `0.15s
  cubic-bezier(0.16, 1, 0.3, 1)`, content `scale(0.96)`. The reference for *short*
  service dialogs.
- `vaul.emilkowal.ski` — the iOS sheet: `0.5s cubic-bezier(0.32, 0.72, 0, 1)`.
- `emilkowal.ski/ui/great-animations` and `/ui/you-dont-need-animations` — the text
  authority the project's own skills are built on; cite for the sub-300ms rule and for
  "never animate keyboard-initiated actions".

**Dead ends for a dark palette:** Notion and Figma login (light theme), Neon (no social
providers on the first screen), Clerk's hosted portal (bot interstitial).

Dribbble/awwwards were deliberately skipped for this task class — a login modal is a
service node, and static galleries add nothing over live products.

Related: [[reference-browser-fallback]], [[feedback-measure-dont-estimate]].
