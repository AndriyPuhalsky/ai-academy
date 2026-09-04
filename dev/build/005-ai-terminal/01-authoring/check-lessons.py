#!/usr/bin/env python3
"""Механічна перевірка сторінок уроків «AI Термінал».

Робить за нуль токенів те, що інакше робив би агент-редактор:
структура, атрибути, квіз, заборонені звороти, відомі пастки.
Факти НЕ перевіряє — для цього потрібні джерела й людина/агент.

Запуск:  python3 dev/build/005-ai-terminal/01-authoring/check-lessons.py
"""
import json, os, re, sys, glob

ROOT = "/Users/ander1.sage/Downloads/AIA"
PAT  = os.path.join(ROOT, "modules", "claude-code-*.html")

BANNED = ["просто ", "очевидно", "як відомо", "елементарно",
          "всі знають", "звісно", "не забудь"]

def check(path):
    name = os.path.basename(path)
    src  = open(path, encoding="utf-8").read()
    errs, warns = [], []
    code = re.search(r"claude-code-(\d+)\.html", name)
    want = "c%02d" % int(code.group(1)) if code else None

    # --- структура й атрибути ---
    if 'data-config="../claude-code.config.json"' not in src:
        errs.append("data-config не вказує на ../claude-code.config.json")
    m = re.search(r'<body[^>]*data-module="([^"]+)"', src)
    if not m:
        errs.append("немає data-module на <body>")
    elif want and m.group(1) != want:
        errs.append(f'data-module="{m.group(1)}", а мав бути "{want}"')

    # --- 004: заборона зуму не переїжджає в нові файли ---
    if "user-scalable=no" in src or "maximum-scale" in src:
        errs.append("user-scalable=no / maximum-scale — порушення WCAG 1.4.4")

    # --- пастка, що вже двічі траплялась у проєкті ---
    for cls in ("term--enter", "term--hero"):
        if cls in src:
            errs.append(f"{cls} на сторінці уроку — блоки лишаться невидимими")

    # --- вісім блоків + квіз ---
    lessons = re.findall(r'data-lesson="([^"]+)"', src)
    if len(lessons) < 9:
        errs.append(f"секцій data-lesson {len(lessons)}, мало бути 8 блоків + квіз")
    if 'id="quiz"' not in src:
        errs.append("немає секції id=\"quiz\"")
    if 'data-quiz="quizData"' not in src:
        errs.append("немає контейнера data-quiz=\"quizData\"")

    # --- Mermaid ---
    n_mermaid = src.count('class="mermaid"')
    if n_mermaid == 0:
        errs.append("немає жодної Mermaid-діаграми (мінімум 1)")

    # --- компонент термінала ---
    n_term = len(re.findall(r'class="term(?:\s|")', src))
    if n_term == 0:
        errs.append("немає жодного блоку .term")
    elif not (2 <= n_term <= 5):
        warns.append(f"блоків .term {n_term} — норма 2–5")
    for fig in re.findall(r'<figure class="term.*?</figure>', src, re.S):
        body = re.search(r'<pre class="term__body"(.*?)</pre>', fig, re.S)
        if body and 'aria-labelledby' not in body.group(1)[:200] and 'aria-labelledby' not in fig:
            warns.append("блок .term без aria-labelledby на .term__body")
            break
    for mark in ("⏺", "└─", "❯"):
        for hit in re.finditer(re.escape(mark), src):
            seg = src[max(0, hit.start()-120):hit.start()]
            if "aria-hidden" not in seg:
                warns.append(f"маркер {mark} без aria-hidden поруч")
                break

    # --- квіз ---
    q = re.search(r'<script type="application/json" id="quizData">(.*?)</script>', src, re.S)
    if not q:
        errs.append("немає блоку #quizData")
    else:
        try:
            data = json.loads(q.group(1))
            qs = data.get("questions", [])
            if not (5 <= len(qs) <= 6) and want != "c23":
                errs.append(f"питань {len(qs)}, мало бути 5–6")
            if want == "c23" and len(qs) < 20:
                errs.append(f"іспит: питань {len(qs)}, очікувалось ~25")
            for i, it in enumerate(qs, 1):
                if not it.get("explain", "").strip():
                    errs.append(f"питання {i}: порожній explain")
                opts = it.get("options", [])
                a = it.get("answer")
                if not isinstance(a, int) or not (0 <= a < len(opts)):
                    errs.append(f"питання {i}: answer={a!r} поза межами {len(opts)} варіантів")
        except json.JSONDecodeError as e:
            errs.append(f"quizData — зламаний JSON: {e}")

    # --- апостроф: тільки U+0027 ---
    # U+02BC (ʼ) пролазить сам при наборі українською, а в Literata / IBM Plex Sans
    # рендериться з розривами: «комп ′ютер». Знайшов автор c01 на живій сторінці,
    # автор c06 показав, що скрипт його не ловив.
    for ch, name in (("\u02bc", "U+02BC"), ("\u2019", "U+2019"), ("\u2018", "U+2018")):
        n = src.count(ch)
        if n:
            errs.append(f"апостроф {name} — {n} входжень; має бути тільки ' (U+0027)")

    # --- мова ---
    low = src.lower()
    for b in BANNED:
        if b in low:
            warns.append(f"заборонений зворот: «{b.strip()}»")

    # --- версія біля екранів ---
    if not re.search(r"\b\d+\.\d+\.\d+\b", src):
        warns.append("ніде немає номера версії — екрани мають бути датовані версією/ОС")

    return errs, warns, len(src)

def main():
    files = sorted(glob.glob(PAT))
    if not files:
        print("Сторінок claude-code-*.html ще немає.")
        return 0
    bad = 0
    print(f"Перевіряю {len(files)} сторінок\n" + "═" * 64)
    for p in files:
        e, w, size = check(p)
        flag = "✗" if e else ("!" if w else "✓")
        print(f"\n{flag} {os.path.basename(p)}  ({size/1024:.1f} KB)")
        for x in e: print(f"    ✗ {x}")
        for x in w: print(f"    ! {x}")
        if e: bad += 1
    print("\n" + "═" * 64)
    print(f"Готово. З помилками: {bad} із {len(files)}.")
    print("Факти цей скрипт НЕ перевіряє — лише структуру, механіку й мову.")
    return 1 if bad else 0

sys.exit(main())
