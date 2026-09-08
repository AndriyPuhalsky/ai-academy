#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# 010 · ЧЕРНЕТКИ КОМАНД ЗАМІНИ — ⚠ НЕ ВИКОНАНІ. Це пропозиція, не інструмент.
#
# Перед КОЖНИМ прогоном:
#   1. git status чистий
#   2. прогін спершу на ОДНОМУ файлі, потім дивишся diff
#   3. порядок має значення: довші імена РАНІШЕ за коротші
#
# Що сюди свідомо НЕ потрапило — docs/no-automation.md.
# Синтаксис sed -i "" — macOS (BSD). На Linux буде sed -i.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
echo "Цей файл не призначений для запуску як є. Прочитай docs/no-automation.md." >&2
exit 1

# ── Безпечні (ім'я унікальне, зустрічається лише в class=) ──────────────
sed -i '' 's/\bprose-aia\b/ds-prose/g'            modules/*.html claude-code-ref-*.html
sed -i '' 's/\bcallout-title\b/ds-note__title/g'  modules/*.html claude-code-ref-*.html
sed -i '' 's/\bcallout-sand\b/ds-note--accent/g'  modules/*.html claude-code-ref-*.html
sed -i '' 's/\bcallout\b/ds-note/g'               modules/*.html claude-code-ref-*.html   # ПІСЛЯ двох попередніх!
sed -i '' 's/\blesson-no\b/ds-prose__no/g'        modules/*.html
sed -i '' 's/\bexample-head\b/ds-code__head/g'    modules/*.html
sed -i '' 's/\bexample\b/ds-code/g'               modules/*.html                          # ПІСЛЯ example-head!
sed -i '' 's/\bdiagram-caption\b/ds-diag__caption/g' modules/*.html claude-code-ref-*.html
sed -i '' 's/\bdiagram\b/ds-diag/g'               modules/*.html claude-code-ref-*.html   # ПІСЛЯ caption!
sed -i '' 's/\btag-user\b/ds-code--user/g'        modules/*.html
sed -i '' 's/\btag-model\b/ds-code--model/g'      modules/*.html
sed -i '' 's/\bsidebar-overlay\b/ds-snav__scrim/g' modules/*.html
sed -i '' 's/\bmodule-sidebar\b/ds-snav/g'        modules/*.html
sed -i '' 's/\bsnav-count\b/ds-snav__count/g'     modules/*.html

# ── Утиліти теми ───────────────────────────────────────────────────────
sed -i '' 's/\btext-ivory\b/text-fg/g;      s/\bhover:text-ivory\b/hover:text-fg/g' *.html modules/*.html
sed -i '' 's/\btext-muted\/90\b/text-fg-2/g; s/\btext-muted\b/text-fg-2/g'          *.html modules/*.html
sed -i '' 's/\btext-faint\b/text-fg-3/g'                                            *.html modules/*.html
sed -i '' 's/\btext-clay\b/text-accent/g'                                           *.html modules/*.html
sed -i '' 's/\bmax-w-\[88rem\]/max-w-wide/g; s/\bmax-w-3xl\b/max-w-prose/g; s/\bmax-w-2xl\b/max-w-narrow/g' *.html modules/*.html
sed -i '' 's/\brounded-lg\b/rounded-control/g; s/\brounded-xl\b/rounded-card/g; s/\brounded-2xl\b/rounded-card/g; s/\brounded-full\b/rounded-pill/g' *.html modules/*.html
sed -i '' 's/\bz-40\b/z-header/g'                                                   *.html modules/*.html

# ── Mermaid: 105 однакових рядків із 130 ───────────────────────────────
sed -i '' 's/style \([A-Za-z0-9_]*\) fill:#2A211C,stroke:#D97757,color:#F0EEE6/class \1 hl/g' modules/*.html

# ── НЕБЕЗПЕЧНІ. Тільки очима ───────────────────────────────────────────
#  border-line   → ім'я збігається з новим; \bline\b зачепить line-strong
#  text-sand     → у контенті 2 вживання, у хромі 195 — хром і так замінюється блоком
#  .example      → слово трапляється в українському тексті уроків. Обмежити: class="example
#  bg-clay/text-ink/hover:bg-clay-deep → 60 кнопок, тільки разом і структурно
#  text-3xl та інші заголовкові → тільки разом, у ds-h1/ds-h2

# ── Перевірки після кожного прогону ────────────────────────────────────
grep -rn "tailwind.config" *.html modules/*.html | wc -l        # має бути 0 після етапу 2
grep -rn "#[0-9A-Fa-f]\{6\}" *.html modules/*.html | grep -v theme-color | wc -l   # 0 після етапу 3
grep -rn "clay\|ivory\|muted\|faint\|\bink\b\|\bsand\b" *.html modules/*.html css/ js/ | wc -l   # 0 після етапу 9
grep -rn "z-index: *[0-9]" css/ | grep -v "var(--z-" | wc -l    # 0
grep -rnE "href=\"[^\"]*[A-Z]|src=\"[^\"]*[A-Z]" *.html modules/*.html | grep -v "https\?://" | wc -l  # 0


---
