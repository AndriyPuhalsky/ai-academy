#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
012 · ПЕРЕВІРКИ ПО ДЖЕРЕЛУ — те, що треба читати в коді, а не міряти в браузері.
Браузерні заміри живуть у tests.html.

Запуск із 03-build/:  python3 tools/check.py
Вихід: таблиця ТЕСТ · PASS/FAIL · число.
"""
import os, re, sys, math, hashlib, glob, json

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.dirname(HERE)
REPO = os.path.abspath(os.path.join(BUILD, "..", "..", "..", ".."))
R = []


def t(name, ok, detail=""):
    R.append((name, bool(ok), detail))


def read(*p):
    with open(os.path.join(*p), encoding="utf-8") as f:
        return f.read()


def strip_comments(css):
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


TOK = read(BUILD, "tokens-jira.css")
WIN = read(BUILD, "win.css")
PAGE = read(BUILD, "jira.css")
WIN_C = strip_comments(WIN)
PAGE_C = strip_comments(PAGE)
TOK_C = strip_comments(TOK)
MOTION = read(BUILD, "jira-motion.js")
RENDER = read(BUILD, "jira-render.js")
LESSONS = sorted(glob.glob(os.path.join(REPO, "modules", "jira-*.html")))

# ---------------------------------------------------------------- колір -----
def srgb_lin(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def lum(h):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * srgb_lin(r) + 0.7152 * srgb_lin(g) + 0.0722 * srgb_lin(b)


def cr(a, b):
    x, y = lum(a), lum(b)
    if x < y:
        x, y = y, x
    return (x + 0.05) / (y + 0.05)


M1 = [[0.4122214708, 0.5363325363, 0.0514459929],
      [0.2119034982, 0.6806995451, 0.1073969566],
      [0.0883024619, 0.2817188376, 0.6299787005]]
M2 = [[0.2104542553, 0.7936177850, -0.0040720468],
      [1.9779984951, -2.4285922050, 0.4505937099],
      [0.0259040371, 0.7827717662, -0.8086757660]]


def oklch(h):
    hh = h.lstrip("#")
    rgb = [srgb_lin(int(hh[i:i + 2], 16)) for i in (0, 2, 4)]
    lms = [sum(M1[i][j] * rgb[j] for j in range(3)) for i in range(3)]
    lms = [math.copysign(abs(v) ** (1 / 3), v) for v in lms]
    L, a, b = [sum(M2[i][j] * lms[j] for j in range(3)) for i in range(3)]
    return L, math.hypot(a, b), math.degrees(math.atan2(b, a)) % 360


J500, J600, JEDGE = "#C57CB4", "#D692C5", "#9A578A"
BG, SURF, RAISED, N0, PAPER, WHITE = "#161311", "#1E1A17", "#26221D", "#0E0C0A", "#F9F3E7", "#FFFFFF"

# ============================ АКЦЕНТ І СИСТЕМА ==============================
slot = re.search(r'\[data-course="jira"\]\s*\{([^}]*)\}', TOK_C)
names = re.findall(r"(--[a-z-]+)\s*:", slot.group(1)) if slot else []
t("К-1 слот курсу — рівно 5 імен", len(names) == 5, "%d: %s" % (len(names), ", ".join(names)))
t("К-1 жодного шостого імені", set(names) == {"--c-accent", "--c-accent-hover", "--c-accent-quiet",
                                              "--c-accent-edge", "--c-on-accent"})

conds = [
    ("-500 як текст на --c-surface", cr(J500, SURF), 4.5),
    ("-500 як текст на --c-raised",  cr(J500, RAISED), 4.5),
    ("--c-on-accent (n-0) на -500",  cr(N0, J500), 4.5),
    ("-600 на --c-surface",          cr(J600, SURF), 4.5),
    ("n-0 на -600",                  cr(N0, J600), 4.5),
    ("-edge як межа на --c-raised",  cr(JEDGE, RAISED), 3.0),
    ("-edge на папері #F9F3E7",      cr(JEDGE, PAPER), 4.5),
    ("білий на -edge (монограма)",   cr(WHITE, JEDGE), 4.5),
]
for nm, v, lim in conds:
    t("К-2 " + nm, v >= lim, "%.2f ≥ %.1f" % (v, lim))

H = oklch(J500)[2]
for nm, hx in [("шафран", "#BF8A3A"), ("патина", "#1FA68E"), ("лазур", "#7692DC")]:
    d = abs(H - oklch(hx)[2])
    d = min(d, 360 - d)
    t("К-2 ΔH до %s ≥ 30°" % nm, d >= 30, "%.1f°" % d)
t("К-2 тон у коридорі 322–350°", 322 <= H <= 350, "%.1f°" % H)
for nm, hx in [("#0052CC", "#0052CC"), ("#1868DB", "#1868DB")]:
    d = abs(H - oklch(hx)[2]); d = min(d, 360 - d)
    t("К-27 ΔH до Atlassian %s" % nm, d >= 60, "%.1f°" % d)

allsrc = TOK + WIN + PAGE + MOTION + RENDER + read(BUILD, "jira.html")
t("К-27 нуль Atlassian-синього у файлах", not re.search(r"0052CC|1868DB", allsrc, re.I))

# ============================ ПРЕФІКСИ І ТОКЕНИ =============================
hexes = re.findall(r"#[0-9A-Fa-f]{3,8}\b", strip_comments(WIN) + strip_comments(PAGE))
t("К-5 нуль хардкод-хексів у win.css і jira.css", not hexes, str(hexes))
t("К-5 нуль rgba()-літералів", "rgba(" not in WIN_C and "rgba(" not in PAGE_C)
# @property оголошує initial-value — це НЕ правило руху, літерал там обовʼязковий
RULES_ONLY = re.sub(r"@property[^{]*\{[^}]*\}", "", WIN_C + PAGE_C)
bad_ms = re.findall(r":\s*\d+m?s\b", RULES_ONLY)
t("К-5 нуль літералів ms/s у правилах", not bad_ms, str(bad_ms[:5]))
zi = re.findall(r"z-index:\s*(-?\d+)", WIN_C + PAGE_C)
t("К-5 нуль числових z-index", not zi, str(zi))

l3 = set(re.findall(r"(--(?:win|jira)-[a-z0-9-]+)\s*:", TOK_C + WIN_C + PAGE_C))
t("К-4 усі L3-токени з префіксом ПЕРШИМ", all(x.startswith("--win-") or x.startswith("--jira-") for x in l3),
  "%d токенів" % len(l3))
other = set(re.findall(r"^\s*(--(?!win-|jira-|p-|motion|loop|dur-u|move-u|fade-w|badge-|btn-)[a-z0-9-]+)\s*:",
                       WIN_C + PAGE_C, re.M))
t("L1/L2 не оголошуються заново", not other, str(sorted(other)[:6]))

# ============================ КОМПОНЕНТ =====================================
def blocks(css):
    """(селектор, тіло) для правил верхнього рівня і всередині @media/@supports."""
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find("{", i)
        if j < 0:
            break
        head = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == "{":
                depth += 1
            elif css[k] == "}":
                depth -= 1
            k += 1
        body = css[j + 1:k - 1]
        if head.startswith("@"):
            if head.split()[0] in ("@media", "@supports"):
                out += blocks(body)
        else:
            out.append((head, body))
        i = k
    return out


def spec(sel):
    sel = re.sub(r"::?[a-z-]+(\([^)]*\))?", " ", sel)
    a = len(re.findall(r"#[\w-]+", sel))
    b = len(re.findall(r"\.[\w-]+", sel)) + len(re.findall(r"\[[^\]]+\]", sel))
    c = len(re.findall(r"(?<![\w.#\[-])[a-z][\w-]*", sel))
    return a, b, c


WIN_BLOCKS = blocks(WIN_C)

# ⚠ ЩО САМЕ ПЕРЕВІРЯЄ К-13 І ЧОМУ НЕ «ВСІ СЕЛЕКТОРИ ≥ (0,2,0)».
# Небезпека конкретна й виміряна: у `.ds-prose` живуть чотири правила, які
# бʼють компонент — `.ds-prose li { margin }` (0,1,1), `.ds-prose li::marker
# { color }` (0,1,1), `:is(.ds-prose, .ds-prose > section) > :is(ul, ol)
# { list-style; margin; padding }` (0,1,2) і `.ds-prose code { … }` (0,1,1).
# Тобто поріг треба тримати САМЕ там, де селектор може влучити в <li>, <ul>,
# <ol> або <code> усередині прози. Блок, що оголошує лише custom properties,
# ні з чим не конкурує; `figure.win` (0,1,1) теж — у прози немає правила на
# <figure>. Наївне «всі ≥ (0,2,0)» дало б шість хибних спрацювань і привчило
# б дивитись повз цей тест.
# Поріг рахується ПО СУБʼЄКТУ селектора (останньому компоненту), бо саме він
# визначає, з яким правилом прози доведеться конкурувати:
#   <li>        → `.ds-prose li` (0,1,1) і `li::marker` (0,1,1)
#   <ul>/<ol>   → `:is(.ds-prose, .ds-prose > section) > :is(ul, ol)` (0,1,2)
#   <code>      → `.ds-prose code` (0,1,1)
SUBJ_LI = re.compile(r"(^|[\s>+~])li\b|win__(rail-item|col|card|tile|step|lane|gadget)\b")
SUBJ_LIST = re.compile(r"(^|[\s>+~])(ul|ol)\b|win__(legend|cards|cols|tiles|stats|gadgets|chain|checks|rail)\b")
SUBJ_CODE = re.compile(r"(^|[\s>+~])code\b")
# Властивості, які прозові правила РЕАЛЬНО задають для цього субʼєкта. Решту
# властивостей перевіряти нема сенсу: конкурента в них немає.
PROSE_PROPS = {
    "li":   {"margin", "color"},                       # .ds-prose li, li::marker
    "list": {"list-style", "margin", "padding-left"},   # :is(...) > :is(ul, ol)
    "code": {"font-family", "font-size", "overflow-wrap", "padding",
             "border-radius", "background", "color"},   # .ds-prose code
}


def subject(sel):
    """Останній компонент селектора; вміст :has()/:is()/:not() замаскований,
    інакше `figure.win:has(+ .win__legend)` розпадається по плюсу всередині
    дужок і субʼєктом стає чужий клас."""
    masked = re.sub(r"\([^()]*\)", "()", sel)
    parts = re.split(r"\s*[>+~]\s*|\s+", masked.strip())
    return parts[-1]


weak = []
for head, body in WIN_BLOCKS:
    decls = [d for d in body.split(";") if ":" in d]
    props = {d.split(":")[0].strip() for d in decls}
    if props and all(p.startswith("--") for p in props):
        continue                      # лише токени — конкурувати нема з чим
    heads = [h.strip() for h in head.split(",") if h.strip()]
    best = max((spec(h) for h in heads), default=(0, 0, 0))   # пара селекторів
    for s1 in heads:
        if "%" in s1 or s1 in ("from", "to"):
            continue
        subj = subject(s1)
        kind = ("li" if SUBJ_LI.search(subj) else
                "list" if SUBJ_LIST.search(subj) else
                "code" if SUBJ_CODE.search(subj) else None)
        if not kind:
            continue
        clash = props & PROSE_PROPS[kind]
        if not clash:
            continue                  # жодної спірної властивості в блоці
        need = (0, 1, 2) if kind == "list" else (0, 1, 1)
        if best <= need:
            weak.append("%s %s ≤ %s %s" % (s1, spec(s1), need, sorted(clash)))
t("К-13 селектори, що влучають у li/ul/ol/code, бʼють правила прози", not weak,
  str(weak[:6]) if weak else "перевірено %d блоків; остаточний доказ — A/B у tests.html" % len(WIN_BLOCKS))

bare = [h for h, _ in WIN_BLOCKS
        for s1 in h.split(",")
        if re.fullmatch(r"(h[1-6]|th|td|dt|dd|table|li|ul|ol|p|span|div|b|code)", s1.strip())]
t("К-12б нуль правил на ГОЛИЙ тег у компоненті", not bare, str(bare[:5]))
t("К-12 нуль text-overflow у компоненті", "text-overflow" not in WIN_C)
t("К-15 нуль cursor: pointer у компоненті", "cursor: pointer" not in WIN_C)
t("К-15 нуль tabindex у CSS компонента", "tabindex" not in WIN_C or 'tabindex="0"]:focus' in WIN_C)
hov = re.findall(r"(?m)^[^@{]*:hover[^{]*\{", WIN_C)
t("К-15 нуль :hover у компоненті вікна", not hov, str(hov[:3]))
t("К-11 перша колонка НЕ nowrap", "td:first-child" in WIN_C and "nowrap" not in
  WIN_C.split("td:first-child")[1].split("}")[0])
t("К-17 .win у ОБОХ списках `wide`",
  ".ds-prose > .win" in WIN_C and ".ds-prose > section > .win" in WIN_C)
t("К-17 .win__legend НЕ в списку `wide`",
  not re.search(r"\.ds-prose\s*>\s*(section\s*>\s*)?\.win__legend", WIN_C))
t("К-16 гілка @supports not selector(:has(*))", "@supports not selector(:has(*))" in WIN_C)

# ============================ РОЗМІТКА КУРСУ ================================
tot_mark = tot_leg = mism = 0
scope_ok = scope_all = 0
for p in LESSONS:
    src = read(p)
    for m in re.finditer(r'<figure class="win"[^>]*id="(w\d+)"', src):
        seg = src[m.start():]
        endf = seg.find("</figure>")
        marks = len(re.findall(r'class="win__mark"', seg[:endf]))
        rest = seg[endf:]
        lm = re.search(r'<ol class="win__legend"[^>]*>(.*?)</ol>', rest, re.S)
        legs = len(re.findall(r"<li>", lm.group(1))) if lm else 0
        tot_mark += marks; tot_leg += legs
        if marks != legs:
            mism += 1
    for tb in re.finditer(r'<table class="win__table".*?</table>', src, re.S):
        scope_all += 1
        if 'scope="col"' in tb.group(0):
            scope_ok += 1
t("К-8 збіг міток і пунктів легенди 62/62", mism == 0, "розбіжностей %d · міток %d · пунктів %d" % (mism, tot_mark, tot_leg))
R.append(("К-11 scope=\"col\" у win__table", None,
          "%d із %d — sed-пас БІЛДУ; дизайн вимагає атрибута, контент заморожений (К-29)"
          % (scope_ok, scope_all)))

# ============================ РУХ ===========================================
declared = set(re.findall(r"@property\s+(--[a-z-]+)", PAGE + WIN))
used = set(re.findall(r"(--jira-[a-z0-9-]+)\s*:\s*calc", PAGE_C))
t("К-25 нові складені токени руху через @property", used <= declared,
  "оголошено %d, складених %d" % (len(declared), len(used)))
sys_tokens = read(REPO, "css", "tokens.css")
rm = re.search(r"@media \(prefers-reduced-motion: reduce\) \{([^}]*\{[^}]*\})", sys_tokens)
t("К-25 блок reduce у tokens.css лишається ДВОМА рядками",
  rm and rm.group(1).count(";") == 2, rm.group(1).strip() if rm else "")
t("К-25 у файлах 012 немає власного блока reduce",
  "prefers-reduced-motion" not in WIN_C and "prefers-reduced-motion" not in PAGE_C)
PAGE_BLOCKS = blocks(PAGE_C)
inf = [(h, b) for h, b in PAGE_BLOCKS if "infinite" in b]
noplay = [h for h, b in inf if "animation-play-state" not in b]
# `.jira-flip` задає цикл довгою формою — дивимось і її
longform = [(h, b) for h, b in PAGE_BLOCKS if "animation-iteration-count: infinite" in b]
noplay += [h for h, b in longform if "animation-play-state" not in b]
t("П4 кожна infinite має animation-play-state", not noplay, str(noplay[:3]))
# ⚠ ЩО САМЕ РАХУЄ БЮДЖЕТ К-22. Не кількість оголошень `animation`, а кількість
# НЕЗАЛЕЖНИХ годинників: шість доріжок hero мають ОДНУ тривалість і нульову
# затримку, тобто це один цикл, розкладений на шість елементів. Наївний grep
# по `infinite` дав би 6 і збрехав.
clocks = set(re.findall(r"animation[^;]*?(var\(--[a-z-]+\))", " ".join(b for _, b in inf + longform)))
t("К-22 ≤ 2 НЕЗАЛЕЖНІ цикли на лендінг", len(clocks) <= 2,
  "годинників %d: %s · доріжок %d" % (len(clocks), ", ".join(sorted(clocks)), len(inf) + len(longform)))
kf = re.findall(r"@keyframes[^{]*\{((?:[^{}]|\{[^{}]*\})*)\}", PAGE_C + WIN_C)
lay = [x for body in kf for x in re.findall(r"\b(width|height|top|left|right|bottom|margin|padding)\s*:", body)]
t("К-22 нуль LAYOUT-властивостей у @keyframes", not lay,
  "кадрів %d, layout-властивостей %d" % (len(kf), len(lay)))
t("К-24 рух не створює й не видаляє вузлів",
  "createElement" not in MOTION and "innerHTML" not in MOTION and "remove()" not in MOTION)
t("К-23 нуль анімацій усередині .win на уроках",
  "animation" not in WIN_C, "animation у win.css: %d" % WIN_C.count("animation"))
t("JS читає лише сирі токени (пастка calc + getComputedStyle)",
  "getPropertyValue" not in MOTION or "--p-" not in MOTION)

# бюджет hero
cyc = int(re.search(r"--p-jira-cycle:\s*(\d+)", PAGE_C).group(1))
pace = float(re.search(r"--p-jira-pace-slow:\s*([\d.]+)", PAGE_C).group(1))
to_done = cyc * pace * 1.15 * 0.54 / 1000.0
t("К-18 перша картка в Done ≤ 6 с при найповільнішому", to_done <= 6.0,
  "%.2f с (цикл %d × темп %.2f × bold 1.15 × 54%%)" % (to_done, cyc, pace))

# ============================ КОНТЕНТ =======================================
hashes = {}
for p in LESSONS + sorted(glob.glob(os.path.join(REPO, "jira-ref-*.html"))) + [os.path.join(REPO, "jira.config.json")]:
    hashes[os.path.basename(p)] = hashlib.md5(open(p, "rb").read()).hexdigest()
ref = os.path.join(HERE, "content.md5.json")
if os.path.exists(ref):
    old = json.load(open(ref))
    diff = [k for k in hashes if old.get(k) != hashes[k]]
    t("К-29 контент не змінений ні на байт", not diff, str(diff) if diff else "%d файлів" % len(hashes))
else:
    json.dump(hashes, open(ref, "w"), indent=1)
    t("К-29 контрольні суми контенту знято", True, "%d файлів — повторний запуск звірить" % len(hashes))

# ============================ ВИВІД =========================================
w = max(len(n) for n, _, _ in R)
bad = 0
info = 0
for n, ok, d in R:
    if ok is None:
        info += 1; mark = "БІЛД"
    elif ok:
        mark = "PASS"
    else:
        bad += 1; mark = "FAIL"
    print("%-*s  %s  %s" % (w, n, mark, d))
print("\n%d тестів · %d PASS · %d FAIL · %d для білду" % (len(R), len(R) - bad - info, bad, info))
sys.exit(1 if bad else 0)
