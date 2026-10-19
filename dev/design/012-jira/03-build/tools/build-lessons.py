#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
012 · Генератор макетів уроку з ЖИВИХ modules/jira-01.html і jira-03.html.

Навіщо саме так. §15.2 вимагає відкривати макет на реальних сторінках
«дослівно», із підключеним живим css/components.css — щоб зіткнення
специфічностей було справжнім, а не намальованим (прийом _base/site-inherited
із 005). Переписувати урок руками означало б отримати зручний, але неправдивий
результат.

ЩО СКРИПТ МІНЯЄ — І БІЛЬШЕ НІЧОГО:
  1. відносні шляхи `../` → `../../../../` (макет лежить на чотири рівні
     глибше, ніж modules/);
  2. два <link> дельти задачі 012 після components.css;
  3. підмостки макета в кінці <head>: кеш-бастер і зняття шлагбаума #aiaGate.

<body> не змінюється НІ НА БАЙТ — скрипт це перевіряє й друкує md5 тіла
до і після (К-29).

Запуск із 03-build/:  python3 tools/build-lessons.py
"""
import os, re, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.dirname(HERE)
REPO = os.path.abspath(os.path.join(BUILD, "..", "..", "..", ".."))

HARNESS = """
  <!-- ДЕЛЬТА ЗАДАЧІ 012 -->
  <link rel="stylesheet" href="tokens-jira.css" />
  <link rel="stylesheet" href="win.css" />

  <script>
  /* ПІДМОСТКИ МАКЕТА — у прод не йдуть, у вихідному уроці їх немає.
     (1) Кеш <link> не слухається Cache-Control: no-store — перевірено CSSOM-ом
         на цій же задачі: сторінка приходила свіжою, а CSS брався з памʼяті,
         і вже виправлені дефекти «продовжували падати».
     (2) ⚠ ВОСЬМА ПАСТКА ЗАМІРУ ПРОЄКТУ. js/module.js ставить `hidden` на ВСІ
         діти <main> для гостя — і робить це ПІСЛЯ відповіді Supabase, тобто
         пізніше за подію load. Без цього зняття всі ширини вікон виходять
         НУЛЬОВІ, і будь-який замір дає хибний результат. */
  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll('link[rel=stylesheet]'), function (l) {
      var h = l.getAttribute("href");
      if (h.indexOf("fonts.") < 0) l.setAttribute("href", h.split("?")[0] + "?v=" + Date.now());
    });
    var open = function () {
      var g = document.getElementById("aiaGate");
      if (g) g.remove();
      document.documentElement.removeAttribute("data-aia-gate");
      var m = document.getElementById("main");
      if (m) Array.prototype.forEach.call(m.children, function (c) { c.hidden = false; });
    };
    open();
    setInterval(open, 400);
  });
  </script>
"""


def body_norm(src):
    """Тіло з ПОВЕРНЕНИМИ назад шляхами. Саме цей зліпок мусить збігтись:
    переписування шляхів неминуче (макет лежить глибше), а ось будь-яка зміна
    розмітки чи тексту — це вже порушення К-29."""
    i = src.find("<body")
    b = src[i:]
    b = b.replace('"../../../../modules/jira-', '"jira-')
    b = b.replace('"../../../../', '"../')
    return hashlib.md5(b.encode("utf-8")).hexdigest()


def convert(name):
    src_path = os.path.join(REPO, "modules", name)
    with open(src_path, encoding="utf-8") as f:
        src = f.read()
    before = body_norm(src)

    out = src
    # 1. шляхи: тільки в атрибутах, тільки на початку значення
    out = re.sub(r'(\b(?:href|src|data-config)=")\.\./', r'\g<1>../../../../', out)
    # 2. сусідні уроки лежать поряд у modules/, а макет — ні
    out = re.sub(r'(\b(?:href|src)=")(jira-\d\d\.html)', r'\g<1>../../../../modules/\2', out)
    # 3. дельта + підмостки — перед закриттям <head>
    out = out.replace("</head>", HARNESS + "</head>", 1)

    after = body_norm(out)
    dst = os.path.join(BUILD, "lesson-" + name.replace("jira-", ""))
    with open(dst, "w", encoding="utf-8") as f:
        f.write(out)
    return os.path.basename(dst), before, after


if __name__ == "__main__":
    for n in ("jira-01.html", "jira-03.html"):
        name, a, b = convert(n)
        print("%-16s  <body> (шляхи нормалізовано) %s → %s  %s" % (name, a[:10], b[:10], "БАЙТ У БАЙТ ✓" if a == b else "ЗМІНЕНО ✗"))
