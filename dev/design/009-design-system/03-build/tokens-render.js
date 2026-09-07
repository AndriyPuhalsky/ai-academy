/* ============================================================================
   AIA DESIGN SYSTEM v1 · STYLEGUIDE — РЕНДЕР І ПЕРЕМИКАЧІ
   ----------------------------------------------------------------------------
   Малює драбину, акценти, стани, шкали, картки руху й реєстр L2 з ЖИВИХ
   токенів. Контраст рахується в рантаймі — жодного переписаного числа.
   Кожна функція render() закінчується викликом AIA.motion.bind(): це контракт
   системи, а не ввічливість (див. motion.js, рішення 2).
   ========================================================================== */
(function (global) {
  "use strict";
  var root = document.documentElement;
  var T = function (n) { return getComputedStyle(root).getPropertyValue(n).trim(); };

  /* ---------- контраст у рантаймі ---------- */
  function rgb(str) {
    var d = document.createElement("span");
    d.style.color = str; document.body.appendChild(d);
    var c = getComputedStyle(d).color; d.remove();
    var m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return null;
    var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function lum(c) { return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b); }
  function cr(a, b) { var la = lum(a), lb = lum(b); if (la < lb) { var t = la; la = lb; lb = t; } return (la + 0.05) / (lb + 0.05); }
  function ratioOf(tokenA, tokenB) {
    var a = rgb(T(tokenA)), b = rgb(T(tokenB));
    return (a && b) ? cr(a, b).toFixed(2) : "—";
  }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  /* ---------- 1. Драбина ---------- */
  var LADDER = [
    ["0",    "полотно коду й термінала — темніше за фон"],
    ["100",  "фон сторінки"],
    ["200",  "поверхня: картка, панель, поле"],
    ["300",  "піднята поверхня всередині картки"],
    ["400",  "поверхня hover (у роботі hover робить завіса)"],
    ["500",  "поверхня active"],
    ["600",  "декоративний хайрлайн — контрола не ідентифікує"],
    ["700",  "верхній кант: світло згори"],
    ["800",  "межа, що ідентифікує контрол"],
    ["900",  "найтихіший дозволений текст"],
    ["1000", "третинний текст, підписи"],
    ["1100", "текст прози, вторинний"],
    ["1200", "основний текст — кістка, не білило"]
  ];
  function renderLadder() {
    var host = document.getElementById("ladder-rows"); if (!host) return;
    host.innerHTML = "";
    LADDER.forEach(function (pair) {
      var tok = "--p-n-" + pair[0], val = T(tok);
      var row = el("div", "sg-ladder__row");
      var sw = el("div", "sg-ladder__sw"); sw.style.background = "var(" + tok + ")";
      row.appendChild(sw);
      row.appendChild(el("span", "sg-ladder__k", "n-" + pair[0]));
      row.appendChild(el("span", "sg-ladder__v", val));
      row.appendChild(el("span", "sg-ladder__c", ratioOf(tok, "--c-bg")));
      row.appendChild(el("span", "sg-ladder__r", pair[1]));
      host.appendChild(row);
    });
  }

  /* ---------- 2. Акценти й стани ---------- */
  function swatchCard(title, tokens, notes) {
    var card = el("div", "ds-card");
    card.setAttribute("data-reveal", "");
    card.appendChild(el("p", "ds-eyebrow", title));
    tokens.forEach(function (t) {
      var row = el("div", "sg-row");
      var sw = el("span", null, "");
      sw.style.cssText = "width:var(--s-16);height:var(--s-8);border-radius:var(--r-inner);border:var(--bw) solid var(--c-line);background:var(" + t[0] + ")";
      row.appendChild(sw);
      row.appendChild(el("span", "sg-mono", t[1]));
      row.appendChild(el("span", "sg-mono", T(t[0])));
      row.appendChild(el("span", "sg-mono", t[2] ? t[2]() : ""));
      card.appendChild(row);
    });
    if (notes) card.appendChild(el("p", "ds-small", notes));
    return card;
  }
  function renderAccents() {
    var host = document.getElementById("accent-rows"); if (!host) return;
    host.innerHTML = "";
    host.appendChild(swatchCard("поточний курс · --c-accent-*", [
      ["--c-accent",       "accent",       function () { return "як текст на surface " + ratioOf("--c-accent", "--c-surface"); }],
      ["--c-accent-hover", "accent-hover", function () { return "hover " + ratioOf("--c-accent-hover", "--c-surface"); }],
      ["--c-accent-edge",  "accent-edge",  function () { return "як межа на raised " + ratioOf("--c-accent-edge", "--c-raised"); }],
      ["--c-accent-quiet", "accent-quiet", function () { return "альфа-тінт"; }],
      ["--c-on-accent",    "on-accent",    function () { return "на акценті " + ratioOf("--c-on-accent", "--c-accent"); }]
    ], "Слот курсу переозначує рівно пʼять імен. Шосте — дефект, і його ловить T5."));
    var demo = el("div", "ds-card");
    demo.setAttribute("data-reveal", "");
    demo.appendChild(el("p", "ds-eyebrow", "той самий екран у трьох курсах"));
    ["academy", "architect", "terminal"].forEach(function (c) {
      var box = el("div", null); box.setAttribute("data-course", c);
      box.style.cssText = "display:flex;align-items:center;gap:var(--s-3);padding:var(--s-3) 0";
      var b = el("button", "ds-btn ds-btn--primary ds-btn--sm", "Почати");
      var badge = el("span", "ds-badge ds-badge--ready", "готово"); badge.setAttribute("data-glyph", "●");
      var name = el("span", "sg-mono", c);
      box.appendChild(b); box.appendChild(badge); box.appendChild(name);
      demo.appendChild(box);
    });
    host.appendChild(demo);
  }
  function renderStates() {
    var host = document.getElementById("state-rows"); if (!host) return;
    host.innerHTML = "";
    [["ok", "✓", "готово"], ["warn", "▲", "увага"], ["err", "✕", "помилка"], ["info", "i", "підказка"]].forEach(function (s) {
      var card = el("div", "ds-card");
      card.setAttribute("data-reveal", "");
      var head = el("div", "sg-row");
      var g = el("span", "sg-mono", s[1]); g.style.color = "var(--c-" + s[0] + "-text)";
      head.appendChild(g);
      head.appendChild(el("span", "ds-h4", s[2]));
      card.appendChild(head);
      [["text", "--c-bg"], ["text", "--c-surface"], ["text", "--c-raised"]].forEach(function (p, i) {
        var row = el("div", "sg-row");
        row.appendChild(el("span", "sg-mono", "--c-" + s[0] + "-" + p[0] + " на " + p[1].replace("--c-", "")));
        row.appendChild(el("span", "sg-mono", ratioOf("--c-" + s[0] + "-text", p[1])));
        card.appendChild(row);
      });
      var edge = el("div", "sg-row");
      edge.appendChild(el("span", "sg-mono", "--c-" + s[0] + "-edge як межа на raised"));
      edge.appendChild(el("span", "sg-mono", ratioOf("--c-" + s[0] + "-edge", "--c-raised")));
      card.appendChild(edge);
      host.appendChild(card);
    });
  }

  /* ---------- 3. Шкали ---------- */
  function renderScales() {
    var sp = document.getElementById("space-row");
    if (sp) {
      sp.innerHTML = "";
      ["1","2","3","4","5","6","8","10","12","16","20","24","32"].forEach(function (k) {
        var w = el("div", null); w.style.cssText = "display:flex;flex-direction:column;gap:var(--s-1);align-items:center";
        var bar = el("div", null); bar.style.cssText = "width:var(--s-" + k + ");height:var(--s-6);background:var(--c-accent-quiet);border:var(--bw) solid var(--c-accent-edge);border-radius:var(--r-inner)";
        w.appendChild(bar); w.appendChild(el("span", "sg-mono", "s-" + k)); w.appendChild(el("span", "sg-mono", T("--s-" + k)));
        sp.appendChild(w);
      });
    }
    var rr = document.getElementById("radius-row");
    if (rr) {
      rr.innerHTML = "";
      ["inner","control","card","sheet","pill"].forEach(function (k) {
        var w = el("div", null); w.style.cssText = "display:flex;flex-direction:column;gap:var(--s-1);align-items:center";
        var b = el("div", null); b.style.cssText = "width:var(--s-16);height:var(--s-12);background:var(--c-raised);border:var(--bw) solid var(--c-line-strong);border-radius:var(--r-" + k + ")";
        w.appendChild(b); w.appendChild(el("span", "sg-mono", "r-" + k)); w.appendChild(el("span", "sg-mono", T("--r-" + k)));
        rr.appendChild(w);
      });
    }
    var zs = document.getElementById("z-stack");
    if (zs) {
      zs.innerHTML = "";
      [["below","декоративні підкладки"],["base","потік"],["raised","контент над декором"],
       ["sidebar","пристикований сайдбар — ПІД шапкою"],["header","липка шапка"],
       ["drawer","мобільна шторка — НАД шапкою"],["scrim","підложка діалогу"],
       ["dialog","картка діалогу"],["toast","сповіщення"],["skip","skip-link"]].forEach(function (p, i) {
        var l = el("div", "sg-z__l", "--z-" + p[0] + " = " + T("--z-" + p[0]) + "  ·  " + p[1]);
        l.style.setProperty("--i", i);
        l.style.zIndex = String(i);
        zs.appendChild(l);
      });
    }
    var bp = document.getElementById("bp-row");
    if (bp) {
      bp.innerHTML = "";
      [["sm","640","sm: ×907, а також 420"],["md","768","md: ×124, а також 700 / 860 / 900"],
       ["lg","1024","lg: ×434"],["xl","1440","нове, під контейнер 1408; заміняє 1600"],
       ["vh-short","700","низький екран; заміняє також 820"]].forEach(function (p) {
        var t = el("span", "ds-tag", "--bp-" + p[0] + " = " + T("--bp-" + p[0]) + " · " + p[2]);
        bp.appendChild(t);
      });
    }
  }

  /* ---------- 4. Картки руху ---------- */
  var EFFECTS = [
    ["M1", "page-in",      "завантаження документа", "--p-dur-page-in", "сторінка прийшла, а не блимнула"],
    ["M2", "reveal",       "вхід у вʼюпорт, один раз", "--p-dur-reveal", "контент чекав на мене"],
    ["M3", "stagger",      "серія M2, cap 8",        "--p-stag-list",   "список читається, а не сиплеться"],
    ["M4", "hover",        "вказівник",              "--p-dur-hover",   "елемент живий і чує мене"],
    ["M5", "press",        ":active / тап",          "--p-dur-tap",     "натиснулось фізично"],
    ["M6", "focus",        ":focus-visible",         null,              "я не загубився з клавіатури"],
    ["M7", "state-change", "зміна даних або стану",  "--p-dur-state",   "щось змінилось саме тут"],
    ["M8", "count",        "число входить у вʼюпорт","--p-dur-count",   "цифра справжня, її порахували"],
    ["M9", "scroll-scrub", "прогрес скролу",         "--p-scrub",       "сторінка слухається моєї руки"],
    ["M10","typing",       "термінал у вʼюпорті",    "--p-term-speed-cps","за цим сидить людина"],
    ["L1", "loop",         "завжди",                 "--p-dur-loop-pulse","тут відбувається зараз"]
  ];
  function renderMotion() {
    var host = document.getElementById("motion-cards"); if (!host) return;
    host.innerHTML = "";
    EFFECTS.forEach(function (e) {
      var card = el("div", "ds-card");
      card.setAttribute("data-reveal", "");
      card.appendChild(el("p", "ds-eyebrow", e[0] + " · " + e[1]));
      card.appendChild(el("p", "ds-h4", e[4]));
      var meta = el("p", "sg-mono", e[2] + (e[3] ? "  ·  " + e[3] + " = " + T(e[3]) : "  ·  0 (миттєво)"));
      card.appendChild(meta);
      var stage = el("div", null); stage.style.cssText = "margin:var(--s-3) 0;min-height:var(--s-12);display:flex;align-items:center;gap:var(--s-3)";
      card.appendChild(stage);
      var btn = el("button", "ds-btn ds-btn--secondary ds-btn--sm", "Програти ще раз");
      btn.setAttribute("data-play", e[1]);
      card.appendChild(btn);
      host.appendChild(card);

      if (e[1] === "count") {
        var n = el("span", "ds-num ds-h2", "00000"); n.setAttribute("data-count-to", "12345"); n.id = "countDemo";
        stage.appendChild(n);
      } else if (e[1] === "loop") {
        var dot = el("span", null); dot.className = "sg-pulse";
        stage.appendChild(dot); stage.appendChild(el("span", "ds-small", "єдиний цикл на сторінці"));
      } else if (e[1] === "state-change") {
        var wrap = el("div", "sg-collapse"); wrap.id = "collapseDemo";
        var inner = el("div", null, "Розкриття через grid-template-rows: 0fr → 1fr. height не анімуємо ніколи.");
        inner.className = "ds-small"; wrap.appendChild(inner);
        stage.appendChild(wrap);
      } else if (e[1] === "typing") {
        stage.appendChild(el("span", "ds-small", "демо — у блоці термінала вище"));
      } else if (e[1] === "focus") {
        var fb = el("button", "ds-btn ds-btn--secondary ds-btn--sm", "Дай мені фокус (Tab)");
        stage.appendChild(fb);
      } else {
        var box = el("div", "ds-card"); box.style.cssText = "padding:var(--s-3);background:var(--c-raised)";
        box.appendChild(el("span", "ds-small", "демо-блок"));
        box.setAttribute("data-demo", e[1]);
        stage.appendChild(box);
      }
    });
  }

  /* ---------- 5. Реєстр ---------- */
  var PREFIXES = "btn fld card badge pill prog hdr nav ftr dlg sheet snav mnav note quiz code term tbl diag skel toast skip avatar tag".split(" ");
  var L2 = [
    ["--c-bg","поверхня"],["--c-surface","поверхня"],["--c-raised","поверхня"],["--c-sunken","поверхня"],
    ["--c-desk","поверхня"],["--c-overlay","поверхня"],["--c-veil-hover","поверхня"],["--c-veil-press","поверхня"],
    ["--c-text","текст"],["--c-text-2","текст"],["--c-text-3","текст"],["--c-text-disabled","текст"],
    ["--c-prose","текст"],["--c-on-accent","текст"],["--c-on-paper","текст"],
    ["--c-line","межа"],["--c-line-lit","межа"],["--c-line-strong","межа"],["--c-line-accent","межа"],["--c-focus","межа"],
    ["--c-accent","акцент"],["--c-accent-hover","акцент"],["--c-accent-quiet","акцент"],["--c-accent-edge","акцент"],
    ["--c-ok-text","стан"],["--c-warn-text","стан"],["--c-err-text","стан"],["--c-info-text","стан"],
    ["--f-display","шрифт"],["--f-sans","шрифт"],["--f-mono","шрифт"],
    ["--fs-h1","кегль"],["--fs-h2","кегль"],["--fs-h3","кегль"],["--fs-h4","кегль"],
    ["--fs-body","кегль"],["--fs-ui","кегль"],["--fs-code","кегль"],
    ["--s-4","відступ"],["--s-section","відступ"],["--r-control","радіус"],["--r-card","радіус"],
    ["--sh-desk","тінь"],["--z-header","шар"],["--z-sidebar","шар"],["--z-drawer","шар"],
    ["--w-prose","ширина"],["--w-wide","ширина"],["--bp-md","поріг"],
    ["--motion","рух"],["--dur-u","рух"],["--move-u","рух"],["--dur-enter","рух"],["--dur-reveal","рух"],
    ["--move-reveal","рух"],["--scale-press","рух"],["--e-out","рух"],["--e-breath","рух"],["--stag-list","рух"]
  ];
  function renderRegistry() {
    var pr = document.getElementById("prefix-row");
    if (pr) { pr.innerHTML = ""; PREFIXES.forEach(function (p) { pr.appendChild(el("span", "ds-tag", p)); }); }
    var tb = document.querySelector("#l2-table tbody");
    if (tb) {
      tb.innerHTML = "";
      L2.forEach(function (p) {
        var tr = el("tr");
        tr.appendChild(el("td", null, p[0]));
        tr.appendChild(el("td", null, T(p[0]) || "—"));
        tr.appendChild(el("td", null, p[1]));
        tb.appendChild(tr);
      });
    }
  }

  /* ---------- 6. Перемикачі ---------- */
  function press(group, val) {
    document.querySelectorAll('[data-set="' + group + '"]').forEach(function (b) {
      var on = b.getAttribute("data-v") === val;
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.className = "ds-btn ds-btn--sm " + (on ? "ds-btn--secondary" : "ds-btn--ghost");
    });
  }
  function wire() {
    document.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-set]");
      if (b) {
        var g = b.getAttribute("data-set"), v = b.getAttribute("data-v");
        root.setAttribute("data-" + g, v);
        press(g, v);
        renderAll();
        return;
      }
      var p = ev.target.closest("[data-play]");
      if (p) { play(p.getAttribute("data-play"), p); return; }
      if (ev.target.closest("#openDlg")) { openDlg(); return; }
      if (ev.target.closest("[data-close]")) { closeDlg(); return; }
    });
    var rm = document.getElementById("rmToggle");
    rm.addEventListener("click", function () {
      var on = root.classList.toggle("rm");
      rm.setAttribute("aria-pressed", on ? "true" : "false");
      rm.textContent = on ? "увімкнено" : "вимкнено";
      rm.className = "ds-btn ds-btn--sm " + (on ? "ds-btn--secondary" : "ds-btn--ghost");
    });
    var lit = document.getElementById("litToggle");
    lit.addEventListener("click", function () {
      var on = !root.hasAttribute("data-lit");
      if (on) root.setAttribute("data-lit", ""); else root.removeAttribute("data-lit");
      lit.setAttribute("aria-pressed", on ? "true" : "false");
      lit.textContent = on ? "увімкнено" : "вимкнено";
      lit.className = "ds-btn ds-btn--sm " + (on ? "ds-btn--secondary" : "ds-btn--ghost");
    });
  }

  function play(name, btn) {
    var M = global.AIA && global.AIA.motion;
    if (!M) return;
    if (name === "stagger") { renderStagger(); return; }
    if (name === "count") { M.play.count(document.getElementById("countDemo")); return; }
    if (name === "state-change") { M.play["state-change"](document.getElementById("collapseDemo")); return; }
    if (name === "typing") { M.play.typing(document.getElementById("tm1")); return; }
    if (name === "page-in") { M.play["page-in"](document.getElementById("main")); return; }
    if (name === "reveal") { M.play.reveal(btn.closest(".sg-sec__body") || document); return; }
    /* hover / press / focus / loop / scrub — CSS або постійні: показуємо підказкою */
    var live = document.getElementById("ariaLive");
    if (live) live.textContent = "Ефект " + name + " живе в CSS — наведи, натисни або перейди Tab-ом.";
  }

  function renderStagger() {
    var host = document.getElementById("stag-host"); if (!host) return;
    host.innerHTML = "";
    for (var i = 0; i < 12; i++) {
      var c = el("div", "ds-card"); c.style.cssText = "padding:var(--s-3);min-width:var(--s-20)";
      c.setAttribute("data-reveal", "");
      c.appendChild(el("span", "sg-mono", String(i + 1)));
      host.appendChild(c);
    }
    /* КОНТРАКТ: bind() у кінці кожного render() */
    if (global.AIA && global.AIA.motion) global.AIA.motion.bind(host);
  }

  var lastFocus = null;
  function openDlg() {
    var d = document.getElementById("dlg");
    lastFocus = document.activeElement;
    d.hidden = false;
    requestAnimationFrame(function () { d.setAttribute("data-open", "true"); });
    var f = d.querySelector("input, button"); if (f) f.focus();
    document.addEventListener("keydown", trap);
  }
  function closeDlg() {
    var d = document.getElementById("dlg");
    d.setAttribute("data-open", "false");
    document.removeEventListener("keydown", trap);
    setTimeout(function () { d.hidden = true; if (lastFocus) lastFocus.focus(); },
      parseFloat(T("--dur-exit")) * (T("--dur-exit").indexOf("ms") > -1 ? 1 : 1000) || 0);
  }
  function trap(e) {
    if (e.key === "Escape") { closeDlg(); return; }
    if (e.key !== "Tab") return;
    var d = document.getElementById("dlg");
    var f = d.querySelectorAll("a[href], button, input, textarea, [tabindex]:not([tabindex='-1'])");
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function renderAll() {
    renderLadder(); renderAccents(); renderStates(); renderScales(); renderMotion(); renderRegistry();
    /* КОНТРАКТ: bind() у кінці КОЖНОГО асинхронного render(). Без цього
       вузли, створені тут, лишились би невидимими — дефект 003 D-01 / 005 Б-01. */
    if (global.AIA && global.AIA.motion) global.AIA.motion.bind(document);
  }

  function start() {
    renderAll(); wire(); renderStagger();
    var bar = document.getElementById("scrubBar");
    if (bar && global.AIA && global.AIA.motion) global.AIA.motion.scrub1(document.getElementById("motion"), bar);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})(window);
