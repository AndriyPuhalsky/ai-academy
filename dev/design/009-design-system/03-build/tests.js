/* ============================================================================
   AIA DESIGN SYSTEM v1 · ВБУДОВАНІ ТЕСТИ T1–T6
   ----------------------------------------------------------------------------
   Styleguide — не галерея, а інструмент і доказ. Тести друкують PASS/FAIL
   текстом на самій сторінці.

   Чому обхід у браузері, а не таблиця в markdown: у 001 і 005 таблиця
   контрасту в документі розходилася з тим, що реально малює браузер.
   Читання живих getComputedStyle чесніше за читання CSS.
   ========================================================================== */
(function (global) {
  "use strict";

  /* ---------- WCAG ---------- */
  function parseRGB(s) {
    var m = /rgba?\(([^)]+)\)/.exec(s);
    if (!m) return null;
    var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function lum(c) { return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b); }
  function ratio(a, b) { var la = lum(a), lb = lum(b); if (la < lb) { var t = la; la = lb; lb = t; } return (la + 0.05) / (lb + 0.05); }
  function over(fg, bg) {   /* напівпрозорий передній план поверх фону */
    if (fg.a >= 1) return fg;
    return { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 };
  }
  function effectiveBg(el) {
    var n = el;
    while (n && n !== document.documentElement.parentNode) {
      var c = parseRGB(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) {
        if (c.a >= 1) return c;
        var under = n.parentElement ? effectiveBg(n.parentElement) : { r: 0, g: 0, b: 0, a: 1 };
        return over(c, under);
      }
      n = n.parentElement;
    }
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  function selector(el) {
    var s = el.tagName.toLowerCase();
    if (el.id) return s + "#" + el.id;
    if (el.className && typeof el.className === "string") s += "." + el.className.trim().split(/\s+/).slice(0, 2).join(".");
    return s;
  }

  var out = {};
  function print(id, verdict, text) {
    var box = document.getElementById(id);
    if (!box) return;
    var v = box.querySelector("[data-verdict]");
    var o = box.querySelector("[data-out]");
    if (v) { v.textContent = verdict; v.className = "sg-verdict sg-verdict--" + (verdict === "PASS" ? "pass" : verdict === "FAIL" ? "fail" : "wait"); }
    if (o) o.textContent = text;
    out[id] = verdict;
  }

  /* ==========================================================================
     T1 · КОНТРАСТ. Обхід усіх текстових вузлів, реальні color і фон.
     Поріг 4.5 для тексту, 3.0 для великого (≥24px, або ≥18.66px напівжирного).
     ========================================================================== */
  function T1() {
    var bad = [], checked = 0;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        return n.nodeValue.trim().length > 1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var seen = new Set();
    while (walker.nextNode()) {
      var el = walker.currentNode.parentElement;
      if (!el || seen.has(el)) continue;
      if (el.closest("[data-skip-contrast]")) continue;
      var cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) === 0) continue;
      seen.add(el);
      var fg = parseRGB(cs.color); if (!fg) continue;
      var bg = effectiveBg(el);
      var r = ratio(over(fg, bg), bg);
      var size = parseFloat(cs.fontSize), w = parseInt(cs.fontWeight, 10) || 400;
      var large = size >= 24 || (size >= 18.66 && w >= 700);
      var need = large ? 3 : 4.5;
      checked++;
      if (r < need - 0.005) bad.push(selector(el) + "  " + r.toFixed(2) + " < " + need + "  «" + walker.currentNode.nodeValue.trim().slice(0, 34) + "»");
    }
    print("t1", bad.length ? "FAIL" : "PASS",
      "перевірено текстових вузлів: " + checked + "\nпорушень: " + bad.length +
      (bad.length ? "\n\n" + bad.slice(0, 40).join("\n") : "\n\nусі тексти тримають поріг на своїй реальній поверхні"));
  }

  /* ==========================================================================
     T2 · КОПІЮВАННЯ ТЕРМІНАЛА. Справжнє виділення, а не textContent проти
     textContent: перевіряємо, що selection.toString() побайтово дорівнює
     видимому тексту в усіх станах.
     ========================================================================== */
  function T2() {
    var blocks = document.querySelectorAll(".term .term__body");
    if (!blocks.length) { print("t2", "FAIL", "не знайдено жодного .term__body"); return; }
    var bad = [], sel = global.getSelection(), saved = sel.rangeCount ? sel.getRangeAt(0) : null;
    Array.prototype.forEach.call(blocks, function (pre) {
      var range = document.createRange();
      range.selectNodeContents(pre);
      sel.removeAllRanges(); sel.addRange(range);
      var got = sel.toString(), want = pre.textContent;
      if (got !== want) {
        var i = 0; while (i < Math.min(got.length, want.length) && got[i] === want[i]) i++;
        bad.push((pre.closest(".term").id || "term") + ": розбіжність на символі " + i +
                 " (виділено " + got.length + ", у DOM " + want.length + ")");
      }
    });
    sel.removeAllRanges(); if (saved) sel.addRange(saved);
    print("t2", bad.length ? "FAIL" : "PASS",
      "станів термінала перевірено: " + blocks.length + "\n" +
      (bad.length ? bad.join("\n") : "буфер збігається з видимим текстом байт у байт у всіх станах"));
  }

  /* ==========================================================================
     T3 · СТАН ПІСЛЯ render(). Найчастіший дефект конвеєра (003 D-01, 005 Б-01):
     вузли, створені після асинхронного render(), лишались з opacity:0 назавжди.
     ⚠ Headless цього НЕ бачить: там rAF викликається рівно один раз і
     IntersectionObserver не спрацьовує взагалі. Перевіряти у ВИДИМОМУ вікні.
     ========================================================================== */
  function T3() {
    var host = document.getElementById("t3-host");
    if (!host) { print("t3", "FAIL", "немає контейнера"); return; }
    host.innerHTML = "";
    print("t3", "…", "додаю 5 карток через 1 с…");
    setTimeout(function () {
      /* Прокручуємо контейнер у вʼюпорт ДО рендера — щоб міряти саме ту
         гарантію, яка має значення: вузол, створений асинхронним render()
         на видимому екрані, мусить бути видимим НЕГАЙНО, без жодного
         асинхронного колбека. */
      host.scrollIntoView({ block: "center", behavior: "auto" });
      for (var i = 1; i <= 5; i++) {
        var c = document.createElement("div");
        c.className = "ds-card";
        c.setAttribute("data-reveal", "");
        c.innerHTML = '<h4 class="ds-h4">Картка ' + i + ' після render()</h4>' +
                      '<p class="ds-small">Створена через секунду. Її має бути видно.</p>';
        host.appendChild(c);
      }
      /* КОНТРАКТ: bind() викликається в кінці кожного асинхронного render(). */
      var armed = global.AIA && global.AIA.motion ? global.AIA.motion.bind(host) : -1;

      setTimeout(function () {
        var cards = host.querySelectorAll(".ds-card"), bad = [], inView = 0, stuck = 0;
        var vh = global.innerHeight;
        Array.prototype.forEach.call(cards, function (c, i) {
          var r = c.getBoundingClientRect();
          var visible = r.top < vh && r.bottom > 0;
          var op = parseFloat(getComputedStyle(c).opacity);
          var st = c.getAttribute("data-reveal");
          if (visible) {
            inView++;
            if (op < 0.99) bad.push("картка " + (i + 1) + " У ВʼЮПОРТІ, але opacity " + op.toFixed(2) + " (data-reveal=" + st + ")");
          } else if (st === "armed") stuck++;
        });
        (global.AIA && global.AIA.motion ? global.AIA.motion.ioWorks() : Promise.resolve(null)).then(function (ioOk) {
          var env = ioOk === null ? "" :
            "\n\nсередовище: доставка IntersectionObserver — " + (ioOk ? "працює" : "ВІДСУТНЯ") +
            (ioOk ? "" : "\n(Chrome не доставляє IO-колбеки вкладці, яка не рендериться. Саме тому\nсистема не покладається на IO для того, що вже у вʼюпорті — інакше цей\nмакет був би зараз порожнім.)");
          print("t3", bad.length ? "FAIL" : "PASS",
            "нових вузлів: " + cards.length + " · з них у вʼюпорті: " + inView +
            " · озброєно (за згином): " + armed + " · застрягло за згином: " + stuck + "\n" +
            (bad.length
              ? bad.join("\n") + "\n\n⚠ вузол у вʼюпорті лишився невидимим — це саме той дефект,\nщо двічі пройшов крізь усі перевірки конвеєра (003 D-01, 005 Б-01)."
              : "усі вузли у вʼюпорті видимі (opacity 1) НЕГАЙНО, без асинхронного колбека.\nСтан спокою [data-reveal] — ВИДИМИЙ; ховається лише те, що за згином,\nі лише після приєднання спостерігача. JS не завантажився чи впав —\nкористувач бачить увесь контент.") + env);
        });
      }, 900);
    }, 1000);
  }

  /* ==========================================================================
     T4 · REDUCED-MOTION. Читає обчислені токени при --motion: 0 і доводить,
     що немає жодної тривалості > 1 мс і жодного зсуву ≠ 0.
     Плюс тест самого МЕХАНІЗМУ: --dur-zzz, доданий у рантаймі й НЕ згаданий
     у блоці reduce, теж має погаснути.
     ========================================================================== */
  function T4() {
    var root = document.documentElement;
    var had = root.classList.contains("rm");
    var DUR = ["tap","exit","hover","enter","state","reveal","sheet","page-in","count","shimmer","loop-pulse"];
    var MOV = ["micro","exit","card","reveal"];
    function ms(v) { v = v.trim(); if (!v) return NaN; return v.indexOf("ms") > -1 ? parseFloat(v) : parseFloat(v) * 1000; }
    /* Новий токен, якого немає в блоці reduce — саме він доводить МЕХАНІЗМ.
       ⚠ Міряти його треба на РЕАЛЬНОМУ елементі, а не парсингом самого токена:
       незареєстрований через @property токен getComputedStyle віддає сирим
       рядком calc(...), і parseFloat від нього дає NaN. Це і є та пастка, через
       яку рух мовчки лишається живим при reduce; тут вона працює на нас —
       браузер усе одно обчислює використане значення transition-duration. */
    root.style.setProperty("--dur-zzz", "calc(999 * var(--dur-u))");
    root.classList.add("rm");
    var probe = document.createElement("div");
    probe.style.cssText = "position:absolute;left:-99999px;transition-duration:var(--dur-zzz)";
    document.body.appendChild(probe);
    var zzz = ms(getComputedStyle(probe).transitionDuration);
    probe.remove();
    var cs = getComputedStyle(root), bad = [], lines = [];
    if (isNaN(zzz)) bad.push("--dur-zzz: браузер не обчислив transition-duration");
    else if (zzz > 1) bad.push("--dur-zzz = " + zzz + "мс > 1мс");
    else lines.push("--dur-zzz (новий, поза блоком reduce) → " + zzz + "мс на живому елементі");
    DUR.forEach(function (k) {
      var raw = cs.getPropertyValue("--dur-" + k), v = ms(raw);
      if (isNaN(v)) bad.push("--dur-" + k + ": не обчислилось («" + raw.trim() + "») — токен НЕ зареєстрований через @property");
      else if (v > 1) bad.push("--dur-" + k + " = " + v + "мс > 1мс");
      else lines.push("--dur-" + k + " → " + raw.trim());
    });
    MOV.forEach(function (k) {
      var raw = cs.getPropertyValue("--move-" + k), v = parseFloat(raw);
      if (isNaN(v)) bad.push("--move-" + k + ": не обчислилось");
      else if (v !== 0) bad.push("--move-" + k + " = " + raw.trim() + " ≠ 0");
      else lines.push("--move-" + k + " → " + raw.trim());
    });
    ["press","pop"].forEach(function (k) {
      var v = parseFloat(cs.getPropertyValue("--scale-" + k));
      if (v !== 1) bad.push("--scale-" + k + " = " + v + " ≠ 1"); else lines.push("--scale-" + k + " → 1");
    });
    var loop = cs.getPropertyValue("--loop-state").trim();
    if (loop !== "paused") bad.push("--loop-state = " + loop + " ≠ paused"); else lines.push("--loop-state → paused");
    if (global.AIA && global.AIA.motion && global.AIA.motion.on()) bad.push("AIA.motion.on() === true при --motion: 0");
    else lines.push("AIA.motion.on() → false (таймлайни не створюються взагалі)");

    if (!had) root.classList.remove("rm");
    root.style.removeProperty("--dur-zzz");
    print("t4", bad.length ? "FAIL" : "PASS",
      (bad.length ? bad.join("\n") + "\n\n" : "") + lines.join("\n") +
      "\n\n--dur-zzz доданий у рантаймі й НЕ згаданий у блоці reduce — і все одно погас.\nБлок @media містить рівно два рядки.");
  }

  /* ==========================================================================
     T5 · ТОКЕНИ-ПОРУШНИКИ. Скан завантажених CSS через CSSOM.
     Шукає: хекси й rgba()-літерали поза tokens.css; числовий z-index;
     літерал у @media, якого немає в переліку порогів; шляхи у верхньому регістрі;
     шосте імʼя в блоці курсу; безкінечну анімацію без animation-play-state.
     ========================================================================== */
  function T5() {
    var HEX = /#[0-9a-f]{3,8}\b/gi, RGBA = /\brgba?\(/gi;
    var BP = ["640","768","1024","1440","700"];
    var ALLOWED_COURSE = ["--c-accent","--c-accent-hover","--c-accent-quiet","--c-accent-edge","--c-on-accent"];
    var probs = [], notes = [], stats = { sheets: 0, rules: 0 };

    Array.prototype.forEach.call(document.styleSheets, function (sheet) {
      var href = sheet.href || "(inline)";
      var name = href.split("/").pop();
      var isTokens = /tokens\.css/.test(name);
      var rules;
      try { rules = sheet.cssRules; } catch (e) { notes.push(name + ": CSSOM недоступний (CORS) — чужа таблиця, сканувати нічим"); return; }
      if (!rules) return;
      stats.sheets++;
      (function scan(list, media) {
        Array.prototype.forEach.call(list, function (rule) {
          if (rule.type === CSSRule.MEDIA_RULE) {
            var mt = rule.conditionText || rule.media.mediaText;
            (mt.match(/\d+(\.\d+)?/g) || []).forEach(function (n) {
              if (BP.indexOf(n) === -1 && n !== "0") probs.push(name + " @media(" + mt + "): поріг " + n + " не з переліку " + BP.join("/"));
            });
            scan(rule.cssRules, mt); return;
          }
          if (rule.type === CSSRule.SUPPORTS_RULE) { scan(rule.cssRules, media); return; }
          if (!rule.style) return;
          stats.rules++;
          var text = rule.cssText;
          if (!isTokens) {
            var h = text.match(HEX);
            if (h) probs.push(name + " " + (rule.selectorText || "") + ": хекс " + h.join(", "));
            if (RGBA.test(text)) probs.push(name + " " + (rule.selectorText || "") + ": літерал rgba()");
            RGBA.lastIndex = 0;
          }
          var z = rule.style.getPropertyValue("z-index");
          if (z && z.indexOf("var(") === -1 && z !== "auto" && z !== "" && ["0","1","2"].indexOf(z.trim()) === -1)
            probs.push(name + " " + rule.selectorText + ": числовий z-index " + z + " поза --z-*");
          if (/infinite/.test(text) && !/animation-play-state/.test(text) && !/--loop-state/.test(text))
            probs.push(name + " " + rule.selectorText + ": infinite без animation-play-state: var(--loop-state)");
          if (rule.selectorText && /\[data-course=/.test(rule.selectorText)) {
            for (var i = 0; i < rule.style.length; i++) {
              if (ALLOWED_COURSE.indexOf(rule.style[i]) === -1)
                probs.push("слот курсу " + rule.selectorText + ": шосте імʼя " + rule.style[i]);
            }
          }
        });
      })(rules, "");
    });
    /* Регістр шляхів перевіряємо ЛИШЕ для власних (відносних) посилань: чужі
       CDN мають право на ScrollTrigger.min.js, і це не наша конвенція.
       Правило існує тому, що macOS не чутлива до регістру, а Cloudflare чутливий —
       один раз це вже поклало прод (папка CSS/ проти посилань css/). */
    Array.prototype.forEach.call(document.querySelectorAll("link[href], script[src], img[src]"), function (n) {
      var u = n.getAttribute("href") || n.getAttribute("src");
      if (!u || /^(https?:)?\/\//.test(u) || /^data:/.test(u)) return;
      if (/[A-Z]/.test(u)) probs.push("власний шлях у верхньому регістрі: " + u);
    });
    print("t5", probs.length ? "FAIL" : "PASS",
      "таблиць стилів проскановано: " + stats.sheets + ", правил: " + stats.rules +
      "\nпорушень: " + probs.length + (notes.length ? "\nпримітки: " + notes.join("; ") : "") +
      (probs.length ? "\n\n" + probs.slice(0, 40).join("\n")
      : "\n\nхексів і rgba() поза tokens.css немає · числового z-index немає ·\nусі пороги @media з переліку · слот курсу тримає рівно пʼять імен ·\nкожна infinite має animation-play-state · шляхи в нижньому регістрі"));
  }

  /* ==========================================================================
     T6 · ГОРИЗОНТАЛЬНИЙ СКРОЛ на семи ширинах через iframe.
     Обхідний прийом: десктопний Chrome не робить вікно вужче ~500px, тому
     міряти треба в iframe, а не зміною розміру вікна.
     ========================================================================== */
  function T6() {
    var host = document.getElementById("t6-host");
    if (!host) { print("t6", "FAIL", "немає контейнера"); return; }
    var W = [320, 360, 390, 640, 768, 1024, 1440];
    var lines = [], bad = [], left = W.length;
    print("t6", "…", "міряю сім ширин…");
    host.innerHTML = "";
    W.forEach(function (w) {
      var f = document.createElement("iframe");
      f.width = w; f.height = 600; f.style.cssText = "position:absolute;left:-99999px;top:0;border:0";
      /* Кеш-бастер обовʼязковий: без нього iframe бере попередню версію CSS
         з кешу, і тест міряє не той файл, який лежить на диску. */
      f.src = location.pathname + "?notest=1&_=" + Date.now();
      f.onload = function () {
        var d = f.contentDocument.documentElement;
        var over = d.scrollWidth - d.clientWidth;
        var widest = "";
        if (over > 0) {
          var max = 0;
          Array.prototype.forEach.call(f.contentDocument.querySelectorAll("*"), function (el) {
            var r = el.getBoundingClientRect();
            if (r.right > max) { max = r.right; widest = el.tagName.toLowerCase() + "." + String(el.className).trim().split(/\s+/)[0]; }
          });
          bad.push(w + "px: +" + over + "px (найширший: " + widest + ")");
        }
        lines.push(w + "px → scrollWidth " + d.scrollWidth + " / clientWidth " + d.clientWidth + (over > 0 ? "  ⚠ +" + over : "  ok"));
        if (--left === 0) {
          lines.sort(function (a, b) { return parseInt(a) - parseInt(b); });
          print("t6", bad.length ? "FAIL" : "PASS", lines.join("\n") + (bad.length ? "\n\n" + bad.join("\n") : "\n\nнуль горизонтального скролу на всіх семи ширинах,\nвключно з таблицями, .term і довгим інлайновим code"));
          host.innerHTML = "";
        }
      };
      host.appendChild(f);
    });
  }

  function runAll() {
    T1(); T2(); T3(); T4(); T5(); T6();
  }
  global.AIA = global.AIA || {};
  global.AIA.tests = { runAll: runAll, T1: T1, T2: T2, T3: T3, T4: T4, T5: T5, T6: T6, results: out };

  if (location.search.indexOf("notest=1") === -1) {
    if (document.readyState === "complete") setTimeout(runAll, 200);
    else global.addEventListener("load", function () { setTimeout(runAll, 200); });
  }
})(window);
