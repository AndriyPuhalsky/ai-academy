#!/usr/bin/env python3
"""Механічна перевірка сторінок уроків «Jira з нуля» (012).

Параметризована копія 005/check-lessons.py: замість блоків .term перевіряє «вікна застосунку»
(тимчасова розмітка з lesson-contract.md §4); .term лишається дозволеним для JQL і CLI.

Робить за нуль токенів те, що інакше робив би агент-редактор:
структура, атрибути, квіз, заборонені звороти, відомі пастки.
Факти НЕ перевіряє — для цього потрібні джерела й людина/агент.

Запуск:  python3 dev/build/012-jira/01-authoring/check-lessons.py [--prefix j] [--config ../jira.config.json] [--pattern modules/jira-*.html]
"""
import json, os, re, sys, glob, argparse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))   # …/AIA
AP = argparse.ArgumentParser()
AP.add_argument("--prefix", default="j")
AP.add_argument("--config", default="../jira.config.json")
AP.add_argument("--pattern", default="modules/jira-*.html")
AP.add_argument("--exam", default="23")
ARGS = AP.parse_args()
PAT  = os.path.join(ROOT, ARGS.pattern)
EXAM = "%s%02d" % (ARGS.prefix, int(ARGS.exam))

BANNED = ["просто ", "очевидно", "як відомо", "елементарно",
          "всі знають", "звісно", "не забудь"]

def check(path):
    name = os.path.basename(path)
    src  = open(path, encoding="utf-8").read()
    errs, warns = [], []
    code = re.search(r"-(\d+)\.html$", name)
    want = "%s%02d" % (ARGS.prefix, int(code.group(1))) if code else None
    is_exam = (want == EXAM)

    # --- структура й атрибути ---
    if ('data-config="%s"' % ARGS.config) not in src:
        errs.append("data-config не вказує на %s" % ARGS.config)
    if 'data-course="jira"' not in src:
        errs.append('немає data-course="jira" на <html>')
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
    if n_mermaid == 0 and not is_exam:
        errs.append("немає жодної Mermaid-діаграми (мінімум 1)")
    if "<br/>" in src or "<br />" in src:
        for pre in re.findall(r'<pre class="mermaid">(.*?)</pre>', src, re.S):
            if "<br" in pre:
                errs.append("<br/> усередині Mermaid — пастка 010, ділити вузол")
                break

    # --- компонент «вікно застосунку» (lesson-contract.md §4) ---
    wins = re.findall(r'<figure class="win"[^>]*>.*?</figure>', src, re.S)
    n_win = len(wins)
    if is_exam:
        if n_win:
            errs.append(f"іспит: вікон {n_win}, має бути 0")
    else:
        if n_win == 0:
            errs.append("немає жодного вікна .win (норма 1–5)")
        elif n_win > 5:
            warns.append(f"вікон {n_win} — норма 1–5")
    STATES = {"board", "list", "item", "form", "settings", "portal"}
    seen_ids = set()
    for i, fig in enumerate(wins, 1):
        head = fig[:400]
        st = re.search(r'data-state="([^"]+)"', head)
        if not st or st.group(1) not in STATES:
            errs.append(f"вікно {i}: data-state відсутній або не з шести станів")
        wid = re.search(r' id="([^"]+)"', head)
        if not wid:
            errs.append(f"вікно {i}: figure без id")
        elif wid.group(1) in seen_ids:
            errs.append(f"вікно {i}: повторний id {wid.group(1)}")
        else:
            seen_ids.add(wid.group(1))
        title = re.search(r'<span class="win__title" id="([^"]+)">(.*?)</span>', fig, re.S)
        if not title:
            errs.append(f"вікно {i}: немає .win__title з id")
        else:
            t = re.sub(r"\s+", " ", title.group(2))
            if not re.search(r"(звірено|за документацією),? ?\d{4}-\d{2}-\d{2}", t):
                errs.append(f"вікно {i}: заголовок без дати «звірено РРРР-ММ-ДД»: {t[:60]}")
            body = re.search(r'<div class="win__body"([^>]*)>', fig)
            if not body:
                errs.append(f"вікно {i}: немає .win__body")
            elif 'role="group"' not in body.group(1) or f'aria-labelledby="{title.group(1)}"' not in body.group(1):
                errs.append(f"вікно {i}: .win__body без role=group / aria-labelledby на заголовок")
        if re.search(r"<(img|svg|canvas)\b", fig):
            errs.append(f"вікно {i}: <img>/<svg>/<canvas> усередині — заборонено")
        if st and st.group(1) == "portal" and 'class="win__rail' in fig:
            warns.append(f"вікно {i}: стан portal з рейкою — портал рейки не має")
        n_marks = len(re.findall(r'class="win__mark"', fig))
        for m in re.finditer(r'<b class="win__mark"([^>]*)>', fig):
            if 'aria-hidden="true"' not in m.group(1):
                errs.append(f"вікно {i}: .win__mark без aria-hidden")
                break
        # легенда — одразу після </figure>
        # Легенда мусить іти ОДРАЗУ за </figure> (пробіли/коментар дозволені), але сама
        # може бути довгою: до 2026-09-17 вікно пошуку було 400 символів і давало хибне
        # «пунктів легенди 0» на довгих легендах (знайшов автор j01).
        tail = src[src.index(fig) + len(fig): src.index(fig) + len(fig) + 8000]
        legend = re.match(r'\s*(?:<!--.*?-->\s*)?<ol class="win__legend"[^>]*>(.*?)</ol>', tail, re.S)
        n_leg = len(re.findall(r"<li\b", legend.group(1))) if legend else 0
        if legend:
            for li in re.findall(r"<li\b[^>]*>(.*?)</li>", legend.group(1), re.S):
                L = len(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", li)).strip())
                if L > 90:
                    warns.append(f"вікно {i}: пункт легенди {L} знаків — контракт §4.1: ≤ ~80, підпис, не речення")
        if n_marks and n_leg != n_marks:
            errs.append(f"вікно {i}: міток {n_marks}, пунктів легенди {n_leg} — мають збігатись")
        if not n_marks and legend:
            warns.append(f"вікно {i}: легенда без міток")
    for cls in ("win--", "win__enter"):
        pass
    # --- .term лишається для JQL / CLI; заборони 005 чинні ---
    n_term = len(re.findall(r'class="term(?:\s|")', src))
    for fig in re.findall(r'<figure class="term.*?</figure>', src, re.S):
        body = re.search(r'<pre class="term__body"(.*?)</pre>', fig, re.S)
        if body and 'aria-labelledby' not in fig:
            warns.append("блок .term без aria-labelledby на .term__body")
            break
    if "term--long" in src:
        warns.append("term--long в уроці — блок виглядатиме обрізаним")

    # --- квіз ---
    q = re.search(r'<script type="application/json" id="quizData">(.*?)</script>', src, re.S)
    if not q:
        errs.append("немає блоку #quizData")
    else:
        try:
            data = json.loads(q.group(1))
            qs = data.get("questions", [])
            if not is_exam and len(qs) != 6:
                errs.append(f"питань {len(qs)}, мало бути 6")
            if is_exam and len(qs) != 26:
                errs.append(f"іспит: питань {len(qs)}, очікувалось 26")
            longest = shortest = 0
            ans_hist = {}
            for i, it in enumerate(qs, 1):
                if not it.get("explain", "").strip():
                    errs.append(f"питання {i}: порожній explain")
                opts = it.get("options", [])
                a = it.get("answer")
                if not isinstance(a, int) or not (0 <= a < len(opts)):
                    errs.append(f"питання {i}: answer={a!r} поза межами {len(opts)} варіантів")
                    continue
                # --- 007 (2026-09-06): довжина варіанта не має підказувати відповідь ---
                # До правки правильна була найдовшою у 343 з 390 питань трьох курсів —
                # тест проходився без читання. Той самий підрахунок, що в
                # dev/build/007-quiz-distractors/check-quiz.py; нічия за довжиною теж
                # рахується як підказка.
                lens = [len(str(o)) for o in opts]
                if lens:
                    if lens[a] == max(lens):
                        longest += 1
                    elif lens[a] == min(lens):
                        shortest += 1
                ans_hist[a] = ans_hist.get(a, 0) + 1
            n_q = len(qs)
            if n_q and longest / n_q > 0.35:
                errs.append(f"квіз: правильна = найдовший варіант у {longest}/{n_q} питань (> 35 %) — "
                            "подовжити дистрактори (007)")
            if n_q and shortest / n_q > 0.35:
                warns.append(f"квіз: правильна = найкоротший варіант у {shortest}/{n_q} питань (> 35 %)")
            if n_q >= 5 and ans_hist:
                top_idx, top = max(ans_hist.items(), key=lambda kv: kv[1])
                if top / n_q > 0.40:
                    warns.append(f"квіз: answer={top_idx} у {top}/{n_q} питань (> 40 %) — розкидати індекс")
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
    # Пробіли нормалізуються ДО пошуку: автор c08 показав, що «просто » з пробілом не
    # ловилось, коли слово стояло в кінці рядка HTML і за ним ішов перенос.
    low = re.sub(r"\s+", " ", src.lower())
    for b in BANNED:
        if b in low:
            warns.append(f"заборонений зворот: «{b.strip()}»")

    # --- ліміти Free числами в уроці (§0.1 п. 3) ---
    low2 = re.sub(r"\s+", " ", src)
    for pat, label in ((r"\b2\s?(GB|ГБ)\b", "2 GB"), (r"\b150\s+(кроків|steps)", "150 кроків"), (r"\b100\s+(листів|emails)", "100 листів"), (r"\b500\s+(викликів|calls)", "500 викликів"), (r"\b1\s?250\b", "1 250"), (r"\b1\s?000\s+(робіт|work items|рядків)", "1 000")):
        if re.search(pat, low2) and not is_exam:
            warns.append(f"число ліміту «{label}» в уроці — має бути лише в довіднику 3")

    return errs, warns, len(src)

def main():
    files = sorted(glob.glob(PAT))
    if not files:
        print(f"Сторінок {ARGS.pattern} ще немає.")
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
