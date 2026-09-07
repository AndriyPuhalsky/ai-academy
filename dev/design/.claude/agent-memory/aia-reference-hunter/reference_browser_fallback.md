---
name: reference-browser-fallback
description: For measurement work use headless Chromium via playwright-core with the cached ms-playwright binary — it beats the Chrome extension even when the extension IS connected
metadata:
  type: reference
---

**Status update 2026-09-07:** `list_connected_browsers` now returns a live browser ("Browser 1",
macOS). The earlier note that the extension is never connected here is **out of date** — check,
don't assume. But the recommendation below is unchanged, and now for a stronger reason.

**Use playwright-core, not the extension, for any reference-hunting job:**

- The extension can only *resize the window*. It cannot set `isMobile`, `hasTouch` or
  `deviceScaleFactor`. In a merely narrow window `(hover: hover)` stays true and
  `(pointer: coarse)` stays false, so the site serves desktop styles and **every mobile
  measurement is wrong**. Playwright's `newContext({ isMobile, hasTouch, deviceScaleFactor,
  userAgent })` is real device emulation.
- It also allows `getComputedStyle`, dumping `@keyframes` and custom properties, patching
  `IntersectionObserver` / `addEventListener` via `addInitScript` before load, walking
  `document.styleSheets` to count `@media (hover: hover)` rules, and measuring text widths in
  a specific loaded font — which is what [[feedback-measure-dont-estimate]] requires.
- Using the extension also forces an `AskUserQuestion` round trip to pick a browser. Not worth it.

**Setup (verified again 2026-09-07, ~1 s):**

- Binaries cached at `~/Library/Caches/ms-playwright/` (`chromium-1228` present).
- `npm i playwright-core` into the scratchpad dir, then `executablePath` =
  `~/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`.
- Network from Bash works; `curl` and headless Chrome both reach the internet.

Always state plainly what could **not** be verified this way — Safari/WebKit, real touch,
sticky `:hover` after tap, iOS dynamic address bar. Do not fill those gaps with plausible numbers.
