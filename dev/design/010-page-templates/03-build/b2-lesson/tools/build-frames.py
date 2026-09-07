#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
010 · Б2 · Складання живих кадрів T2 / T3 із РЕАЛЬНОГО контенту проду.

Запуск (з папки b2-lesson):
    python3 tools/build-frames.py

Джерела (тільки читання):
    ../../../../modules/claude-code-05.html   → t2-lesson.html      (Термінал)
    ../../../../modules/module-05.html        → t2-lesson-academy.html (Академія)
    ../../../../modules/claude-code-23.html   → t3-exam.html        (іспит, 12 питань)

Тіло уроку переносить tools/migrate-lesson-body.py (карта §8.3).
Тут — те, що скриптом по карті НЕ робиться (§13.5) і шапка/футер/скелет §5–6.
"""
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.abspath(os.path.join(HERE, "..", "..", "..", "..", ".."))
BASE = "../../../009-design-system/04-variants/_base"


# ── §5.2 · дослівний блок <head> для сторінок у modules/ ──────────────────────
def head(title, course, config):
    return f"""  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <!-- Д16 · єдиний легальний хекс у HTML; дорівнює --p-n-100. Змінюєш тут —
       заміни в tokens.css біля --p-n-100 (і навпаки). <meta> не читає var(). -->
  <meta name="theme-color" content="#161311">

  <script>document.documentElement.classList.add("js");</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <!-- Латиниця вантажиться СВІДОМО: український апостроф ʼ (U+02BC) лежить у
       латинській підмножині Google Fonts, а не в кириличній. -->
  <link href="https://fonts.googleapis.com/css2?family=Prata&family=Golos+Text:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <!-- У коді сайту це буде ../css/tokens.css і ../css/components.css -->
  <link rel="stylesheet" href="{BASE}/tokens.css">
  <link rel="stylesheet" href="{BASE}/components.css">
  <link rel="stylesheet" href="components-010.css">
  <link rel="stylesheet" href="chrome-stub.css"><!-- заглушка, власник Б1 -->
  <link rel="stylesheet" href="demo.css"><!-- панель станів, у код не їде -->

  <script src="https://cdn.tailwindcss.com"></script>
  <script src="js/tw-theme.js"></script>"""


# ── §6.1 + §6.2 (профіль H2) · пишеться дослівно всіма трьома білдерами ───────
def chrome_top(config, crumb, home_label):
    return f"""  <a class="ds-skip" href="#main">Перейти до вмісту</a>
  <div id="ariaLive" class="sr-only" aria-live="polite"></div>

  <noscript>
    <div class="ds-note ds-note--warn" role="alert">
      <span class="ds-note__glyph" aria-hidden="true">▲</span>
      <p class="ds-note__body">Для роботи платформи потрібен JavaScript — увімкни його в налаштуваннях браузера.</p>
    </div>
  </noscript>

  <div id="configError" hidden class="ds-note ds-note--err" role="alert">
    <span class="ds-note__glyph" aria-hidden="true">✕</span>
    <p class="ds-note__body">
      ⚠ Не вдалося завантажити <code class="ds-code--inline">{config}</code>. Відкрий сайт через
      локальний сервер, наприклад: <code class="ds-code--inline">python -m http.server 8000</code> —
      і зайди на <code class="ds-code--inline">localhost:8000</code>.
    </p>
  </div>

  <!-- ⚠ ХРОМ. Розмітка — §6.2, профіль H2 (урок / іспит), ДОСЛІВНО.
       Канонічна версія й стилі .ds-hdr__mark / __crumb — у Б1. -->
  <header class="ds-hdr">
    <button id="sidebarBtn" type="button" class="ds-btn ds-btn--icon ds-btn--sm ds-hdr__burger"
            aria-expanded="false" aria-controls="moduleSidebar">
      <span class="sr-only">Зміст курсу</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>

    <a class="ds-hdr__brand" href="#" data-demo-home>
      <span class="ds-hdr__mark" data-site="shortName" aria-hidden="true">AIT</span>
      <span data-site="name">AI Термінал</span>
    </a>
    <span class="ds-hdr__crumb" aria-hidden="true">/</span>
    <span class="ds-hdr__crumb">{crumb}</span>

    <span class="ds-hdr__spacer"></span>

    <div id="aiaAuth" class="ds-hdr__slot">
      <!-- слот авторизації (js/auth-ui.js). Тут — скелетон Б1, щоб було видно
           резерв ширини: CLS має лишатись нулем у всіх трьох станах. -->
      <span class="ds-skel ds-skel--guest" data-delayed aria-hidden="true"></span>
    </div>

    <span id="navProgress" hidden class="ds-pill ds-pill--unknown"></span>

    <a class="ds-btn ds-btn--quiet ds-btn--sm" href="#" data-demo-home>{home_label}</a>
  </header>"""


def chrome_bottom(refs):
    """§6.6 профіль F2 (57 уроків + 3 довідники)."""
    return f"""  <footer class="ds-ftr">
{refs}    <div class="ds-ftr__bar">
      <p class="ds-small" data-site="disclaimer"></p>
      <a href="#top">На головну ↑</a>
    </div>
  </footer>"""


REFS_TERMINAL = """    <!-- D-03 задачі 005: вхід у три довідники з будь-якого уроку курсу.
         §6.6 профілю F2 цього блока НЕ описує — знахідка Б2, див. REPORT. -->
    <nav class="flex flex-wrap items-center gap-x-6 gap-y-1" aria-label="Довідники курсу">
      <span class="ds-eyebrow" data-site="refsLabel">Довідники</span>
      <a class="ds-btn ds-btn--quiet ds-btn--sm" href="#" data-site="refCommands">Усі команди й клавіші</a>
      <a class="ds-btn ds-btn--quiet ds-btn--sm" href="#" data-site="refHooks">Таблиця подій</a>
      <a class="ds-btn ds-btn--quiet ds-btn--sm" href="#" data-site="refSettings">Ключі settings.json</a>
    </nav>
"""


# ── те, чого карта §8.3 не робить: три-чотири утиліти → один клас (§13.5) ─────
def hand_fixes(art):
    n = {}
    # 1. надзаголовок фази: uppercase + tracking — заборонені системою (_base §0)
    art, n["eyebrow"] = re.subn(
        r'<p class="!mt-0 mb-4 font-mono text-xs uppercase tracking-\[[^\]]+\] text-accent">',
        '<p class="ds-eyebrow">', art)
    # 2. h1: чотири утиліти → один клас
    art, n["h1"] = re.subn(
        r'<h1 class="[^"]*">', '<h1 class="ds-h1">', art)
    # 3. метарядок уроку
    art, n["meta"] = re.subn(
        r'<p class="mt-4 font-mono text-xs text-fg-3 sm:text-sm">',
        '<p class="ds-small ds-num">', art)
    # 4. лід
    art, n["lead"] = re.subn(r'<p class="mt-6 text-lg">', '<p class="ds-lead">', art)
    # 5. кожен <pre> поза .term / .mermaid отримує ds-code__pre
    def pre(m):
        a = m.group(1)
        if "mermaid" in a or "term__body" in a:
            return m.group(0)
        if "class=" in a:
            return re.sub(r'class="([^"]*)"', lambda c: 'class="ds-code__pre ' + c.group(1) + '"', m.group(0))
        return "<pre class=\"ds-code__pre\"" + a + ">"
    art, n["pre"] = re.subn(r'<pre\b([^>]*)>', pre, art)
    # 6. секція квіза: заголовок і контейнер
    art = art.replace('<div data-quiz="quizData"></div>',
                      '<div class="ds-quiz" data-quiz="quizData"></div>')
    # 7. scroll-mt-24 більше не потрібен: це властивість .ds-prose > section
    art, n["scrollmt"] = re.subn(r'\s*class="scroll-mt-24"', '', art)
    return art, n


TAIL = """      <!-- Хвіст уроку. Класів `ds-lesson*` НЕМА СВІДОМО: новий компонент
           означав би новий префікс у реєстрі §7.0, а тут потрібна лише
           розкладка — а вона від теми не залежить і лишається на Tailwind
           (§2.3.2: 14 824 таких вживань не мігрують узагалі). -->
      <div class="mt-12 grid gap-6 max-w-prose">
        <!-- Позначка завершення. У проді це три Tailwind-утиліти в рядку JS
             (module.js:238, BTN_BASE) — рівно П-08. Тут два стани кнопки —
             це два модифікатори компонента. -->
        <div class="ds-card sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p id="completeTitle" class="ds-h4">Модуль позаду?</p>
            <p class="ds-small">Познач його завершеним — позначка збережеться в цьому браузері
              й з'явиться на головній сторінці.</p>
          </div>
          <button id="completeBtn" type="button" class="ds-btn ds-btn--primary">Позначити завершеним</button>
        </div>

        <!-- Попередній / наступний модуль (рендерить js/module.js).
             data-reveal лише тут: це ЄДИНІ вузли уроку, які народжуються
             після асинхронного render() і стоять за згином. Секції прози
             свідомо НЕ анімуються — див. REPORT, «Рух». -->
        <nav id="moduleNav" class="ds-mnav" aria-label="Навігація між модулями" data-reveal-root></nav>
      </div>
"""


def page(title, course, config, crumb, home_label, module_id, body, refs, note):
    return f"""<!DOCTYPE html>
<!-- ============================================================================
     {note}
     ============================================================================ -->
<html lang="uk" data-config="../{config}" data-course="{course}" data-density="lesson" data-lit>

<head>
{head(title, course, config)}
</head>

<body id="top" data-module="{module_id}">

{chrome_top(config, crumb, home_label)}

  <!-- Підложка мобільної шторки змісту (§6.4) -->
  <div id="sidebarOverlay" class="ds-snav__scrim" aria-hidden="true"></div>

  <div class="mx-auto max-w-wide px-5 sm:px-8 lg:grid lg:grid-cols-[280px,1fr] lg:gap-12">

    <aside id="moduleSidebar" class="ds-snav ds-snav--drawer" aria-label="Зміст курсу">
      <div id="sidebarNav" class="lg:pt-10">
        <p class="ds-snav__count">Завантаження програми…</p>
      </div>
    </aside>

    <main id="main" class="min-w-0 py-10 lg:py-12" data-page-in>
{body}
{TAIL}    </main>
  </div>

{chrome_bottom(refs)}

  <!-- §5.3 · motion.js ПЕРШИМ із наших скриптів: усі render() наприкінці
       викликають AIA.motion.bind(root). GSAP на уроки не підключається. -->
  <script src="{BASE}/motion.js"></script>
  <script src="js/lesson.js"></script>
  <!-- §5.3 · mermaid-theme.js ПІСЛЯ бібліотеки й ПЕРЕД init -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
  <script src="{BASE}/mermaid-theme.js"></script>
  <script src="js/mermaid-init.js"></script>
  <script src="js/demo.js"></script>
</body>

</html>
"""


def build(src, out, title, course, config, crumb, home_label, module_id, refs, note):
    mig = subprocess.run(
        [sys.executable, os.path.join(HERE, "tools", "migrate-lesson-body.py"),
         os.path.join(SITE, src)],
        capture_output=True, text=True, check=True)
    art, n = hand_fixes(mig.stdout)
    # квіз-дані живуть поруч зі статтею, а не всередині — дістаємо з оригіналу
    orig = open(os.path.join(SITE, src), encoding="utf-8").read()
    quiz = re.search(r'<script type="application/json" id="quizData">.*?</script>', orig, re.S)
    body = "      " + art.strip() + "\n\n      " + (quiz.group(0) if quiz else "") + "\n"
    open(os.path.join(HERE, out), "w", encoding="utf-8").write(
        page(title, course, config, crumb, home_label, module_id, body, refs, note))
    q = len(re.findall(r'"answer"', quiz.group(0))) if quiz else 0
    print(f"{out:26} ← {src:28} руками: {n}  питань у квізі: {q}")
    sys.stderr.write(mig.stderr)


if __name__ == "__main__":
    build("modules/claude-code-05.html", "t2-lesson.html",
          "Модуль 5 · Інтерфейс і навігація — AI Термінал",
          "terminal", "claude-code.config.json", "Модуль 05", "До програми", "c05",
          REFS_TERMINAL,
          "010 · Б2 · T2 УРОК — головний кадр. Курс «AI Термінал», модуль 05.\n"
          "     Зміст перенесено з живого modules/claude-code-05.html скриптом\n"
          "     tools/build-frames.py — жодного вигаданого тексту.")

    build("modules/module-05.html", "t2-lesson-academy.html",
          "Модуль 5 · Практика промптингу — AI Академія",
          "academy", "config.json", "Модуль 05", "До програми", "m05", "",
          "010 · Б2 · T2 УРОК — другий курс. AI Академія, модуль 05.\n"
          "     Тут живуть .ds-code (8 блоків), 10 окремих <pre> і ДВІ таблиці,\n"
          "     які в проді стоять БЕЗ обгортки скролу (Д18, дефект 005 D-01).")

    build("modules/claude-code-23.html", "t3-exam.html",
          "Модуль 23 · Підсумковий іспит — AI Термінал",
          "terminal", "claude-code.config.json", "Іспит", "До програми", "c23",
          REFS_TERMINAL,
          "010 · Б2 · T3 ІСПИТ. Верстка тотожна T2 (§7.4) — окремого шаблону\n"
          "     немає. Це той самий кадр із квізом на 12 питань: доказ, що\n"
          "     довгий квіз не ламає ритм сторінки.")
