#!/usr/bin/env python3
"""Механічний пас по розмітці шести довідників: додає класи-модифікатори на <table>.
Адресація — за НОМЕРОМ входження `<table class="ds-tbl` у документі (той самий
порядок, у якому їх бачить querySelectorAll, тобто той, за яким зроблено заміри).
Нічого, крім атрибута class на <table>, не чіпає. Запуск: python3 apply.py [--dry]
"""
import re, sys, pathlib

ROOT = pathlib.Path("/Users/ander1.sage/Downloads/AIA")
DRY = "--dry" in sys.argv

PAGES = ["jira-ref-map", "jira-ref-jql", "jira-ref-automation",
         "claude-code-ref-commands", "claude-code-ref-hooks", "claude-code-ref-settings"]

# --- заміряні рішення ------------------------------------------------------
# таблиці, які БЕЗ дефекту на всіх пʼяти ширинах (ні зламаних колонок, ні
# розрізаних токенів) — їм min-width не даємо, щоб не додати скрол на 390
NO_MINW = {("jira-ref-jql", 23), ("jira-ref-automation", 26),
           ("claude-code-ref-commands", 24), ("claude-code-ref-settings", 4)}
# таблиці, які з --w38 стають на 1280 вищими більш як на 20 %
W56 = {("jira-ref-jql", 3), ("claude-code-ref-commands", 6), ("claude-code-ref-commands", 7)}
# остання колонка — короткий службовий тег, що переноситься через кому
KEEP_LAST = {("jira-ref-map", 4), ("jira-ref-map", 11), ("jira-ref-map", 15),
             ("claude-code-ref-commands", 4), ("claude-code-ref-commands", 9),
             ("claude-code-ref-commands", 13)}
# наявну утиліту замінюємо на більшу: 54rem → 72rem (hooks #g-model)
BUMP = {("claude-code-ref-hooks", 10): ("min-w-[54rem]", "min-w-[72rem]")}

report = []
for page in PAGES:
    path = ROOT / f"{page}.html"
    src = path.read_text(encoding="utf-8")
    out, pos, idx = [], 0, 0
    for m in re.finditer(r'<table class="(ds-tbl[^"]*)"', src):
        cls = m.group(1)
        parts = cls.split()
        add = ["ds-tbl--token"]
        key = (page, idx)
        has_util = any(p.startswith("min-w-[") for p in parts)
        if key in BUMP:
            old, new = BUMP[key]
            assert old in parts, f"{page}[{idx}] не має {old}"
            parts = [new if p == old else p for p in parts]
        elif key in W56:
            add.append("ds-tbl--w56")
        elif not has_util and key not in NO_MINW:
            add.append("ds-tbl--w38")
        if key in KEEP_LAST:
            add.append("ds-tbl--keep-last")
        new_cls = " ".join(parts + [a for a in add if a not in parts])
        out.append(src[pos:m.start()])
        out.append(f'<table class="{new_cls}"')
        pos = m.end()
        report.append((page, idx, cls, new_cls))
        idx += 1
    out.append(src[pos:])
    new_src = "".join(out)
    print(f"{page}: {idx} таблиць")
    if not DRY:
        path.write_text(new_src, encoding="utf-8")

from collections import Counter
c = Counter()
for page, idx, old, new in report:
    for token in ("ds-tbl--token", "ds-tbl--w38", "ds-tbl--w56", "ds-tbl--keep-last", "min-w-[72rem]"):
        if token in new:
            c[token] += 1
print("\nрозподіл:", dict(c))
print("\nзмінені класи, де додано не лише --token:")
for page, idx, old, new in report:
    if new != old + " ds-tbl--token":
        print(f"  {page:26} [{idx:2}] {old!r} → {new!r}")
