---
name: reference-browser-fallback
description: Chrome extension is usually NOT connected on this machine; use headless Chromium via playwright-core with the cached ms-playwright binary instead
metadata:
  type: reference
---

The `mcp__claude-in-chrome__*` tools fail here — `list_connected_browsers` returns `[]`
and `tabs_context_mcp` reports the extension is not connected. Checked 2026-08-22.

**Working fallback (verified, gives full visual + DOM access):**

- Playwright browser binaries are already cached at
  `~/Library/Caches/ms-playwright/` (chromium-1208/1223/1228, firefox, webkit).
- `playwright` npm package is NOT installed globally. Install `playwright-core` into the
  scratchpad dir (`npm i playwright-core`, ~2s) and point `executablePath` at
  `~/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`.
- Network from Bash works (curl and headless Chrome both reach the internet).

**Why this matters beyond screenshots:** it is strictly *better* than the extension for
this agent's job, because it allows reading `getComputedStyle`, dumping `@keyframes`
bodies and CSS custom properties, throttling the network via CDP to catch loading
states, and measuring text widths in a specific font. That turns "the modal fades in
nicely" into exact durations, curves and pixel widths — which is what
[[feedback-measure-dont-estimate]] requires.

Do not report references as "assessed by text only" without first trying this path.
