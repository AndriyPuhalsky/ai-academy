/* ============================================================================
   ⚠ ТІЛЬКИ МАКЕТ. У КОД САЙТУ ЦЕЙ ФАЙЛ НЕ ЇДЕ.
   ----------------------------------------------------------------------------
   Панель перемикачів макета: акцент курсу · пресет руху · щільність ·
   reduced-motion. Показує головне, заради чого існує 010: один скелет,
   три акценти, і слот працює живцем, а не на скріншотах.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ------------------------------------------------------------------------
     СТАН ІЗ URL — щоб валідатор міг перевіряти детерміновано, а не кліками.
     ?course=academy|architect|terminal · ?motion=calm|standard|bold
     ?density=landing|lesson · ?rm=1 · ?lit=0
     ⚠ Виконується СИНХРОННО, ще до DOMContentLoaded: mockup.js стоїть у кінці
     <body> після landing.js / cc-render.js, а ті чекають на DOMContentLoaded.
     Тому рух уже бачить правильний стан, а не отримує його після старту —
     інакше перевірка reduced-motion міряє гонку, а не систему. */
  (function () {
    var q = new URLSearchParams(location.search);
    if (q.get("course")) root.setAttribute("data-course", q.get("course"));
    if (q.get("motion")) root.setAttribute("data-motion", q.get("motion"));
    if (q.get("density")) root.setAttribute("data-density", q.get("density"));
    if (q.get("rm") === "1") root.classList.add("rm");
    if (q.get("lit") === "0") root.removeAttribute("data-lit");
  })();
  var PAGES = [
    { href: "index.html",       label: "T1a · Академія" },
    { href: "architect.html",   label: "T1a · Architect" },
    { href: "claude-code.html", label: "T1b · Термінал" },
    { href: "chrome.html",      label: "Хром" }
  ];
  var COURSES = [
    { v: "academy",   label: "шафран" },
    { v: "architect", label: "патина" },
    { v: "terminal",  label: "лазур" }
  ];
  var MOTION = [
    { v: "calm",     label: "calm" },
    { v: "standard", label: "standard" },
    { v: "bold",     label: "bold" }
  ];
  var DENSITY = [
    { v: "landing", label: "landing" },
    { v: "lesson",  label: "lesson" }
  ];

  function group(label, items, get, set) {
    var g = document.createElement("span");
    g.className = "b1-bar__group";
    var l = document.createElement("span");
    l.className = "b1-bar__label";
    l.textContent = label;
    g.appendChild(l);
    items.forEach(function (it) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = it.label;
      b.setAttribute("aria-pressed", String(get() === it.v));
      b.addEventListener("click", function () {
        set(it.v);
        Array.prototype.forEach.call(g.querySelectorAll("button"), function (x) {
          x.setAttribute("aria-pressed", String(x === b));
        });
      });
      g.appendChild(b);
    });
    return g;
  }

  function build() {
    var bar = document.createElement("div");
    bar.className = "b1-bar";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Перемикачі макета (у код не їдуть)");

    bar.appendChild(group("акцент", COURSES,
      function () { return root.getAttribute("data-course"); },
      function (v) { root.setAttribute("data-course", v); }));

    bar.appendChild(group("рух", MOTION,
      function () { return root.getAttribute("data-motion") || "standard"; },
      function (v) { root.setAttribute("data-motion", v); }));

    bar.appendChild(group("щільність", DENSITY,
      function () { return root.getAttribute("data-density") || "landing"; },
      function (v) { root.setAttribute("data-density", v); }));

    bar.appendChild(group("reduce", [{ v: "on", label: "rm" }],
      function () { return root.classList.contains("rm") ? "on" : "off"; },
      function () { root.classList.toggle("rm"); }));

    bar.appendChild(group("світло згори", [{ v: "on", label: "data-lit" }],
      function () { return root.hasAttribute("data-lit") ? "on" : "off"; },
      function () {
        if (root.hasAttribute("data-lit")) root.removeAttribute("data-lit");
        else root.setAttribute("data-lit", "");
      }));

    var sp = document.createElement("span");
    sp.className = "b1-bar__spacer";
    bar.appendChild(sp);

    var here = location.pathname.split("/").pop() || "index.html";
    PAGES.forEach(function (p, i) {
      if (i) bar.appendChild(document.createTextNode(" · "));
      var a = document.createElement("a");
      a.href = p.href;
      a.textContent = p.label;
      if (p.href === here) a.setAttribute("aria-current", "page");
      bar.appendChild(a);
    });

    document.body.appendChild(bar);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
