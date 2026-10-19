#!/usr/bin/env python3
"""dump-lessons.py — текстові зліпки уроків для агентів, які читають увесь курс (задача 012).

Навіщо: 23 сторінки курсу — це 1,9 МБ HTML, з яких третина — обвʼязка. Автор іспиту, рецензент
іспиту, автори довідників і будь-хто, хто читає курс цілком, отримують зліпки (≈ 1,2 МБ тексту):
теги знято, лишились маркери секцій (`@@@@ СЕКЦІЯ #l3 — … @@@@`), вікон (`[ВІКНО стан=…]`,
`[ЛЕГЕНДА]`), блоків `[TERM]` і `[MERMAID]`, виносок (`[ВИНОСКА-УВАГА]` тощо), а в кінці — квіз
уроку з ✓ на правильному варіанті й `explain`. Джерело правди — сам HTML: цитату зі зліпка
звіряти `grep`-ом по `modules/jira-NN.html`. Уроків скрипт не змінює.

    python3 dump-lessons.py --out /шлях/до/скретчпада/lessons-txt      усі уроки 01…22
    python3 dump-lessons.py --out … --upto 23                          разом з іспитом

Перегенеровувати після кожної правки уроків (секунда роботи). У репозиторій зліпки не класти.
"""
import argparse, re, json, html, glob, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", ".."))
AP = argparse.ArgumentParser(description=__doc__.split("\n")[0])
AP.add_argument("--out", required=True, help="папка для зліпків (скретчпад сесії, не репозиторій)")
AP.add_argument("--upto", type=int, default=22, help="останній номер уроку (23 — разом з іспитом)")
ARGS = AP.parse_args()
OUT = ARGS.out
os.makedirs(OUT, exist_ok=True)
tot_in = tot_out = 0
for p in sorted(glob.glob(ROOT + "/modules/jira-*.html")):
    name = os.path.basename(p)
    n = int(re.search(r"-(\d+)\.html$", name).group(1))
    if n > ARGS.upto:
        continue
    src = open(p, encoding="utf-8").read()
    title = re.search(r"<title>(.*?)</title>", src, re.S).group(1).strip()
    art = re.search(r"<article[^>]*>(.*?)</article>", src, re.S).group(1)
    art = re.sub(r"<!--.*?-->", "", art, flags=re.S)
    # маркери до зняття тегів
    art = re.sub(r'<section id="([^"]+)" data-lesson="([^"]+)"[^>]*>', r'\n\n@@@@ СЕКЦІЯ #\1 — \2 @@@@\n', art)
    art = re.sub(r'<figure class="win"[^>]*data-state="([^"]+)"[^>]*>', r'\n[ВІКНО стан=\1]\n', art)
    art = re.sub(r'<figure class="win"[^>]*>', '\n[ВІКНО]\n', art)
    art = re.sub(r'<figure class="term[^"]*"[^>]*>', '\n[TERM]\n', art)
    art = re.sub(r'</figure>', '\n[/БЛОК]\n', art)
    art = re.sub(r'<ol class="win__legend"[^>]*>', '\n[ЛЕГЕНДА]\n', art)
    art = re.sub(r'<pre class="mermaid">', '\n[MERMAID]\n', art)
    art = re.sub(r'<div class="ds-note ds-note--warn"[^>]*>', '\n[ВИНОСКА-УВАГА]\n', art)
    art = re.sub(r'<div class="ds-note ds-note--err"[^>]*>', '\n[ВИНОСКА-ПОМИЛКА]\n', art)
    art = re.sub(r'<div class="ds-note ds-note--accent"[^>]*>', '\n[ВИНОСКА-АКЦЕНТ]\n', art)
    art = re.sub(r'<div class="ds-note"[^>]*>', '\n[ВИНОСКА]\n', art)
    art = re.sub(r'<h([1-4])[^>]*>', lambda m: '\n\n' + '#' * int(m.group(1)) + ' ', art)
    art = re.sub(r'</h[1-4]>', '\n', art)
    art = re.sub(r'<li[^>]*>', '\n  • ', art)
    art = re.sub(r'<tr[^>]*>', '\n  | ', art)
    art = re.sub(r'</t[dh]>', ' | ', art)
    art = re.sub(r'<code[^>]*>', '`', art)
    art = re.sub(r'</code>', '`', art)
    art = re.sub(r'</(p|div|ul|ol|table|pre|section|blockquote|figcaption|details|summary)>', '\n', art)
    art = re.sub(r'<br\s*/?>', '\n', art)
    art = re.sub(r'<[^>]+>', '', art)
    art = html.unescape(art)
    # пробіли: у рядку — один; порожніх рядків — не більше одного
    lines = [re.sub(r'[ \t ]+', ' ', l).strip() for l in art.split('\n')]
    out, blank = [], False
    for l in lines:
        if not l:
            if not blank:
                out.append('')
            blank = True
        else:
            out.append(l)
            blank = False
    body = '\n'.join(out).strip()
    q = re.search(r'<script type="application/json" id="quizData">(.*?)</script>', src, re.S)
    qs = json.loads(q.group(1))["questions"]
    qtxt = ["", "", "@@@@ КВІЗ УРОКУ (чинна редакція; у іспиті питань дослівно не повторювати) @@@@"]
    for i, it in enumerate(qs, 1):
        qtxt.append(f"\nП{i}. {it['q']}")
        for k, o in enumerate(it["options"]):
            qtxt.append(("   ✓ " if k == it["answer"] else "   · ") + str(o))
        qtxt.append("   explain: " + it["explain"])
    text = f"ФАЙЛ: modules/{name}\nTITLE: {title}\nЗліпок (джерело правди — сам HTML; зліпок лише для читання)\n\n" + body + '\n'.join(qtxt) + '\n'
    open(f"{OUT}/jira-{n:02d}.txt", "w", encoding="utf-8").write(text)
    tot_in += len(src.encode()); tot_out += len(text.encode())
    print(f"jira-{n:02d}: {len(src.encode())/1024:6.1f} KB → {len(text.encode())/1024:6.1f} KB · секцій {body.count('@@@@ СЕКЦІЯ')} · вікон {body.count('[ВІКНО')} · ⚠ {body.count('⚠')}")
print(f"РАЗОМ: {tot_in/1024:.0f} KB → {tot_out/1024:.0f} KB")
