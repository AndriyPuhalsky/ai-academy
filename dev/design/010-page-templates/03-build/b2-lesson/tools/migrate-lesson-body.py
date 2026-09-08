#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
010 · Б2 · Перенесення ТІЛА уроку (<article>) зі старої мови в мову 009.

Це НЕ команда для прода. Це доказ, що карта міграції §8.3 застосовна до реальної
розмітки, і генератор кадрів для макета. Скрипт нічого не пише в дерево сайту:
він читає `modules/*.html` і друкує новий фрагмент у stdout.

Запуск:
    python3 tools/migrate-lesson-body.py ../../../../modules/claude-code-05.html > frag.html

Що робить (у цьому порядку — порядок важливий):
 1. дістає <article class="prose-aia …"> … </article>;
 2. перейменовує класи за §8.3;
 3. дописує class="ds-tbl" кожній <table> (рядка в §8.3 НЕМАЄ — знахідка Б2);
 4. обгортає <table> без обгортки (Д18) — 10 таблиць AI Академії;
 5. переводить Mermaid `style X …` на `class X …` (§8.3.6);
 6. знімає 48 інлайнових style="text-align:left" → модифікатор класу;
 7. дописує класи кнопці копіювання (§8.4);
 8. друкує в stderr перелік того, чого автоматизувати НЕ можна.
"""
import re
import sys

# ── 1. Карта класів §8.3 (порядок важливий: довші імена першими) ──────────────
CLASS_MAP = [
    ("callout-title",     "ds-note__title"),
    ("callout callout-sand", "ds-note ds-note--accent"),
    ("callout-sand",      "ds-note--accent"),
    ("callout",           "ds-note"),
    ("example-head",      "ds-code__head"),
    ("example",           "ds-code"),
    ("tag-user",          "ds-code--user"),
    ("tag-model",         "ds-code--model"),
    ("diagram-caption",   "ds-diag__caption"),
    ("diagram",           "ds-diag"),
    ("prose-aia",         "ds-prose"),
    ("lesson-no",         "ds-prose__no"),
    ("overflow-x-auto",   "ds-tbl__wrap"),
    ("max-w-3xl",         ""),          # ширину дає ds-prose
]

# ── 5. Mermaid §8.3.6: шість форм → три класи ────────────────────────────────
MERMAID = [
    (r'style\s+(\S+)\s+fill:#2A211C,stroke:#D97757,color:#F0EEE6', r'class \1 hl'),
    (r'style\s+(\S+)\s+fill:#2A211C,stroke:#E8DCC3,color:#F0EEE6', r'class \1 hl'),
    (r'style\s+(\S+)\s+fill:#2A1414,stroke:#C0564F,color:#F0EEE6', r'class \1 bad'),
    (r'style\s+(\S+)\s+fill:#1E1B18,stroke:#3A342E,color:#F0EEE6', r'class \1 mute'),
    (r'style\s+(\S+)\s+stroke:#736A5E,color:#A8A095',              r'class \1 mute'),
    (r'style\s+(\S+)\s+stroke:#D97757',                            r'class \1 hl'),
    (r'style\s+(\S+)\s+stroke:#E8DCC3',                            r'class \1 hl'),
]


def swap_classes(html):
    """Заміна тільки всередині class="…", щоб не зачепити текст уроку."""
    def one(m):
        value = m.group(1)
        for old, new in CLASS_MAP:
            value = re.sub(r'(?<![\w-])' + re.escape(old) + r'(?![\w-])', new, value)
        return 'class="' + re.sub(r'\s+', ' ', value).strip() + '"'
    return re.sub(r'class="([^"]*)"', one, html)


def main(path):
    src = open(path, encoding="utf-8").read()
    m = re.search(r'<article\b[^>]*>.*?</article>', src, re.S)
    if not m:
        sys.exit("немає <article> — це не сторінка уроку")
    art = m.group(0)
    notes = []

    art = swap_classes(art)

    # 3+4. таблиці
    n_wrapped = 0
    def table(mt):
        nonlocal n_wrapped
        tag = mt.group(0)
        if 'class=' in tag:
            tag = re.sub(r'class="([^"]*)"', lambda c: 'class="ds-tbl ' + c.group(1) + '"', tag)
        else:
            tag = tag[:-1] + ' class="ds-tbl">'
        return tag
    art = re.sub(r'<table\b[^>]*>', table, art)

    # обгортка там, де її немає: <table> без попереднього .ds-tbl__wrap
    def wrap(mt):
        nonlocal n_wrapped
        block = mt.group(0)
        n_wrapped += 1
        return ('<div class="ds-tbl__wrap" tabindex="0" role="region" '
                'aria-label="Таблиця: ⚠ ПІДПИС ПИШЕТЬСЯ РУКАМИ">\n' + block + '\n</div>')
    parts = re.split(r'(<div class="ds-tbl__wrap"[^>]*>.*?</div>)', art, flags=re.S)
    for i, p in enumerate(parts):
        if p.startswith('<div class="ds-tbl__wrap"'):
            continue
        parts[i] = re.sub(r'<table\b.*?</table>', wrap, p, flags=re.S)
    art = "".join(parts)

    # 5. mermaid
    n_mermaid = 0
    for pat, rep in MERMAID:
        art, k = re.subn(pat, rep, art)
        n_mermaid += k
    left = len(re.findall(r'style\s+\S+\s+(?:fill|stroke|color):', art))
    if left:
        notes.append(f"{left} рядків Mermaid `style …` НЕ розпізнано — руками")
    # мітка classDef дописує js/mermaid-theme.js, не розмітка

    # 6. інлайнові стилі
    art, n_align = re.subn(r'\s*style="text-align:left"', ' data-align="start"', art)

    # 7. кнопка копіювання §8.4
    art = art.replace('class="term__copy"',
                      'class="term__copy ds-btn ds-btn--sm ds-btn--quiet"')

    # 2b. решта тема-залежних утиліт §8.8 (безпечна частина)
    util = [("text-ivory", "text-fg"), ("text-muted", "text-fg-2"), ("text-faint", "text-fg-3"),
            ("text-clay", "text-accent"), ("hover:text-ivory", "hover:text-fg"),
            ("text-sand", "text-fg"), ("hover:text-sand", "hover:text-fg"),
            ("rounded-lg", "rounded-control"), ("rounded-xl", "rounded-card"),
            ("rounded-2xl", "rounded-card"), ("rounded-full", "rounded-pill"),
            ("max-w-2xl", "max-w-narrow"), ("border-line/60", "border-line"),
            ("border-line/70", "border-line")]
    def util_one(mm):
        v = mm.group(1)
        for o, nn in util:
            v = re.sub(r'(?<![\w:/-])' + re.escape(o) + r'(?![\w/-])', nn, v)
        return 'class="' + v + '"'
    art = re.sub(r'class="([^"]*)"', util_one, art)

    print(art)

    # 8. звіт у stderr
    sys.stderr.write(
        f"\n[migrate] {path}\n"
        f"  таблиць обгорнуто заново: {n_wrapped} (aria-label ПОРОЖНІЙ — руками)\n"
        f"  рядків Mermaid переведено: {n_mermaid}\n"
        f"  інлайнових text-align знято: {n_align}\n")
    for n in notes:
        sys.stderr.write("  ⚠ " + n + "\n")
    sys.stderr.write(
        "  ⚠ РУКАМИ, скриптом НЕ робиться:\n"
        "     · <h1>/<h2> зі зв'язки утиліт → ds-h1/ds-h2 (три утиліти → один клас)\n"
        "     · кнопка «Позначити завершеним» → ds-btn ds-btn--primary\n"
        "     · окремі <pre> поза .ds-code (210 шт.) → обгортка .ds-code\n"
        "     · aria-label кожної нової обгортки таблиці\n")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "modules/claude-code-05.html")
