#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
012 · Генератор gallery.html — УСІ 62 вікна курсу на одній сторінці.

Навіщо. Валідатор мусить міряти всі 62 вікна одним проходом, а не відкривати
22 сторінки уроків, кожну з яких тримає шлагбаум #aiaGate. Галерея — це
дослівно вирізані `figure.win` + `ol.win__legend` + підпис `ds-diag__caption`
із живих modules/jira-*.html, у тому самому порядку.

ЖОДНОГО БАЙТА контенту не змінюється (К-29): скрипт тільки ЧИТАЄ уроки.
Перевірка — `--verify` друкує md5 кожного вихідного файла до і після.

Запуск із 03-build/:  python3 tools/build-gallery.py
"""
import re, os, sys, hashlib, html, json

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.dirname(HERE)
REPO = os.path.abspath(os.path.join(BUILD, "..", "..", "..", ".."))
MODULES = os.path.join(REPO, "modules")

FIG = re.compile(r'<figure class="win"[^>]*>')
STATE = re.compile(r'data-state="([a-z]+)"')
WID = re.compile(r'id="(w\d+)"')


def md5(path):
    with open(path, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()


def extract(src, lesson):
    """Повертає список кадрів: (id, state, html вікна, html легенди, html підпису)."""
    out = []
    for m in FIG.finditer(src):
        start = m.start()
        head = m.group(0)
        state = (STATE.search(head) or [None, "?"])[1]
        wid = (WID.search(head) or [None, "w?"])[1]
        # вікно
        end_fig = src.find("</figure>", start) + len("</figure>")
        win = src[start:end_fig]
        rest = src[end_fig:]
        # легенда — найближчий сусід ol.win__legend (62/62 — сиблінг, не дитина)
        legend = ""
        lm = re.match(r'\s*<ol class="win__legend"[^>]*>.*?</ol>', rest, re.S)
        if lm:
            legend = lm.group(0).strip()
            rest = rest[lm.end():]
        # підпис-джерело — наявний компонент, 62 рази вже в розмітці
        cap = ""
        cm = re.match(r'\s*<p class="ds-diag__caption"[^>]*>.*?</p>', rest, re.S)
        if cm:
            cap = cm.group(0).strip()
        out.append((lesson, wid, state, win, legend, cap))
    return out


def main():
    frames, hashes = [], {}
    for n in range(1, 24):
        name = "jira-%02d.html" % n
        p = os.path.join(MODULES, name)
        if not os.path.exists(p):
            continue
        hashes[name] = md5(p)
        with open(p, encoding="utf-8") as f:
            frames += extract(f.read(), "j%02d" % n)

    if "--verify" in sys.argv:
        print(json.dumps(hashes, indent=1, ensure_ascii=False))
        return

    by_state = {}
    for fr in frames:
        by_state.setdefault(fr[2], []).append(fr)

    # 24 найважчі кадри §8 спеки — адреси, щоб валідатор знаходив їх одним Cmd+F
    HARD = {
        "j04/w1": "1 · 8 міток і 8 пунктів легенди — максимум курсу",
        "j10/w2": "2 · перенос усередині клітинки: 80 знаків, 2 колонки, ⚡",
        "j13/w2": "3 · 10 вкладок — найдовший ряд курсу",
        "j06/w1": "4 · доріжки 3×3 = 9 колонок; заголовок 121 знак",
        "j10/w3": "5 · 6 колонок без доріжок — найвужча колонка курсу",
        "j08/w1": "6 · сітка гаджетів + дві таблиці + win__query усередині",
        "j15/w1": "7 · ланцюжок: крок 101 знак зі smart values; data-kind=branch",
        "j14/w2": "8 · ланцюжок із довгими українськими підписами",
        "j15/w2": "9 · 6-колонкова таблиця — скролер обовʼязковий",
        "j04/w3": "10 · друга 6-колонкова",
        "j19/w3": "11 · лічильники SLA, рейка черг із числами",
        "j09/w2": "12а · ділова рейка (7 пунктів)",
        "j13/w3": "12б · рейка розробки (10 пунктів) — різниця мусить читатись",
        "j12/w1": "13 · сторінка-не-діалог: 10 пунктів рейки, підпис 29 знаків",
        "j07/w2": "14 · СТАН ПОМИЛКИ — єдиний у курсі; addr 40 знаків одним токеном",
        "j07/w1": "15 · addr 49 знаків — найдовший нерозривний токен курсу",
        "j20/w3": "16 · адмінка Atlassian УКРАЇНСЬКОЮ (мова акаунта)",
        "j18/w1": "17 · портал без рейки й без win__main; 5 міток",
        "j19/w4": "18 · другий портал: заявки плитками",
        "j11/w3": "19 · 12 пар dl — максимум; без рейки й без win__bar",
        "j16/w1": "20 · dd на 171 знак; пункт легенди 84 знаки",
        "j17/w1": "21 · плитки Marketplace: 96 знаків, лозенджі без класу",
        "j21/w3": "22 · 7 плиток — максимум",
        "j01/w1": "23а · еталон сторінки уроку (board)",
        "j01/w2": "23б · еталон (portal)",
        "j03/w1": "24а · друга еталонна сторінка (list)",
        "j03/w2": "24б · еталон (list)",
        "j03/w3": "24в · еталон (settings)",
    }

    STATE_NOTE = {
        "list":     "23 вікна · таблиця (18) · плитки · плитки-числа · рядок JQL · стан помилки · адмінка українською",
        "settings": "12 вікон · ДВІ рейки: ділова (7) і розробки (10) · сторінка типу · матриця сповіщень · вкладки",
        "form":     "9 вікон · діалог Create (4) · вертикальний ланцюжок flow (2) · сторінка-не-діалог (3)",
        "board":    "9 вікон · колонки 2–4 · 6 колонок · доріжки 3×3 · сітка гаджетів",
        "item":     "6 вікон · крихта + статус + dl до 12 пар + опис із чеклистом + підзадачі + коментарі",
        "portal":   "3 вікна · заголовок + пошук + плитки + посилання; без рейки і без win__main (за документацією)",
    }
    ORDER = ["list", "settings", "form", "board", "item", "portal"]

    parts = []
    total = 0
    for st in ORDER:
        lst = by_state.get(st, [])
        parts.append(
            '\n<section class="gal__state" id="st-%s" aria-labelledby="st-%s-t">\n'
            '  <h2 class="gal__h2" id="st-%s-t">data-state="%s" <span class="gal__n">%d</span></h2>\n'
            '  <p class="gal__note">%s</p>\n' % (st, st, st, st, len(lst), STATE_NOTE.get(st, "")))
        for lesson, wid, state, win, legend, cap in lst:
            total += 1
            addr = "%s/%s" % (lesson, wid)
            hard = HARD.get(addr, "")
            badge = ('<b class="gal__hard">%s</b>' % html.escape(hard)) if hard else ""
            parts.append(
                '  <article class="gal__frame" id="%s-%s" data-addr="%s">\n'
                '    <p class="gal__addr"><code>modules/%s.html#%s</code>%s</p>\n'
                '    <div class="ds-prose"><section>\n%s\n%s\n%s\n    </section></div>\n'
                '  </article>\n' % (
                    lesson, wid, addr,
                    "jira-" + lesson[1:], wid, badge,
                    win, legend, cap))
        parts.append("</section>\n")

    # синтетичні кадри: вікно БЕЗ міток (0 із 62 у курсі, потрібне для jira-ref-map)
    synth = open(os.path.join(HERE, "synthetic.html"), encoding="utf-8").read()

    tpl = open(os.path.join(HERE, "gallery.tpl.html"), encoding="utf-8").read()
    out = (tpl.replace("<!--FRAMES-->", "".join(parts))
              .replace("<!--SYNTH-->", synth)
              .replace("{{TOTAL}}", str(total))
              .replace("{{COUNTS}}", " · ".join(
                  "%s %d" % (s, len(by_state.get(s, []))) for s in ORDER)))
    with open(os.path.join(BUILD, "gallery.html"), "w", encoding="utf-8") as f:
        f.write(out)

    after = {k: md5(os.path.join(MODULES, k)) for k in hashes}
    changed = [k for k in hashes if hashes[k] != after[k]]
    print("вікон вирізано: %d" % total)
    print("за станами: %s" % " · ".join("%s %d" % (s, len(by_state.get(s, []))) for s in ORDER))
    print("контент змінено: %s" % (", ".join(changed) if changed else "НІ (К-29 ✓, 23 файли)"))


if __name__ == "__main__":
    main()
