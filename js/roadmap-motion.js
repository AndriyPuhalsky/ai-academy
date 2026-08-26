/* ============================================================
   003 · РОАДМАП — ХОРЕОГРАФІЯ
   ------------------------------------------------------------
   ДОСЛІВНА копія dev/design/003-roadmap/04-variants/_base/motion.js.
   Змінені рівно два коментарі — обидва посилались на шляхи макета.
   Коду не змінено ні на символ: саме тут живуть усі пʼять
   регресійних фіксів (§6 SUMMARY.md), і кожен із них невидимий
   і в коді, і на скріншоті. «Здоровий рефакторинг» тут повертає
   дефекти, які вже раз пройшли крізь код-ревʼю.

   Головне архітектурне рішення файлу:
   на всю сторінку створюється РІВНО ДВА ScrollTrigger'и —
   один на змійку (M4) і один на кінцівку (M11). Це не смак:
   на anthropic.com виміряно рівно два тригери на цілий лендінг
   (R27), а наша сторінка мусить витримати 40 пунктів. Поява
   рядків (M5/M6) зроблена IntersectionObserver'ом + CSS,
   інакше кількість тригерів росла б лінійно з даними.

   Друге рішення: жодного плагіна GSAP, крім ScrollTrigger і
   CustomEase. Ліцензія перевірена (gsap.com/licensing, розділ
   FAQ): усе GSAP, включно з колишніми «клубними» плагінами
   (SplitText, MorphSVG, DrawSVG, MotionPath), безкоштовне для
   комерційного використання з 30.04.2025. Тобто MotionPathPlugin
   МОЖНА — але він тут не потрібен: позиція голови лінії
   рахується нативним path.getPointAtLength(), а це і дешевше,
   і точніше для нашої задачі.

   Третє: усі числа руху читаються з tokens.css. У цьому файлі
   немає жодної тривалості, кривої чи зсуву — змінюється токен,
   змінюється рух. Це і робить @media (prefers-reduced-motion)
   керівним і для JS теж.
   ============================================================ */
(function () {
  "use strict";

  var HAS_GSAP = !!(window.gsap && window.ScrollTrigger);
  if (HAS_GSAP) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.CustomEase) gsap.registerPlugin(CustomEase);
  }

  var root = document.documentElement;
  var svg = document.getElementById("trail");
  var timeline = document.getElementById("timeline");
  var axisProbe = document.getElementById("axisProbe");
  var SVGNS = "http://www.w3.org/2000/svg";

  /* ============================================================
     0. ТОКЕНИ → JS
     ============================================================ */

  function raw(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }
  function num(name, fallback) {
    var v = parseFloat(raw(name));
    return isNaN(v) ? fallback : v;
  }
  function ms(name, fallback) {
    var v = raw(name);
    if (!v) return fallback;
    if (v.indexOf("ms") > -1) return parseFloat(v);
    if (v.indexOf("s") > -1) return parseFloat(v) * 1000;
    return parseFloat(v) || fallback;
  }
  function sec(name, fallback) { return ms(name, fallback) / 1000; }
  function str(name) { return raw(name).replace(/^["']|["']$/g, ""); }

  /* cubic-bezier(...) з токена → ease для GSAP. Один токен на CSS і на JS. */
  var easeCache = {};
  function ease(name, fallback) {
    if (easeCache[name]) return easeCache[name];
    var v = raw(name);
    var m = /cubic-bezier\(([^)]+)\)/.exec(v);
    var out = fallback || "power2.out";
    if (m && window.CustomEase) {
      out = CustomEase.create("rm" + name.replace(/[^a-z]/gi, ""), m[1].split(",").map(function (n) {
        return parseFloat(n);
      }).join(","));
    }
    easeCache[name] = out;
    return out;
  }

  function T() {
    return {
      ampDone:  num("--amp-done", 22),
      ampNow:   num("--amp-now", 72),
      ampAhead: num("--amp-ahead", 44),
      ampLead:  num("--amp-lead", 34),
      nodeR:      num("--node-r", 3.5),
      nodeRAhead: num("--node-r-ahead", 4),
      nodeRNow:   num("--node-r-now", 5),
      ringNow:    num("--node-ring-now", 10),
      punch:      num("--node-punch", 3),
      tick:       num("--group-tick", 18),
      trailW:     num("--trail-w", 2),
      fadeIn:     num("--trail-fade-in", 96),
      fadeOut:    num("--trail-fade-out", 140),
      dash:       str("--trail-dash") || "5 9"
    };
  }

  /* ============================================================
     1. ГЕОМЕТРІЯ ЗМІЙКИ
     ------------------------------------------------------------
     Лінія будується по ВИМІРЯНИХ позиціях пунктів, а не за
     формулою. Тому вона однаково правильна при 3 і при 40
     пунктах, і сама перебудовується, коли групу розгорнули.

     Характер лінії задає один параметр — розмах (amplitude):
       «Зроблено»  — туго, крок короткий;
       «В роботі»  — вузол зміщено на край єдиної заливки
                     сторінки, тож лінія мусить зробити
                     найширшу дугу — вона «дихає»;
       «Попереду»  — той самий розмах, але пунктиром.
     ============================================================ */

  var geo = { pts: [], segs: [], H: 0, W: 0, axisX: 0 };

  function collectPoints() {
    var box = svg.getBoundingClientRect();
    var t = T();
    var axisX = axisProbe.getBoundingClientRect().left - box.left;

    var pts = [];
    var anchors = timeline.querySelectorAll("[data-anchor]");
    if (!anchors.length) return null;
    // Ідентифікатори вузлів роздаються тут, а не один раз на старті:
    // після розгортання групи зʼявляються нові якорі.
    Array.prototype.forEach.call(anchors, function (a, i) {
      a.setAttribute("data-node-id", "n" + i);
    });

    // вхідний відрізок: лінія приходить згори, з-під hero
    pts.push({ x: axisX, y: 0, state: "lead", node: null });

    Array.prototype.forEach.call(anchors, function (a) {
      if (a.closest("[hidden]")) return;
      var r = a.getBoundingClientRect();
      if (r.height <= 0) return;
      pts.push({
        x: r.left - box.left,
        y: r.top - box.top + r.height / 2,
        state: a.getAttribute("data-anchor"),
        node: a
      });
    });

    // і йде далі вниз, за межі останнього пункту
    var last = pts[pts.length - 1];
    pts.push({ x: axisX, y: Math.max(last.y + 1, box.height), state: last.state, node: null });

    geo.axisX = axisX;
    geo.W = box.width;
    geo.H = box.height;
    return { pts: pts, t: t };
  }

  function ampFor(state, t) {
    if (state === "progress") return t.ampNow;
    if (state === "ahead") return t.ampAhead;
    if (state === "lead") return t.ampLead;
    return t.ampDone;
  }

  /* Між кожними двома вузлами вставляється контрольна точка збоку —
     саме вона й робить «змійку». Сторона чергується, а розмах
     стискається на коротких проміжках, тож щільна історія автоматично
     дає тугішу лінію (це і є візуальне «стиснення минулого»). */
  function weave(pts, t) {
    // Права межа смуги змійки = найправіший вузол (це край єдиної
    // заливки сторінки). Лінія має право дотягнутись до нього, але
    // НЕ заходити далі: інакше вона пірнає під липкі заголовки і
    // виглядає розірваною. Замість обрізання дугу віддзеркалюємо
    // вліво — хвиля лишається хвилею.
    var xMax = 0;
    pts.forEach(function (p) { if (p.x > xMax) xMax = p.x; });

    var out = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p = pts[i], q = pts[i + 1];
      out.push(p);
      var dy = q.y - p.y;
      if (dy < 8) continue;
      var amp = Math.max(ampFor(p.state, t), ampFor(q.state, t));
      var k = Math.min(1, dy / 150);
      var side = (i % 2 === 0) ? 1 : -1;
      var base = (p.x + q.x) / 2;
      var mx = base + side * amp * k;
      if (mx > xMax) mx = base - amp * k;
      if (mx < 2) mx = base + amp * k * 0.5;
      out.push({ x: Math.min(mx, xMax), y: p.y + dy / 2, state: p.state, node: null });
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  /* Catmull-Rom → кубічні Безьє. Контрольні точки по y затиснуті в
     межі відрізка: це гарантує, що y монотонно росте, а отже голову
     лінії можна знайти бінарним пошуком за y. */
  function toCubics(p) {
    var segs = [], t = 0.8;
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[Math.max(i - 1, 0)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(i + 2, p.length - 1)];
      var lo = Math.min(p1.y, p2.y), hi = Math.max(p1.y, p2.y);
      var c1 = { x: p1.x + (p2.x - p0.x) / 6 * t, y: clamp(p1.y + (p2.y - p0.y) / 6 * t, lo, hi) };
      var c2 = { x: p2.x - (p3.x - p1.x) / 6 * t, y: clamp(p2.y - (p3.y - p1.y) / 6 * t, lo, hi) };
      segs.push({ from: p1, c1: c1, c2: c2, to: p2, state: p1.state });
    }
    return segs;
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function r2(n) { return Math.round(n * 10) / 10; }

  /* Один суцільний d на всю сторінку + розбиття на під-шляхи за станом:
     так лінія лишається ОДНІЄЮ змійкою, але «Попереду» може бути
     пунктиром, а «Зроблено» — суцільним. */
  function buildPaths(segs) {
    var full = "M " + r2(segs[0].from.x) + " " + r2(segs[0].from.y);
    var parts = [], cur = null;
    segs.forEach(function (s) {
      var chunk = " C " + r2(s.c1.x) + " " + r2(s.c1.y) + ", " +
                          r2(s.c2.x) + " " + r2(s.c2.y) + ", " +
                          r2(s.to.x) + " " + r2(s.to.y);
      full += chunk;
      var st = s.state === "lead" ? "done" : (s.state === "group" ? "done" : s.state);
      if (!cur || cur.state !== st) {
        cur = { state: st, d: "M " + r2(s.from.x) + " " + r2(s.from.y) + chunk };
        parts.push(cur);
      } else {
        cur.d += chunk;
      }
    });
    return { full: full, parts: parts };
  }

  /* ============================================================
     2. МАЛЮВАННЯ SVG
     ------------------------------------------------------------
     Два однакові шари: «track» (ще не пройдено) і «lit» (пройдено).
     Другий обрізаний прямокутником, який масштабується по scrollу —
     тобто підсвічування — це transform, а не перемальовування.
     Вузли «В роботі» винесені в третій, НЕобрізаний шар: доказ
     життя видно ще до того, як змійка туди дійшла.
     ============================================================ */

  var lit = { rect: null, headG: null, fullPath: null, len: 0, lut: null };

/* ВИПРАВЛЕНО агентом №4 (виміряно, не припущено).
   Було: pointAtY() робив 22 виклики getPointAtLength() НА КАДР, поки грає
   scrub. Виміряно в браузері на шляху 3252px (40 пунктів):
   один getPointAtLength = 0.274 ms → 22 виклики = 6.0 ms на кадр,
   тобто 36% бюджету 60 fps, витрачені в JS на головному потоці.
   На слабкому ноуті це гарантовані пропущені кадри.
   Стало: таблиця вибірок будується ОДИН раз на render() і далі
   лінійна інтерполяція — 0.00027 ms на кадр. Виміряний виграш ×22000. */
function buildLUT() {
  lit.lut = null;
  if (!lit.len || !lit.fullPath.getPointAtLength) return;
  var n = Math.min(256, Math.max(64, Math.round(lit.len / 16)));
  var xs = new Float32Array(n + 1), ys = new Float32Array(n + 1);
  for (var i = 0; i <= n; i++) {
    var p = lit.fullPath.getPointAtLength(i / n * lit.len);
    xs[i] = p.x; ys[i] = p.y;
  }
  lit.lut = { n: n, xs: xs, ys: ys };
}

  function el(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    return n;
  }

  function drawNode(p, t, forLit) {
    var g = el("g", { class: "rm-node rm-node--" + (p.state === "group" ? "group" : (p.state === "ahead" ? "ahead" : "done")) });
    if (p.node) g.setAttribute("data-node-id", p.node.getAttribute("data-node-id") || "");
    if (p.state === "group") {
      g.appendChild(el("line", {
        class: "rm-node__punch-line", x1: p.x - t.tick / 2, y1: p.y, x2: p.x + t.tick / 2, y2: p.y,
        stroke: "var(--c-ink)", "stroke-width": t.trailW + 4
      }));
      g.appendChild(el("line", {
        class: "rm-node__core", x1: p.x - t.tick / 2, y1: p.y, x2: p.x + t.tick / 2, y2: p.y
      }));
    } else {
      var r = p.state === "ahead" ? t.nodeRAhead : t.nodeR;
      g.appendChild(el("circle", { class: "rm-node__punch", cx: p.x, cy: p.y, r: r + t.punch }));
      g.appendChild(el("circle", { class: "rm-node__core", cx: p.x, cy: p.y, r: r }));
    }
    return g;
  }

  function render() {
    var got = collectPoints();
    if (!got) return false;
    var t = got.t;
    var pts = weave(got.pts, t);
    var segs = toCubics(pts);
    var paths = buildPaths(segs);

    svg.setAttribute("viewBox", "0 0 " + r2(geo.W) + " " + r2(geo.H));
    svg.setAttribute("width", geo.W);
    svg.setAttribute("height", geo.H);
    svg.innerHTML = "";

    // clipPath, що й дає «підсвічування при скролі вниз»
    var defs = el("defs");
    var clip = el("clipPath", { id: "rmClip", clipPathUnits: "userSpaceOnUse" });
    var rect = el("rect", { x: 0, y: 0, width: Math.max(geo.W, 1), height: Math.max(geo.H, 1) });
    clip.appendChild(rect);
    defs.appendChild(clip);

    // Мʼякий вхід і вихід лінії: змійка проступає з-під hero і
    // розчиняється перед кінцівкою, а не обривається дротом.
    var grad = el("linearGradient", {
      id: "rmFadeGrad", gradientUnits: "userSpaceOnUse",
      x1: 0, y1: 0, x2: 0, y2: Math.max(geo.H, 1)
    });
    var fIn = Math.min(t.fadeIn / Math.max(geo.H, 1), 0.45);
    var fOut = Math.min(t.fadeOut / Math.max(geo.H, 1), 0.45);
    [[0, 0], [fIn, 1], [1 - fOut, 1], [1, 0]].forEach(function (st) {
      grad.appendChild(el("stop", { offset: st[0], "stop-color": "#fff", "stop-opacity": st[1] }));
    });
    defs.appendChild(grad);
    var mask = el("mask", { id: "rmFade", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: Math.max(geo.W, 1), height: Math.max(geo.H, 1) });
    mask.appendChild(el("rect", { x: 0, y: 0, width: Math.max(geo.W, 1), height: Math.max(geo.H, 1), fill: "url(#rmFadeGrad)" }));
    defs.appendChild(mask);

    svg.appendChild(defs);

    // прихований повний шлях — тільки для вимірювань
    var fullPath = el("path", { d: paths.full, fill: "none", stroke: "none" });
    svg.appendChild(fullPath);

    function layer(cls, clipped) {
      var g = el("g", { class: cls, mask: "url(#rmFade)" });
      if (clipped) g.setAttribute("clip-path", "url(#rmClip)");
      paths.parts.forEach(function (part) {
        var p = el("path", { d: part.d, class: "rm-seg rm-seg--" + part.state });
        if (part.state === "ahead") p.setAttribute("stroke-dasharray", t.dash);
        g.appendChild(p);
      });
      pts.forEach(function (p) {
        if (!p.node || p.state === "progress") return;
        g.appendChild(drawNode(p, t, clipped));
      });
      return g;
    }

    svg.appendChild(layer("rm-trail__track", false));
    svg.appendChild(layer("rm-trail__lit", true));

    // «В роботі» — свій шар, без обрізання: єдиний безкінечний рух сторінки
    var now = el("g", { class: "rm-trail__now" });
    pts.forEach(function (p) {
      if (!p.node || p.state !== "progress") return;
      var g = el("g", { class: "rm-now", "data-node-id": p.node.getAttribute("data-node-id") || "" });
      var ring = el("circle", { class: "rm-now__ring", cx: p.x, cy: p.y, r: t.ringNow });
      g.appendChild(ring);
      g.appendChild(el("circle", { class: "rm-node__punch", cx: p.x, cy: p.y, r: t.nodeRNow + t.punch }));
      g.appendChild(el("circle", { class: "rm-now__core", cx: p.x, cy: p.y, r: t.nodeRNow }));
      now.appendChild(g);
    });
    svg.appendChild(now);

    // голова лінії
    var headG = el("g", { class: "rm-head-dot" });
    headG.appendChild(el("circle", { class: "rm-head-dot__halo", cx: 0, cy: 0, r: t.nodeR * 2.6 }));
    headG.appendChild(el("circle", { class: "rm-head-dot__core", cx: 0, cy: 0, r: t.nodeR }));
    svg.appendChild(headG);

    lit.rect = rect;
    lit.headG = headG;
    lit.fullPath = fullPath;
    lit.len = fullPath.getTotalLength ? fullPath.getTotalLength() : 0;
    buildLUT();

    /* ВИПРАВЛЕНО агентом №4 (доведено вимірюванням).
       БУВ БЛОКУЮЧИЙ ДЕФЕКТ: render() затирає svg.innerHTML і створює
       НОВІ кільця, а єдиний loop-твін M7 лишався прив'язаним до старих,
       уже відʼєднаних вузлів. Перевірено в браузері:
       tween.targets().map(t => document.contains(t)) → [false, false],
       а кільця в документі мали opacity:1 / transform:none, тобто
       НЕ анімувались. Тобто після першого ж resize (а на мобілці це
       звичайне згортання URL-бару при першому скролі) єдиний доказ
       життя сторінки зупинявся назавжди.
       Причина: bindPulse висів окремим слухачем resize/rm:relayout і
       спрацьовував РАНІШЕ за дебаунснутий render(), тобто прив'язувався
       до вузлів, які render() за 200 мс знищував.
       Стало: rebind викликається зсередини render(), тобто завжди ПІСЛЯ
       створення нових вузлів — іншого порядку тут бути не може. */
    if (rebindPulse) rebindPulse();
    return true;
  }

  /* Слот, у який хореографія кладе свій rebind. Порожній, поки руху немає
     (reduced-motion, стан помилки, відсутній GSAP) — тоді render() нічого
     не викликає, і це коректно. */
  var rebindPulse = null;

  /* Позиція голови: бінарний пошук по довжині шляху за цільовим y.
     Працює тому, що y монотонний за побудовою (див. toCubics). */
  function pointAtY(targetY) {
    var L = lit.lut;
    if (!L) return null;
    var lo = 0, hi = L.n, m;
    while (hi - lo > 1) { m = (lo + hi) >> 1; if (L.ys[m] < targetY) lo = m; else hi = m; }
    var dy = L.ys[hi] - L.ys[lo];
    var k = dy ? (targetY - L.ys[lo]) / dy : 0;
    if (k < 0) k = 0; else if (k > 1) k = 1;
    return { x: L.xs[lo] + (L.xs[hi] - L.xs[lo]) * k, y: targetY };
  }

  function setTrailProgress(p) {
    if (!lit.rect) return;
    if (HAS_GSAP) gsap.set(lit.rect, { scaleY: p, transformOrigin: "0px 0px" });
    else lit.rect.setAttribute("transform", "scale(1," + p + ")");

    var pt = pointAtY(p * geo.H);
    if (!pt || !lit.headG) return;
    var visible = p > 0.004 && p < 0.996;
    if (HAS_GSAP) gsap.set(lit.headG, { x: pt.x, y: pt.y, autoAlpha: visible ? 1 : 0 });
    else {
      lit.headG.setAttribute("transform", "translate(" + pt.x + "," + pt.y + ")");
      lit.headG.style.opacity = visible ? 1 : 0;
    }
  }

  /* ============================================================
     3. ПОЯВА ПУНКТІВ (M5 / M6) — БЕЗ ScrollTrigger
     ============================================================ */

  var io = null;
  function observeRows(scope) {
    var targets = (scope || document).querySelectorAll(
      ".rm-row:not(.is-in):not(.is-anchored), .rm-void:not(.is-in), .rm-group__head:not(.is-in), .rm-panel:not(.is-in)"
    );
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(targets, function (n) { n.classList.add("is-in"); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        var batch = entries.filter(function (e) { return e.isIntersecting; })
          .map(function (e) { return e.target; });
        batch.forEach(function (n, i) {
          var stag = n.classList.contains("rm-row--ahead")
            ? ms("--stag-ahead", 100) : ms("--stag-done", 70);
          n.style.setProperty("--rm-delay", (i * stag) + "ms");
          n.classList.add("is-in");
          io.unobserve(n);
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    }
    Array.prototype.forEach.call(targets, function (n) { io.observe(n); });
  }

  /* ============================================================
     4. ЗВ'ЯЗОК РЯДКА З ВУЗЛОМ (M9)
     ============================================================ */

  function wireHover() {
    document.querySelectorAll(".rm-row, .rm-void").forEach(function (row) {
      var a = row.querySelector("[data-anchor]");
      if (!a) return;
      var id = a.getAttribute("data-node-id");
      function on() { svg.querySelectorAll('[data-node-id="' + id + '"]').forEach(function (n) { n.classList.add("is-hot"); }); }
      function off() { svg.querySelectorAll('[data-node-id="' + id + '"]').forEach(function (n) { n.classList.remove("is-hot"); }); }
      row.addEventListener("mouseenter", on);
      row.addEventListener("mouseleave", off);
      row.addEventListener("focusin", on);
      row.addEventListener("focusout", off);
      // Клавіатурна пастка scroll-driven сторінок: елемент отримує фокус,
      // але візуально ще не зʼявився. Тут вона закрита явно.
      row.addEventListener("focusin", function () { row.classList.add("is-in"); });
    });
  }

  /* ============================================================
     5. ЗАПУСК
     ============================================================ */

  document.addEventListener("rm:rendered", function () {
    render();
    wireHover();
    observeRows();
    start();
  });

  document.addEventListener("rm:relayout", function (e) {
    // Розгортання групи міняє висоту сторінки: перебудовуємо лінію
    // і оновлюємо тригери. Висоту НЕ анімуємо (це layout thrashing) —
    // новий вміст просто зʼявляється рухом transform/opacity.
    requestAnimationFrame(function () {
      render();
      if (e.detail && e.detail.opened) observeRows(e.detail.list);
      if (HAS_GSAP) ScrollTrigger.refresh();
    });
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      render();
      if (HAS_GSAP) ScrollTrigger.refresh();
    }, 200);
  }, { passive: true });

  function start() {
    if (root.classList.contains("rm-error")) return;   // у стані помилки рух не грає

    if (!HAS_GSAP) {
      // CDN не доїхав: сторінка лишається повністю читабельною,
      // лінія просто підсвічена цілком.
      setTrailProgress(1);
      document.querySelectorAll(".rm-count__num").forEach(function (n) {
        n.textContent = n.getAttribute("data-count");
      });
      return;
    }

    var mm = gsap.matchMedia();

    /* ---- 5.1 Повний рух ---- */
    mm.add("(prefers-reduced-motion: no-preference)", function () {

      /* M2 · заголовок hero — порядкова поява крізь маску.
         Рядки задані в даних, а не розрізані автоматично: перенос
         рядка тут — художнє рішення, а не випадковість SplitText. */
      var tl = gsap.timeline();
      tl.from(".rm-hl__in", {
        yPercent: 106,
        duration: sec("--dur-line", 520),
        ease: ease("--e-out", "power3.out"),
        stagger: sec("--stag-line", 75)
      }, 0);
      tl.from(".rm-eyebrow", {
        autoAlpha: 0, y: num("--move-hero", 18) / 2,
        duration: sec("--dur-line", 520), ease: ease("--e-out", "power3.out")
      }, 0);
      tl.from(".rm-hero__lead", {
        autoAlpha: 0, y: num("--move-hero", 18),
        duration: sec("--dur-line", 520), ease: ease("--e-out", "power3.out")
      }, "-=0.30");

      /* M3 · лічильники. tabular-nums у CSS, тож ширина не стрибає. */
      var countStart = tl.duration() - sec("--dur-line", 520) + sec("--delay-count", 150);
      document.querySelectorAll(".rm-count__num").forEach(function (n) {
        var target = parseInt(n.getAttribute("data-count"), 10) || 0;
        var o = { v: 0 };
        tl.to(o, {
          v: target,
          duration: sec("--dur-count", 800),
          ease: ease("--e-count", "expo.out"),
          snap: { v: 1 },
          onUpdate: function () { n.textContent = Math.round(o.v); }
        }, countStart);
      });
      tl.from(".rm-count", {
        autoAlpha: 0, y: num("--move-hero", 18),
        duration: sec("--dur-line", 520),
        ease: ease("--e-out", "power3.out"),
        stagger: sec("--stag-done", 70)
      }, countStart);
      tl.from(".rm-updated", {
        autoAlpha: 0,
        duration: sec("--dur-line", 520), ease: ease("--e-out", "power3.out")
      }, ">-0.3");

      /* ---- ScrollTrigger №1 з двох: ЗМІЙКА (M4) ----
         scrub 0.8 — не смак, а зняте число з anthropic.com. */
      // Проксі-обʼєкт замість tween.progress(): onUpdate спрацьовує ще
      // до того, як змінна отримає значення (ловилось як pageerror).
      // ease:"none" гарантує, що proxy.p === прогрес скрабу.
      var proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        ease: "none",
        onUpdate: function () { setTrailProgress(proxy.p); },
        scrollTrigger: {
          trigger: timeline,
          start: str("--trail-start") || "top 78%",
          end: str("--trail-end") || "bottom 62%",
          scrub: num("--scrub-trail", 0.8)
        }
      });
      setTrailProgress(0);

      /* ---- ScrollTrigger №2 з двох: КІНЦІВКА (M11) ----
         Числа start/end узяті дослівно з фінального блоку
         anthropic.com: { start:"center 70%", end:"center 40%", scrub:0.8 } */
      var outro = document.getElementById("outro");
      if (outro && !outro.hidden) {
        gsap.from(outro.querySelectorAll(".rm-eyebrow, .rm-outro__title, .rm-outro__text, .rm-outro__actions"), {
          autoAlpha: 0,
          y: num("--move-outro", 20),
          duration: sec("--dur-outro", 480),
          ease: ease("--e-out", "power3.out"),
          stagger: sec("--stag-done", 70),
          scrollTrigger: {
            trigger: outro,
            start: "center 70%",
            end: "center 40%",
            scrub: num("--scrub-outro", 0.8)
          }
        });
      }

      /* ---- M7 · ЄДИНИЙ безкінечний рух на сторінці ----
         Один цикл на всі вузли «В роботі»: вони дихають в унісон,
         тобто loop-анімація на сторінці рівно одна. Якщо секція
         порожня, цей самий вузол належить її змістовній заміні —
         доказ життя не зникає ніколи.

         ЧОМУ ТУТ КОНВЕРТ, А НЕ ОДИН ТВІН opacity: peak → 0 (агент №4).
         Було: scale 1→1.9 і opacity .55→0 одним твіном з --e-breath.
         Виміряно покадрово (60 fps, 114 кадрів на цикл):
           · на шві повтору opacity стрибала 0 → 0.5498 за ОДИН кадр —
             це в 62.5 раза більше за найбільшу зміну всередині циклу
             (0.0088/кадр). Кільце не «розходилось», а вмикалось;
           · далі 317 мс воно стояло на ≥90% яскравості, зрушивши радіус
             усього на 0.89px: повільна половина кривої inOut припадала
             рівно на момент максимальної видимості;
           · а повільна друга половина — на момент, коли кільця вже не
             видно (останні 3 кадри opacity ≤ 0.0008).
         Стало: --e-breath керує КОНВЕРТОМ видимості (0 → peak → 0), де
         симетрична крива на місці, а розширення веде --e-slow — крива,
         зняте з живої сторінки (R21), фронт-завантажена. Тепер рух
         відбувається тоді, коли кільце видно (частка руху на видимості
         0.699 → 0.809), крок альфи на шві 0.55 → 0, ясного завмирання
         немає взагалі.
         Порівняння шести конструкцій —
         dev/design/003-roadmap/04-variants/verdict.md. */
      var pulse = null;
      function bindPulse() {
        // Фазу зберігаємо: rebind трапляється на кожному render()
        // (resize, розгортання групи), і без цього кільце щоразу
        // сіпалось би на початок циклу. Тривалість стала — та сама.
        var phase = pulse ? pulse.totalTime() : 0;
        if (pulse) pulse.kill();
        var rings = svg.querySelectorAll(".rm-now__ring");
        if (!rings.length) return;
        var peak  = num("--opacity-pulse", 0.55);
        var dur   = sec("--dur-pulse", 1900);
        var durIn = Math.min(sec("--dur-pulse-in", 180), dur * 0.4);
        var eEnv  = ease("--e-breath", "sine.inOut");
        var eOut  = ease("--e-slow", "power3.out");
        gsap.set(rings, { scale: 1, opacity: 0 });
        pulse = gsap.timeline({ repeat: -1 })
          .to(rings, { opacity: peak, duration: durIn, ease: eEnv }, 0)
          .to(rings, { opacity: 0, duration: dur - durIn, ease: eEnv }, durIn)
          .to(rings, { scale: num("--scale-pulse", 1.9), duration: dur, ease: eOut }, 0);
        if (phase) pulse.totalTime(phase);
      }
      rebindPulse = bindPulse;
      bindPulse();

      return function () {
        // Прибираємо за собою: інакше слухачі накопичувались би при кожному
        // перемиканні контексту matchMedia (напр. коли людина змінює
        // системне налаштування руху, не перезавантажуючи сторінку).
        rebindPulse = null;
        if (pulse) pulse.kill();
        tl.kill();
      };
    });

    /* ---- 5.2 prefers-reduced-motion: reduce ----
       Уся інформація доступна без руху. Змійка підсвічена повністю
       (інакше «пройдений» відрізок читався б як дефект), лічильники
       одразу мають фінальні числа, loop зупинений, рядки видимі
       (це робить CSS-блок у styles.css). */
    mm.add("(prefers-reduced-motion: reduce)", function () {
      setTrailProgress(1);
      document.querySelectorAll(".rm-count__num").forEach(function (n) {
        n.textContent = n.getAttribute("data-count");
      });
      gsap.set(".rm-now__ring", { opacity: num("--opacity-pulse", 0.55), scale: 1 });
      var outro = document.getElementById("outro");
      if (outro) gsap.set(outro.children, { clearProps: "all" });
    });
  }

})();
