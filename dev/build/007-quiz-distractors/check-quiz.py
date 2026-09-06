#!/usr/bin/env python3
"""check-quiz.py — статистика й контроль квізів у modules/*.html (задача 007).

Квіз у кожному уроці — один блок:
    <script type="application/json" id="quizData">{ "questions": [ {q, options[], answer, explain} ] }</script>

Режими:
    python3 check-quiz.py                         таблиця по курсах (усі 57 файлів)
    python3 check-quiz.py --files modules/a.html  лише вказані файли (для агентів)
    python3 check-quiz.py --per-file              рядок на кожен файл
    python3 check-quiz.py --baseline baseline.json   зберегти знімок правильних/explain/q
    python3 check-quiz.py --verify baseline.json     довести, що правильні тексти, q, explain
                                                     і кількість питань не змінились
                                                     (разом з --files — лише по вказаних файлах)
    python3 check-quiz.py --rotate                переставити варіанти так, щоб індекс
                                                  `answer` розподілявся рівномірно (детерміновано;
                                                  питання зі згадкою позиції в explain — пропуск)
    python3 check-quiz.py --skip modules/claude-code-23.html   не чіпати файл(и) у --rotate

Читає тільки блок #quizData, нічого іншого в HTML не торкається.
"""
import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]  # AIA/
MODULES = ROOT / "modules"

COURSES = [
    ("module-", "AI Академія"),
    ("architect-", "AI Architect"),
    ("claude-code-", "AI Термінал"),
]
EXAM = "claude-code-23.html"

BLOCK_RE = re.compile(
    r'(<script type="application/json" id="quizData">)(\s*)(\{.*?\})(\s*)(</script>)',
    re.S,
)
# explain, що посилається на позицію варіанта, — такі питання не крутимо
POS_RE = re.compile(
    r"(перш|друг|трет|четверт|остан)\w*\s+варіант|варіант\w*\s+[АБВГабвг]\b|\b[АБВГ]\)", re.I
)


def course_of(name):
    for prefix, title in COURSES:
        if name.startswith(prefix):
            return title
    return "?"


def all_files():
    return sorted(p for p in MODULES.glob("*.html") if course_of(p.name) != "?")


def read_block(path):
    text = path.read_text(encoding="utf-8")
    m = BLOCK_RE.search(text)
    if not m:
        raise SystemExit(f"{path.name}: блок #quizData не знайдено")
    try:
        data = json.loads(m.group(3))
    except json.JSONDecodeError as e:
        raise SystemExit(f"{path.name}: невалідний JSON квіза — {e}")
    return text, m, data


def qstats(q):
    opts = q["options"]
    lens = [len(o) for o in opts]
    a = q["answer"]
    correct_len = lens[a]
    mx, mn = max(lens), min(lens)
    return {
        "longest": correct_len == mx and lens.count(mx) == 1,
        "longest_or_tie": correct_len == mx,
        "shortest": correct_len == mn and lens.count(mn) == 1,
        "answer": a,
        "n_opts": len(opts),
        "correct_len": correct_len,
        "wrong_mean": (sum(lens) - correct_len) / max(1, len(lens) - 1),
    }


def collect(files):
    rows = []
    for p in files:
        _, _, data = read_block(p)
        qs = data.get("questions", [])
        st = [qstats(q) for q in qs]
        rows.append((p, qs, st))
    return rows


def fmt_pct(n, d):
    return f"{n}/{d} ({(100.0 * n / d if d else 0):.1f} %)"


def print_table(rows, per_file=False):
    def agg(items):
        n = len(items)
        longest = sum(1 for s in items if s["longest"])
        tie = sum(1 for s in items if s["longest_or_tie"])
        shortest = sum(1 for s in items if s["shortest"])
        idx = {}
        for s in items:
            idx[s["answer"]] = idx.get(s["answer"], 0) + 1
        cl = sum(s["correct_len"] for s in items) / n if n else 0
        wl = sum(s["wrong_mean"] for s in items) / n if n else 0
        return n, longest, tie, shortest, idx, cl, wl

    header = f"{'курс / файл':<34} {'питань':>6} {'найдовша':>18} {'+нічиї':>16} {'найкоротша':>16}  answer 0/1/2/3   довж. прав./хибн."
    print(header)
    print("-" * len(header))
    groups = {}
    for p, qs, st in rows:
        groups.setdefault(course_of(p.name), []).append((p, st))
        if per_file:
            n, lo, ti, sh, idx, cl, wl = agg(st)
            dist = "/".join(str(idx.get(i, 0)) for i in range(4))
            print(f"{p.name:<34} {n:>6} {fmt_pct(lo, n):>18} {fmt_pct(ti, n):>16} {fmt_pct(sh, n):>16}  {dist:<16} {cl:5.1f} / {wl:5.1f}")
    total = []
    for course, items in groups.items():
        st = [s for _, sts in items for s in sts]
        total += st
        n, lo, ti, sh, idx, cl, wl = agg(st)
        dist = "/".join(str(idx.get(i, 0)) for i in range(4))
        print(f"{course + ' (' + str(len(items)) + ' ф.)':<34} {n:>6} {fmt_pct(lo, n):>18} {fmt_pct(ti, n):>16} {fmt_pct(sh, n):>16}  {dist:<16} {cl:5.1f} / {wl:5.1f}")
    if len(groups) > 1:
        n, lo, ti, sh, idx, cl, wl = agg(total)
        dist = "/".join(str(idx.get(i, 0)) for i in range(4))
        print("-" * len(header))
        print(f"{'РАЗОМ':<34} {n:>6} {fmt_pct(lo, n):>18} {fmt_pct(ti, n):>16} {fmt_pct(sh, n):>16}  {dist:<16} {cl:5.1f} / {wl:5.1f}")


def snapshot(rows):
    out = {}
    for p, qs, _ in rows:
        out[p.name] = [
            {"q": q["q"], "correct": q["options"][q["answer"]], "explain": q.get("explain", "")}
            for q in qs
        ]
    return out


def verify(rows, baseline_path, partial=False):
    base = json.loads(pathlib.Path(baseline_path).read_text(encoding="utf-8"))
    now = snapshot(rows)
    problems = []
    for name, items in now.items():
        if name not in base:
            problems.append(f"{name}: нема в baseline")
            continue
        b = base[name]
        if len(b) != len(items):
            problems.append(f"{name}: було {len(b)} питань, стало {len(items)}")
            continue
        # порядок питань міг не змінитись; звіряємо за текстом q
        bq = {x["q"]: x for x in b}
        for i, it in enumerate(items):
            ref = bq.get(it["q"])
            if ref is None:
                problems.append(f"{name}: питання {i} — текст q змінено або питання нове: {it['q'][:60]!r}")
                continue
            if ref["correct"] != it["correct"]:
                problems.append(f"{name}: питання {i} — текст ПРАВИЛЬНОЇ змінено: {ref['correct'][:50]!r} → {it['correct'][:50]!r}")
            if ref["explain"] != it["explain"]:
                problems.append(f"{name}: питання {i} — explain змінено")
    if not partial:  # з --files звіряємо лише вказані файли, решта не «зникла»
        for name in base:
            if name not in now:
                problems.append(f"{name}: файл зник")
    # унікальність варіантів усередині питання
    for p, qs, _ in rows:
        for i, q in enumerate(qs):
            if len(set(q["options"])) != len(q["options"]):
                problems.append(f"{p.name}: питання {i} — варіанти дублюються")
            if not isinstance(q.get("answer"), int) or not (0 <= q["answer"] < len(q["options"])):
                problems.append(f"{p.name}: питання {i} — answer поза межами")
            if not q.get("explain"):
                problems.append(f"{p.name}: питання {i} — explain порожній")
    return problems


def rotate(rows, skip_names):
    """Переставляє варіанти так, щоб правильна відповідь у питанні i стояла під індексом
    i % n_opts. Детерміновано, без випадковості. Питання зі згадкою позиції в explain —
    не чіпаємо. Формат блоку зберігаємо: JSON з відступом 2 на базовому відступі блоку."""
    changed = 0
    for p, qs, _ in rows:
        if p.name in skip_names:
            continue
        text, m, data = read_block(p)
        qs = data["questions"]
        touched = False
        for i, q in enumerate(qs):
            if POS_RE.search(q.get("explain", "")) or POS_RE.search(q.get("q", "")):
                continue
            n = len(q["options"])
            target = i % n
            a = q["answer"]
            if a == target:
                continue
            opts = q["options"]
            # циклічний зсув, щоб правильна стала на target, порядок решти зберігся циклічно
            shift = (target - a) % n
            q["options"] = opts[-shift:] + opts[:-shift]
            q["answer"] = target
            touched = True
        if not touched:
            continue
        # базовий відступ блоку = відступ рядка, де стоїть <script ...>
        line_start = text.rfind("\n", 0, m.start(1)) + 1
        indent = text[line_start:m.start(1)]
        body = json.dumps(data, ensure_ascii=False, indent=2)
        body = "\n".join((indent + ln) if ln else ln for ln in body.splitlines())
        new_block = m.group(1) + "\n" + body + "\n" + indent + m.group(5)
        text = text[: m.start()] + new_block + text[m.end():]
        p.write_text(text, encoding="utf-8")
        changed += 1
    return changed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--files", nargs="*", help="обмежити список файлів")
    ap.add_argument("--per-file", action="store_true")
    ap.add_argument("--baseline", metavar="JSON")
    ap.add_argument("--verify", metavar="JSON")
    ap.add_argument("--rotate", action="store_true")
    ap.add_argument("--skip", nargs="*", default=[EXAM])
    args = ap.parse_args()

    files = [pathlib.Path(f) if pathlib.Path(f).is_absolute() else (ROOT / f) for f in args.files] if args.files else all_files()
    files = [f if f.exists() else MODULES / pathlib.Path(f).name for f in files]
    rows = collect(files)

    if args.baseline:
        pathlib.Path(args.baseline).write_text(json.dumps(snapshot(rows), ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"baseline: {len(rows)} файлів → {args.baseline}")

    if args.rotate:
        skip = {pathlib.Path(s).name for s in args.skip}
        n = rotate(rows, skip)
        print(f"rotate: змінено {n} файлів (пропущено: {', '.join(sorted(skip)) or '—'})")
        rows = collect(files)

    print_table(rows, per_file=args.per_file)

    if args.verify:
        problems = verify(rows, args.verify, partial=bool(args.files))
        if problems:
            print("\nVERIFY: РОЗБІЖНОСТІ")
            for pr in problems:
                print("  - " + pr)
            sys.exit(1)
        print("\nVERIFY: OK — правильні тексти, q, explain і кількість питань без змін")


if __name__ == "__main__":
    main()
