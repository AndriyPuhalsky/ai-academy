---
name: project-005-ai-terminal-refs
description: Що вже зібрано й відхилено в добірці референсів задачі 005 «AI Термінал» — не приносити вдруге
metadata:
  type: project
---

Добірка 005 закрита 2026-09-03: 12 top-референсів, 7 по слоту B, 3 антиприклади.
Вихід — `dev/design/005-ai-terminal/02-references/` (`references.md` + `index.html` + `lab/`).

**Why:** власник вирішує, дивлячись, а не читаючи, і не хоче бачити двічі те, що вже відхилив.

**How to apply:** перед новим пошуком на цю тему звірятись зі списком нижче.

Взято: Claude Code (product page), Val Town, Zed, Linear Method, Ciechanowski, Josh Comeau,
Three.js Journey (лише рейка розділів), Ink & Switch, Raycast, Warp, Exercism (лише одна ідея),
Recurse Center.

**Свідомо відхилено, не приносити знову:**
- **Oxide Computer** — механіка героя ідеальна (перемикач CLI/API/CONSOLE), але мʼятно-зелений
  на майже чорному; §10.2 спеки забороняє зелено-чорні референси взагалі.
- **Tailscale** — став типовим enterprise-B2B, нічого не дає.
- **Anthropic.com** — уже розібраний у добірці 003, повторно не описувати.

**Антиприклади вже названі:** terminal.shop (брехня «новачок→хакер»), Three.js Journey hero
(брехня «серйозна робота→прогулянка»), Ghostty (мʼяка форма першої: ASCII + нуль орієнтації).

**Порожня колонка осі — головний висновок:** жоден преміальний сайт не дає терміналу 55–70%
першого екрана. Claude Code ≈37%, Val Town 29%, Warp/Zed 0%.
