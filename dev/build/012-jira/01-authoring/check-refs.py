#!/usr/bin/env python3
"""Механічна перевірка сторінок-довідників «Jira з нуля» (012) — lesson-contract.md §10.

Заведено 2026-09-29 (рішення №4 «контракт §10 + check-refs.py»; делеговано власником кореневій
сесії). Обидва автори довідників хвилі 1 незалежно зібрали цю перевірку вручну, бо
check-lessons.py на довіднику падає: він вимагає квіз, data-module і ≥ 9 секцій data-lesson.

Робить: каркас за еталоном claude-code-ref-*.html, унікальні id, биті якорі, зміст ↔ секції,
класи проти css/*.css, заборони системи 009 (альфа-модифікатори, style=, <img>/<svg>/<canvas>),
Mermaid, апострофи, заборонені звороти. Факти НЕ перевіряє.

Запуск:  python3 dev/build/012-jira/01-authoring/check-refs.py [--pattern 'jira-ref-*.html']
         [--config jira.config.json] [--course jira]
"""
import argparse, glob, os, re, sys
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))   # …/AIA
AP = argparse.ArgumentParser()
AP.add_argument("--pattern", default="jira-ref-*.html")
AP.add_argument("--config", default="jira.config.json")
AP.add_argument("--course", default="jira")
ARGS = AP.parse_args()

BANNED = ["просто ", "очевидно", "як відомо", "елементарно",
          "всі знають", "звісно", "не забудь"]
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "source", "track", "wbr"}


def css_classes():
    """Усі імена класів, що трапляються в селекторах css/*.css."""
    names = set()
    for p in glob.glob(os.path.join(ROOT, "css", "*.css")):
        txt = open(p, encoding="utf-8").read()
        txt = re.sub(r"/\*.*?\*/", "", txt, flags=re.S)
        names.update(re.findall(r"\.(-?[_a-zA-Z][\w-]*)", txt))
    return names


class Walk(HTMLParser):
    """Збирає id, href="#…", класи й баланс тегів."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.hrefs, self.classes = [], [], []
        self.stack, self.unbalanced = [], []
        self.toc_hrefs, self.in_toc = [], 0
        self.sections, self.depth_article = [], 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.append((a["id"], self.getpos()[0]))
        if a.get("class"):
            for c in a["class"].split():
                self.classes.append((c, self.getpos()[0]))
        h = a.get("href") or ""
        if h.startswith("#") and len(h) > 1:
            self.hrefs.append((h[1:], self.getpos()[0]))
            if self.in_toc:
                self.toc_hrefs.append(h[1:])
        if tag == "details" and a.get("id") == "refToc":
            self.in_toc = 1
        elif tag == "details" and self.in_toc:
            self.in_toc += 1
        if tag == "article" and "ds-prose" in (a.get("class") or ""):
            self.depth_article = 1
        elif tag == "article" and self.depth_article:
            self.depth_article += 1
        if tag == "section" and self.depth_article and a.get("id"):
            self.sections.append(a["id"])
        if tag not in VOID:
            self.stack.append((tag, self.getpos()[0]))

    def handle_startendtag(self, tag, attrs):
        # <br/> тощо — самозакриті; стек не чіпаємо
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack and self.stack[-1][0] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if tag == "details" and self.in_toc:
            self.in_toc -= 1
        if tag == "article" and self.depth_article:
            self.depth_article -= 1
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                for t, ln in self.stack[i + 1:]:
                    if t not in ("p", "li", "dt", "dd", "tr", "td", "th", "option"):
                        self.unbalanced.append(f"<{t}> з рядка {ln} не закритий до </{tag}>")
                del self.stack[i:]
                return
        self.unbalanced.append(f"зайвий </{tag}> у рядку {self.getpos()[0]}")


def check(path, known):
    src = open(path, encoding="utf-8").read()
    errs, warns = [], []

    # --- каркас (контракт §10; еталон claude-code-ref-commands.html) ---
    head = re.search(r"<html[^>]*>", src)
    h = head.group(0) if head else ""
    if f'data-config="{ARGS.config}"' not in h:
        errs.append(f"<html> без data-config=\"{ARGS.config}\"")
    if f'data-course="{ARGS.course}"' not in h:
        errs.append(f"<html> без data-course=\"{ARGS.course}\"")
    if "data-own-title" not in h:
        errs.append("<html> без data-own-title — js/config.js перепише <title>")
    if re.search(r"<body[^>]*data-module=", src):
        errs.append("data-module на <body> — довідник не урок (поза modules і сертифікатом)")
    for bad in (r'<script[^>]*src="js/module\.js"', r'<script[^>]*src="js/quiz\.js"', r'id="quizData"'):
        if re.search(bad, src):
            errs.append(f"{bad.split('src=')[-1]} на довіднику — квізу й прогресу уроку тут немає")
    for need, label in (
        ('id="configError"', "#configError"),
        ('class="ds-ref"', ".ds-ref"),
        ('<details id="refToc" class="ds-ref__toc"', "details#refToc.ds-ref__toc"),
        ('<main id="main" class="ds-ref__main"', "main#main.ds-ref__main"),
        ('class="ds-ref__head"', ".ds-ref__head"),
        ('class="ds-ref__stat"', ".ds-ref__stat"),
        ('<article class="ds-prose">', "article.ds-prose"),
        ('<section id="how">', "section#how («Як читати»)"),
        ('<section id="sources">', "section#sources"),
        ('<a class="ds-skip" href="#main"', "a.ds-skip → #main"),
    ):
        if need not in src:
            errs.append(f"немає {label}")
    if "user-scalable=no" in src or "maximum-scale" in src:
        errs.append("user-scalable=no / maximum-scale — порушення WCAG 1.4.4")
    if not re.search(r"<title>[^<]{3,}</title>", src):
        errs.append("порожній <title>")

    # --- розбір ---
    w = Walk()
    w.feed(src)
    for u in w.unbalanced[:5]:
        errs.append(f"розмітка: {u}")
    if len(w.unbalanced) > 5:
        errs.append(f"розмітка: ще {len(w.unbalanced) - 5} незакритих/зайвих тегів")

    # --- id і якорі ---
    seen = {}
    for i, ln in w.ids:
        if i in seen:
            errs.append(f"повторний id=\"{i}\" (рядки {seen[i]} і {ln})")
        seen.setdefault(i, ln)
    for hr, ln in w.hrefs:
        if hr not in seen:
            errs.append(f"битий якір href=\"#{hr}\" (рядок {ln})")
    toc = set(w.toc_hrefs)
    for s in w.sections:
        if s not in toc:
            warns.append(f"секція #{s} не має пункту в змісті #refToc")
    for t in toc:
        if t not in w.sections and t != "main":
            warns.append(f"пункт змісту #{t} веде не на секцію article.ds-prose")

    # --- класи ---
    unknown = {}
    for c, ln in w.classes:
        if re.fullmatch(r"[\w:-]+/\d+", c):
            errs.append(f"альфа-модифікатор Tailwind «{c}» (рядок {ln}) — на var()-кольорі дає прозоре")
        elif c.startswith(("ds-", "win", "term")) and c not in known:
            # BEM-модифікатор без власного правила (term--cmd з 005 §4) — законний,
            # якщо відомий базовий клас
            if "--" in c and c.split("--")[0] in known:
                continue
            unknown.setdefault(c, ln)
    for c, ln in sorted(unknown.items(), key=lambda kv: kv[1]):
        errs.append(f"клас «{c}» (рядок {ln}) не знайдено в жодному css/*.css — вигаданий?")

    # --- заборони системи 009 і контракту §8 ---
    for m in re.finditer(r"<[a-z][^>]*\sstyle=", src):
        errs.append(f"style=\"\" (рядок {src.count(chr(10), 0, m.start()) + 1}) — лише класи системи")
        break
    for m in re.finditer(r"<(img|svg|canvas)\b", src):
        errs.append(f"<{m.group(1)}> (рядок {src.count(chr(10), 0, m.start()) + 1}) — у довіднику заборонено")
        break
    for cls in ("term--enter", "term--hero", "term--long"):
        if cls in src:
            errs.append(f"{cls} на довіднику — блоки лишаться невидимими / обрізаними")

    # --- Mermaid ---
    n_mer = src.count('class="mermaid"')
    if n_mer:
        for need in ("mermaid.min.js", "js/mermaid-theme.js", "js/mermaid-init.js"):
            if need not in src:
                errs.append(f"є Mermaid ({n_mer}), але не підключено {need}")
        for pre in re.findall(r'<pre class="mermaid">(.*?)</pre>', src, re.S):
            if "<br" in pre:
                errs.append("<br/> усередині Mermaid — пастка 010, ділити вузол")
                break

    # --- джерела: назви сторінок і дата прочитання, без зовнішніх href (як у двох довідниках 012) ---
    srcsec = re.search(r'<section id="sources">(.*?)</section>', src, re.S)
    if srcsec and not re.search(r"20\d\d", srcsec.group(1)):
        warns.append("у #sources немає жодної дати прочитання")

    # --- апостроф: тільки U+0027 (пастка 005) ---
    for ch, name in (("ʼ", "U+02BC"), ("’", "U+2019"), ("‘", "U+2018")):
        n = src.count(ch)
        if n:
            errs.append(f"апостроф {name} — {n} входжень; має бути тільки ' (U+0027)")

    # --- мова (лише видимий текст: без <pre>/<code>/<script>) ---
    vis = re.sub(r"<(script|style|pre|code)\b.*?</\1>", " ", src, flags=re.S)
    vis = re.sub(r"<[^>]+>", " ", vis)
    low = re.sub(r"\s+", " ", vis.lower())
    for b in BANNED:
        if b in low:
            warns.append(f"заборонений зворот: «{b.strip()}»")

    stats = {"секцій": len(w.sections), "таблиць": src.count('class="ds-tbl'),
             "Mermaid": n_mer, "term": len(re.findall(r'class="term(?:\s|")', src))}
    return errs, warns, len(src), stats


def main():
    files = sorted(glob.glob(os.path.join(ROOT, ARGS.pattern)))
    if not files:
        print(f"Сторінок {ARGS.pattern} ще немає.")
        return 0
    known = css_classes()
    bad = 0
    print(f"Перевіряю {len(files)} довідник(и)\n" + "═" * 64)
    for p in files:
        e, w, size, st = check(p, known)
        flag = "✗" if e else ("!" if w else "✓")
        tail = " · ".join(f"{k} {v}" for k, v in st.items())
        print(f"\n{flag} {os.path.basename(p)}  ({size/1024:.1f} KB · {tail})")
        for x in e: print(f"    ✗ {x}")
        for x in w: print(f"    ! {x}")
        if e: bad += 1
    print("\n" + "═" * 64)
    print(f"Готово. З помилками: {bad} із {len(files)}.")
    print("Факти цей скрипт НЕ перевіряє — лише каркас, механіку й мову.")
    return 1 if bad else 0


sys.exit(main())
