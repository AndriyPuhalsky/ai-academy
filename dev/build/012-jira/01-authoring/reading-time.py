#!/usr/bin/env python3
"""reading-time.py — одне правило для рядка «≈ NN хв читання» в шапках уроків (задача 012).

Навіщо: автори ставили час читання на око — на 22 уроках вийшло від 137 до 218 слів/хв
(медіана 188), тобто «≈ 25 хв» в одному уроці й «≈ 22 хв» в іншому при більшому обсязі.
Рецензент j22 помітив це першим; рядок (є) чеклиста релізу вимагає одного правила.

Правило: хвилини = round(слова / WPM). Слова рахуються в <article> без коментарів і без коду
Mermaid (діаграму дивляться, а не читають); написи вікон, таблиці й блоки term — входять.
Іспит (j23) не чіпаємо: там рядок іншої форми («26 питань · прохідний бал 85% · ≈ 30 хв»).

    python3 reading-time.py                 таблиця: слова · заявлено · за правилом · різниця
    python3 reading-time.py --wpm 170       інша швидкість (рішення власника; за замовчуванням 190)
    python3 reading-time.py --apply         переписати рядок у шапках (лише де число відрізняється)

Після --apply прогнати check-lessons.py: скрипт міняє рівно одне число в одному рядку файла.
"""
import argparse
import glob
import html
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", ".."))

AP = argparse.ArgumentParser(description=__doc__.split("\n")[0])
AP.add_argument("--pattern", default="modules/jira-*.html", help="glob від кореня AIA/")
AP.add_argument("--wpm", type=int, default=190, help="слів на хвилину (за замовчуванням 190)")
AP.add_argument("--exam", default="23", help="номер іспиту — його рядок не чіпаємо")
AP.add_argument("--apply", action="store_true", help="переписати «≈ NN хв читання» у файлах")
ARGS = AP.parse_args()

LINE_RE = re.compile(r"(≈\s*)(\d+)(\s*хв читання)")
WORD_RE = re.compile(r"[A-Za-zА-Яа-яІіЇїЄєҐґ0-9'\-]+")


def words_of(src):
    art = re.search(r"<article[^>]*>(.*?)</article>", src, re.S)
    if not art:
        return None
    text = re.sub(r"<!--.*?-->", "", art.group(1), flags=re.S)
    text = re.sub(r'<pre class="mermaid">.*?</pre>', "", text, flags=re.S)
    text = html.unescape(re.sub(r"<[^>]+>", " ", text))
    return len(WORD_RE.findall(text))


def main():
    files = sorted(glob.glob(os.path.join(ROOT, ARGS.pattern)))
    if not files:
        print(f"Файлів {ARGS.pattern} не знайдено.")
        return 1
    print(f"Правило: round(слова / {ARGS.wpm})\n")
    print(" файл            слів  заявлено  за правилом  різниця")
    changed = 0
    for path in files:
        name = os.path.basename(path)
        num = re.search(r"-(\d+)\.html$", name)
        if num and num.group(1) == ARGS.exam.zfill(2):
            continue
        src = open(path, encoding="utf-8").read()
        n_words = words_of(src)
        m = LINE_RE.search(src)
        if n_words is None or not m:
            print(f" {name:14s}  — немає <article> або рядка «≈ NN хв читання»")
            continue
        declared = int(m.group(2))
        by_rule = max(1, round(n_words / ARGS.wpm))
        diff = by_rule - declared
        mark = "" if diff == 0 else ("  ←" if abs(diff) >= 3 else "  ·")
        print(f" {name:14s} {n_words:5d}   {declared:5d}      {by_rule:5d}     {diff:+d}{mark}")
        if ARGS.apply and diff:
            if len(LINE_RE.findall(src)) != 1:
                print(f"   ! {name}: рядок «≈ NN хв читання» не один — пропущено, правити руками")
                continue
            new_src = LINE_RE.sub(lambda mm: mm.group(1) + str(by_rule) + mm.group(3), src, count=1)
            open(path, "w", encoding="utf-8").write(new_src)
            changed += 1
    print()
    if ARGS.apply:
        print(f"Переписано файлів: {changed}. Далі — check-lessons.py і адресний коміт.")
    else:
        print("Нічого не змінено (звіт). «←» — різниця від 3 хв, «·» — менша. Застосувати: --apply")
    return 0


sys.exit(main())
