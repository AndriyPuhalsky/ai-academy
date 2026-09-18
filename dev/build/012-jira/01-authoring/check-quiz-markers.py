#!/usr/bin/env python3
"""check-quiz-markers.py — маркери стилю у квізах, яких check-quiz.py не бачить (задача 012).

check-quiz.py (задача 007) міряє ЛИШЕ довжину варіантів. Цей скрипт ловить пунктуацію, що видає
правильну відповідь — в обидва боки. Для кожного питання й кожного знака з набору «— : ; → «»:
    ✗ знак стоїть ЛИШЕ в правильному варіанті (жоден дистрактор його не має);
    ✗ знака немає ЛИШЕ в правильному варіанті (усі дистрактори його мають) — дзеркальний випадок.
Правити лише дистрактори: правильну, `q`, `explain`, `answer` не чіпати (правило 007).

    python3 check-quiz-markers.py                                 усі modules/jira-*.html
    python3 check-quiz-markers.py --files modules/jira-15.html    лише вказані файли
    python3 check-quiz-markers.py --pattern 'modules/claude-code-*.html'

Код виходу 1, якщо знайдено хоч один маркер. Читає тільки блок #quizData.
"""
import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[4]  # AIA/
MARKS = ["—", ":", ";", "→", "«"]
BLOCK_RE = re.compile(
    r'<script type="application/json" id="quizData">\s*(\{.*?\})\s*</script>', re.S
)


def questions(path):
    m = BLOCK_RE.search(path.read_text(encoding="utf-8"))
    if not m:
        raise SystemExit(f"{path.name}: блок #quizData не знайдено")
    try:
        return json.loads(m.group(1))["questions"]
    except (json.JSONDecodeError, KeyError) as e:
        raise SystemExit(f"{path.name}: невалідний квіз — {e}")


def defects(q):
    opts, a = q["options"], q["answer"]
    found = []
    for mark in MARKS:
        has = [mark in o for o in opts]
        others = [h for i, h in enumerate(has) if i != a]
        if has[a] and not any(others):
            found.append(f"«{mark}» лише в правильному варіанті")
        elif not has[a] and others and all(others):
            found.append(f"«{mark}» в усіх дистракторах, а в правильному немає")
    return found


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--files", nargs="+", help="шляхи від кореня AIA/ або абсолютні")
    ap.add_argument("--pattern", default="modules/jira-*.html", help="glob від кореня AIA/")
    args = ap.parse_args()

    if args.files:
        paths = [p if p.is_absolute() else ROOT / p for p in map(pathlib.Path, args.files)]
    else:
        paths = sorted(ROOT.glob(args.pattern))
    if not paths:
        raise SystemExit("файлів не знайдено")

    total = bad_files = 0
    for path in paths:
        rows = []
        for n, q in enumerate(questions(path), 1):
            for d in defects(q):
                rows.append(f"    П{n}: {d}")
        total += len(rows)
        bad_files += bool(rows)
        print(f"{'✗' if rows else '✓'} {path.name}" + ("\n" + "\n".join(rows) if rows else ""))

    print(f"\nМаркерів: {total} у {bad_files} із {len(paths)} файлів.")
    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
