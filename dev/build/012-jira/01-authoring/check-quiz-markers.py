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
    python3 check-quiz-markers.py --lexical                       + слова «бо тому лише завжди»

--lexical (додано 2026-09-30): ті самі два боки для слів WORDS (ціле слово, без регістру) плюс
зведення «частка правильних / дистракторів зі словом» по всіх файлах — мʼякий перекіс, який
видно лише в сумі (у 012 до правки: «бо» у 29 % дистракторів проти 8 % правильних).

Код виходу 1, якщо знайдено хоч один маркер. Читає тільки блок #quizData.
"""
import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[4]  # AIA/
MARKS = ["—", ":", ";", "→", "«"]
WORDS = ["бо", "тому", "лише", "завжди"]
WORD_RE = {w: re.compile(rf"(?<!\w){w}(?!\w)", re.I) for w in WORDS}
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


def two_sided(label, has, a):
    others = [h for i, h in enumerate(has) if i != a]
    if has[a] and not any(others):
        return f"«{label}» лише в правильному варіанті"
    if not has[a] and others and all(others):
        return f"«{label}» в усіх дистракторах, а в правильному немає"
    return None


def defects(q, lexical=False):
    opts, a = q["options"], q["answer"]
    found = [two_sided(m, [m in o for o in opts], a) for m in MARKS]
    if lexical:
        found += [two_sided(w, [bool(WORD_RE[w].search(o)) for o in opts], a) for w in WORDS]
    return [f for f in found if f]


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--files", nargs="+", help="шляхи від кореня AIA/ або абсолютні")
    ap.add_argument("--pattern", default="modules/jira-*.html", help="glob від кореня AIA/")
    ap.add_argument("--lexical", action="store_true", help="ще й слова «бо тому лише завжди» + зведення часток")
    args = ap.parse_args()

    if args.files:
        paths = [p if p.is_absolute() else ROOT / p for p in map(pathlib.Path, args.files)]
    else:
        paths = sorted(ROOT.glob(args.pattern))
    if not paths:
        raise SystemExit("файлів не знайдено")

    total = bad_files = 0
    right = {w: 0 for w in WORDS}
    wrong = {w: 0 for w in WORDS}
    n_right = n_wrong = 0
    for path in paths:
        rows = []
        for n, q in enumerate(questions(path), 1):
            for d in defects(q, args.lexical):
                rows.append(f"    П{n}: {d}")
            for i, o in enumerate(q["options"]):
                bucket = right if i == q["answer"] else wrong
                for w in WORDS:
                    bucket[w] += bool(WORD_RE[w].search(o))
            n_right += 1
            n_wrong += len(q["options"]) - 1
        total += len(rows)
        bad_files += bool(rows)
        print(f"{'✗' if rows else '✓'} {path.name}" + ("\n" + "\n".join(rows) if rows else ""))

    if args.lexical and n_right:
        print("\nЗведення по словах (частка варіантів, де слово є):")
        for w in WORDS:
            print(f"    «{w}»: правильні {right[w]}/{n_right} = {100 * right[w] / n_right:.0f} % · "
                  f"дистрактори {wrong[w]}/{n_wrong} = {100 * wrong[w] / n_wrong:.0f} %")
    print(f"\nМаркерів: {total} у {bad_files} із {len(paths)} файлів.")
    sys.exit(1 if total else 0)


if __name__ == "__main__":
    main()
