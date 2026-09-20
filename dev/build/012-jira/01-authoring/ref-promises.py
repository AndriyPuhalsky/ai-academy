#!/usr/bin/env python3
"""ref-promises.py — що уроки обіцяють трьом довідникам (задача 012).

Уроки відсилають читача до довідників за НАЗВОЮ («число з датою перевірки — у довіднику «Карта
інтерфейсу, глосарій і ліміти Free»»). Кожне таке речення — обіцянка: довідник мусить містити
саме це. Скрипт збирає всі згадки з чинних текстів уроків (абзаци, пункти списків, клітинки
таблиць, підписи, explain квізів) і пише зведення `ref-promises.md` — вхід для авторів і
рецензентів довідників. Перегенерувати після будь-якої правки уроків:

    python3 ref-promises.py            пише ref-promises.md поруч зі скриптом
    python3 ref-promises.py --check    лише лічильники, файл не чіпає

Назви довідників беруться з jira.config.json (references.items[].title) — не з коду.
"""
import argparse
import collections
import glob
import html
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))

AP = argparse.ArgumentParser(description=__doc__.split("\n")[0])
AP.add_argument("--check", action="store_true", help="лише лічильники")
ARGS = AP.parse_args()


def clean(fragment):
    text = html.unescape(re.sub(r"<[^>]+>", "", fragment))
    return re.sub(r"\s+", " ", text).strip()


def main():
    cfg = json.load(open(os.path.join(ROOT, "jira.config.json"), encoding="utf-8"))
    guides = [(it["slug"], it["title"]) for it in cfg["references"]["items"]]
    titles = {m["id"]: m["title"] for m in cfg["modules"]}
    rows = collections.defaultdict(list)
    unnamed = []
    for path in sorted(glob.glob(os.path.join(ROOT, "modules", "jira-*.html"))):
        num = int(re.search(r"-(\d+)\.html$", path).group(1))
        src = open(path, encoding="utf-8").read()
        art = re.search(r"<article[^>]*>(.*?)</article>", src, re.S)
        if not art:
            continue
        body = re.sub(r"<!--.*?-->", "", art.group(1), flags=re.S)
        section = "вступ"
        for part in re.split(r'(<section id="[^"]+" data-lesson="[^"]+"[^>]*>)', body):
            m = re.match(r'<section id="([^"]+)" data-lesson="([^"]+)"', part)
            if m:
                section = "#%s «%s»" % (m.group(1), m.group(2))
                continue
            for tag, inner in re.findall(r"<(p|li|td|figcaption)\b[^>]*>(.*?)</\1>", part, re.S):
                text = clean(inner)
                if "довідник" not in text.lower():
                    continue
                hit = False
                for slug, title in guides:
                    if title in text:
                        rows[slug].append((num, section, text))
                        hit = True
                if not hit:
                    unnamed.append((num, section, text))
        quiz = re.search(r'<script type="application/json" id="quizData">(.*?)</script>', src, re.S)
        if quiz:
            try:
                for i, q in enumerate(json.loads(quiz.group(1)).get("questions", []), 1):
                    blob = " ".join([q.get("q", ""), q.get("explain", "")] + [str(o) for o in q.get("options", [])])
                    for slug, title in guides:
                        if title in blob:
                            rows[slug].append((num, "квіз П%d" % i, clean(q.get("explain", ""))))
            except json.JSONDecodeError:
                pass

    total = sum(len(v) for v in rows.values())
    print("Згадок за назвою: %d; без назви: %d" % (total, len(unnamed)))
    for slug, title in guides:
        lessons = sorted({n for n, _, _ in rows[slug]})
        print("  %-26s %3d  уроки: %s" % (slug, len(rows[slug]), ", ".join("j%02d" % n for n in lessons)))
    if ARGS.check:
        return 0

    out = ["# Що уроки обіцяють довідникам — зведення з чинних текстів",
           "",
           "Згенеровано `ref-promises.py` (не правити руками — перегенерувати після правок уроків).",
           "Кожен рядок — речення уроку, яке відсилає читача до довідника **за назвою**: довідник мусить",
           "містити саме те, що тут обіцяно. Назви — з `jira.config.json` → `references.items[].title`.",
           "Поруч читати: `cross-findings.md` (рядки «→ довідник …» у розділах хвиль 3–5 і в «Закриття",
           "хвостів…») і `00-research/facts-free-plan.md` (усі числа лімітів — лише звідти).",
           ""]
    for slug, title in guides:
        out.append("## %s — `%s` · згадок: %d" % (title, slug, len(rows[slug])))
        out.append("")
        last = None
        for num, section, text in rows[slug]:
            if num != last:
                out.append("**Урок %d «%s»**" % (num, titles.get("j%02d" % num, "")))
                last = num
            out.append("- %s — %s" % (section, text))
        out.append("")
    out.append("## Згадки слова «довідник» без назви — %d (звірити, що йдеться про один із трьох)" % len(unnamed))
    out.append("")
    for num, section, text in unnamed:
        out.append("- j%02d %s — %s" % (num, section, text))
    out.append("")
    with open(os.path.join(HERE, "ref-promises.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print("Записано: ref-promises.md")
    return 0


sys.exit(main())
