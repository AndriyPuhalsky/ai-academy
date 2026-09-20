#!/usr/bin/env python3
"""docs-text.py — текст <main> сторінки довідки Atlassian без <nav> (задача 012).

Метод, що дав 0 розбіжностей на 600+ цитатах курсу: `curl -sL <url> -o page.html` →
цей скрипт → `page.txt` поруч. Теги знято, сутності декодовано (зокрема `&#x27;`), пробіли
зведено. Цитату після цього ВСЕ ОДНО звіряти по сирому HTML (тег може розірвати слово) і
читати 200–300 знаків після збігу (обрізане уточнення). Таблиці планів цим скриптом не читати —
лише розбір <tr>/<td>.

    curl -sL https://support.atlassian.com/<product>/docs/<slug>/ -o page.html
    python3 docs-text.py page.html            → page.txt + довжина тексту
"""
import re, html, sys
def main_text(path):
    s = open(path, encoding="utf-8", errors="replace").read()
    m = re.search(r"<main\b.*?</main>", s, re.S)
    t = m.group(0) if m else s
    t = re.sub(r"<nav\b.*?</nav>", " ", t, flags=re.S)
    t = re.sub(r"<(script|style)\b.*?</\1>", " ", t, flags=re.S)
    t = re.sub(r"</(p|li|h[1-6]|tr|div|td|th)>", "\n", t)
    t = re.sub(r"<[^>]+>", "", t)
    t = html.unescape(t)
    t = re.sub(r"[ \t ]+", " ", t)
    t = re.sub(r"\n\s*\n+", "\n", t)
    return t.strip()
if __name__ == "__main__":
    for p in sys.argv[1:]:
        out = p.rsplit(".", 1)[0] + ".txt"
        open(out, "w", encoding="utf-8").write(main_text(p))
        print(out, len(main_text(p)))
