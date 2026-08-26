/* ============================================================
   003 · РОАДМАП — РЕНДЕР
   ------------------------------------------------------------
   Перенесено з dev/design/003-roadmap/04-variants/_base/render.js.
   Єдина відповідальність цього файлу: перетворити roadmap.json
   на DOM. Жодної анімації тут немає — вона в js/roadmap-motion.js.
   Розділення свідоме: правки в русі не мають ризикувати рендером.

   У розмітці roadmap.html немає жодного пункту, жодної назви
   секції і жодного заголовка — усе приходить звідси (критерій 13).
   Кількість пунктів наперед невідома: перевірено на 3, 18 і 40.

   Правки проти макета — рівно пʼять, кожна підписана «ПРАВКА N»:
     1 · контрол «#» рендериться лише для state ∈ progress|ahead
         (рішення власника 7.4 — єдина дозволена правка дизайну);
     2 · коментар про шляхи даних приведений до реальності кореня;
     3 · openContact() відкриває реальну модалку js/contact.js,
         а не тост макета;
     4 · inflate() і сценарій ?data=dropped більше нічого не
         вигадують: клонують реальні пункти з префіксом «[тест]»,
         бо ці URL лишаються доступними на публічній сторінці;
     5 · слухач на #contactTrigger прибраний — на сайті цю кнопку
         вже слухає js/contact.js, і два слухачі викликали б
         openModal() двічі на один клік.
   ============================================================ */
(function () {
  "use strict";

  var Q = new URLSearchParams(location.search);
  // ПРАВКА 2. roadmap.html лежить у корені сайту, тому обидва атрибути
  // (data-site-root, data-roadmap) у розмітці НЕ стоять і код бере
  // дефолти: корінь "" і дані "roadmap.json". Читання атрибутів
  // лишене свідомо — воно нічого не коштує і тримає файл сумісним
  // із макетом, який живе глибше в дереві.
  var ROOT = document.documentElement.getAttribute("data-site-root") || "";
  var SECTION_ORDER = ["progress", "done", "ahead"]; // порядок ДАНИХ, не показу
  var VIEW_ORDER = ["done", "progress", "ahead"];    // порядок ПОКАЗУ на сторінці

  // ПРАВКА 3. Тексти службових оголошень беруться з даних, а не з коду,
  // тому build() кладе data.copy сюди. До приходу даних — null.
  var COPY = null;

  var el = {
    sections:    document.getElementById("sections"),
    timeline:    document.getElementById("timeline"),
    heroEyebrow: document.getElementById("heroEyebrow"),
    heroTitle:   document.getElementById("heroTitle"),
    heroLead:    document.getElementById("heroLead"),
    heroCounts:  document.getElementById("heroCounts"),
    heroUpdated: document.getElementById("heroUpdated"),
    outro:       document.getElementById("outro"),
    backLink:    document.getElementById("backLink"),
    backLabel:   document.getElementById("backLabel"),
    live:        document.getElementById("ariaLive")
  };

  /* ---------- дрібні помічники ---------- */

  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function sr(text) { return h("span", "sr-only", text); }
  function say(msg) { if (el.live) { el.live.textContent = ""; setTimeout(function () { el.live.textContent = msg; }, 30); } }

  // Українська множина: 1 пункт / 2 пункти / 5 пунктів
  function plural(n, forms) {
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return forms[0];
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
    return forms[2];
  }

  /* ---------- 1. Отримання даних ---------- */

  var skeletonTimer = setTimeout(showSkeleton, cssMs("--delay-skeleton", 150));

  function cssMs(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!v) return fallback;
    if (v.indexOf("ms") > -1) return parseFloat(v);
    if (v.indexOf("s") > -1) return parseFloat(v) * 1000;
    return parseFloat(v) || fallback;
  }

  function load() {
    if (Q.get("fail") === "1") return Promise.reject(new Error("forced"));
    // ПРАВКА 2. У корені сайту атрибута немає — дефолт "roadmap.json".
    var src = document.documentElement.getAttribute("data-roadmap") || "roadmap.json";
    var p = fetch(src, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
    var wait = Q.get("slow") === "1" ? 2200 : 0;
    return wait ? p.then(function (d) {
      return new Promise(function (res) { setTimeout(function () { res(d); }, wait); });
    }) : p;
  }

  load().then(function (data) {
    clearTimeout(skeletonTimer);
    build(applyScenario(data));
  }).catch(function (err) {
    clearTimeout(skeletonTimer);
    renderError(err);
  });

  /* ---------- 2. Сценарії крайніх випадків (тільки для макета) ----------
     На сайті цього блоку не буде: там дані приходять як є. Тут він
     потрібен, щоб агент №4 і власник могли побачити крайні випадки
     очима, а не повірити на слово.                                    */

  function applyScenario(data) {
    var mode = Q.get("data");
    if (Q.get("links") === "1") {
      data.links.github = "https://github.com/";
      data.links.telegram = "https://t.me/";
    }
    if (mode === "empty-progress") {
      data.items = data.items.filter(function (i) { return i.state !== "progress"; });
    } else if (mode === "min") {
      data.items = [
        data.items.find(function (i) { return i.state === "done"; }),
        data.items.find(function (i) { return i.state === "progress"; }),
        data.items.find(function (i) { return i.state === "ahead"; })
      ].filter(Boolean);
    } else if (mode === "empty") {
      data.items = [];
    } else if (mode === "max") {
      data.items = inflate(data.items, 40);
    } else if (mode === "dropped") {
      // ПРАВКА 4. Пункт нейтральний: він живе на публічному URL, тому
      // не має права виглядати як справжнє рішення про продукт.
      data.items = data.items.slice();
      data.items.splice(6, 0, {
        id: "dropped-demo", state: "dropped",
        title: "[тест] Скасований пункт",
        description: "Демонстрація стану «Передумали». Реальних скасованих пунктів у плані немає.",
        date: "Q-2 2026", platform: "both"
      });
    } else if (mode === "nodate") {
      // ПРАВКА 4. Нічого не вигадує — лише прибирає поле date з останнього
      // пункту «Попереду», щоб можна було побачити copy.noDate («пізніше»).
      var lastAhead = data.items.filter(function (i) { return i.state === "ahead"; }).pop();
      if (lastAhead) delete lastAhead.date;
    }
    return data;
  }

  /* ПРАВКА 4. Масштабний тест (?data=max): нічого не вигадуємо —
     клонуємо реальні пункти з видимим префіксом «[тест]» і синтетичними
     старими кварталами (щоб задіялось ще й групування). Довжини рядків
     реальні, тобто композиція перевіряється чесно, а публічна сторінка
     ніколи не показує несправжніх тверджень про продукт.
     Синтетична історія йде ЗВЕРХУ: порядок сторінки — старіше вище. */
  function inflate(items, target) {
    var quarters = ["Q-1 2025", "Q-2 2025", "Q-3 2025", "Q-4 2025", "Q-1 2026"];
    var need = Math.max(0, target - items.length);
    var per = Math.ceil(need / quarters.length) || 1;
    var extra = [];
    for (var i = 0; i < need; i++) {
      var src = items[i % items.length];
      extra.push({
        id: "test-" + i,
        state: "done",
        title: "[тест] " + src.title,
        description: src.description,
        date: quarters[Math.min(quarters.length - 1, Math.floor(i / per))],
        platform: src.platform
      });
    }
    return extra.concat(items);
  }

  /* ---------- 3. Скелетон ----------
     Показується не раніше ніж через --delay-skeleton, резервує
     висоту рядків, тож приходу даних layout не стрибає (критерій 19). */

  function showSkeleton() {
    // 1) hero: резерв уже стоїть у CSS, скелетон лише робить очікування
    //    зрозумілим, а не порожнім
    var hero = document.querySelector(".rm-hero__in");
    if (hero && !hero.querySelector(".rm-sk--hero")) {
      var hs = h("div", "rm-sk rm-sk--hero");
      hs.setAttribute("aria-hidden", "true");
      for (var k = 0; k < 3; k++) hs.appendChild(h("div", "rm-sk__hl"));
      hs.appendChild(h("div", "rm-sk__ld"));
      var cns = h("div", "rm-sk__cns");
      for (var c = 0; c < 3; c++) cns.appendChild(h("div", "rm-sk__cn"));
      hs.appendChild(cns);
      hero.appendChild(hs);
    }

    // 2) стрічка
    var wrap = h("div", "rm-sk", null);
    wrap.setAttribute("aria-hidden", "true");
    var rows = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sk-rows"), 10) || 6;
    for (var i = 0; i < rows; i++) {
      var r = h("div", "rm-sk__row");
      r.appendChild(h("div", "rm-sk__t"));
      r.appendChild(h("div", "rm-sk__d"));
      wrap.appendChild(r);
    }
    el.sections.appendChild(wrap);
    el.timeline.classList.add("is-loading");
  }

  /* ---------- 4. Головна збірка ---------- */

  function build(data) {
    var c = data.copy;
    COPY = c;
    document.title = c.pageTitle;
    var heroSk = document.querySelector(".rm-sk--hero");
    if (heroSk) heroSk.remove();

    /* --- шапка: куди повертатись --- */
    var from = Q.get("from");
    if (!from && document.referrer && /architect/i.test(document.referrer)) from = "architect";
    var isArchitect = from === "architect";
    el.backLabel.textContent = isArchitect ? c.backArchitect : c.backAcademy;
    el.backLink.setAttribute("href", isArchitect ? ROOT + "architect.html" : ROOT + "index.html");
    // ВИПРАВЛЕНО агентом №4: сторінка спільна, футер був один і завжди казав
    // «AI Академія» — навіть людині, яка прийшла з AI Architect. На спільній
    // сторінці це читається як «мене занесло не туди».
    document.querySelectorAll("[data-brand]").forEach(function (n) {
      n.textContent = isArchitect ? "AI Architect" : "AI Академія";
    });
    document.querySelectorAll("[data-brand-back]").forEach(function (a) {
      a.setAttribute("href", isArchitect ? ROOT + "architect.html" : ROOT + "index.html");
    });

    /* --- hero --- */
    el.heroEyebrow.appendChild(document.createTextNode(c.eyebrow));
    c.headline.forEach(function (line, i) {
      var span = h("span", "rm-hl");
      span.style.setProperty("--i", i);
      span.appendChild(h("span", "rm-hl__in", line));
      el.heroTitle.appendChild(span);
    });
    el.heroLead.textContent = c.lead;
    el.heroUpdated.textContent = data.meta.updatedLabel;

    /* --- розкладка по станах --- */
    var byState = {};
    SECTION_ORDER.forEach(function (s) { byState[s] = []; });
    byState.dropped = [];
    (data.items || []).forEach(function (it) {
      (byState[it.state] || (byState[it.state] = [])).push(it);
    });

    /* Порожній роадмап цілком — окремий стан, а не 404 */
    if (!data.items || !data.items.length) {
      renderEmpty(c);
      return;
    }

    /* --- лічильники (числа рахуються, а не пишуться) --- */
    [["done", byState.done.length], ["progress", byState.progress.length], ["ahead", byState.ahead.length]]
      .forEach(function (pair) {
        var box = h("div", "rm-count rm-count--" + pair[0]);
        box.appendChild(h("dt", "rm-count__label", c.counters[pair[0]]));
        var dd = h("dd", "rm-count__num");
        dd.setAttribute("data-count", pair[1]);
        dd.textContent = "0";
        box.appendChild(dd);
        el.heroCounts.appendChild(box);
      });

    /* --- секції --- */
    el.sections.innerHTML = "";
    VIEW_ORDER.forEach(function (state) {
      var items = byState[state] || [];
      // «передумали» їдуть усередину «Зроблено», у своєму кварталі
      if (state === "done" && byState.dropped.length) {
        items = items.concat(byState.dropped).sort(function (a, b) {
          return quarterKey(b.date) - quarterKey(a.date);
        });
      }
      if (state === "progress" && !items.length) {
        el.sections.appendChild(sectionEmptyProgress(c, byState.done[0], data));
        return;
      }
      if (!items.length) return;
      el.sections.appendChild(section(state, items, c, data));
    });

    /* --- кінцівка --- */
    renderOutro(c, data.links);

    el.timeline.classList.remove("is-loading");
    document.documentElement.classList.add("rm-ready");

    /* --- deep-link: якщо прийшли з якорем, картку показуємо одразу --- */
    var anchored = null;
    if (location.hash.length > 1) {
      anchored = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (anchored && anchored.classList.contains("rm-row")) {
        anchored.classList.add("is-anchored", "is-in");
        requestAnimationFrame(function () {
          anchored.scrollIntoView({ block: "center", behavior: "auto" });
        });
      }
    }

    document.dispatchEvent(new CustomEvent("rm:rendered", { detail: { data: data, byState: byState } }));
  }

  /* ---------- 5. Секція ---------- */

  function section(state, items, c, data) {
    var meta = c.sections[state];
    var sec = h("section", "rm-sec rm-sec--" + state);
    sec.id = "sec-" + state;
    sec.setAttribute("aria-labelledby", "sec-" + state + "-t");
    sec.setAttribute("data-state", state);

    var head = h("div", "rm-sec__head");
    var title = h("h2", "rm-sec__title", meta.title);
    title.id = "sec-" + state + "-t";
    head.appendChild(title);
    head.appendChild(h("p", "rm-sec__note", meta.note));
    var cnt = h("p", "rm-sec__count");
    cnt.appendChild(sr("Пунктів у секції: "));
    cnt.appendChild(document.createTextNode(String(items.length)));
    head.appendChild(cnt);
    sec.appendChild(head);

    var body = h("div", "rm-sec__body");

    if (state === "done") {
      // Стиснення історії: групування по кварталах, усе старше за два
      // найсвіжіші квартали — згорнуте (критерій 16).
      var groups = groupByQuarter(items);
      groups.forEach(function (g, gi) {
        body.appendChild(quarterGroup(g, gi >= 2, c, gi));
      });
    } else {
      body.appendChild(rowList(items, c, state, "h3"));
    }

    sec.appendChild(body);
    return sec;
  }

  function quarterKey(d) {
    if (!d) return -1;
    var m = /Q-(\d)\s+(\d{4})/.exec(d);
    return m ? parseInt(m[2], 10) * 10 + parseInt(m[1], 10) : -1;
  }

  function groupByQuarter(items) {
    var map = [], index = {};
    items.forEach(function (it) {
      var key = it.date || "—";
      if (!(key in index)) { index[key] = map.length; map.push({ label: key, items: [] }); }
      map[index[key]].items.push(it);
    });
    return map;
  }

  function quarterGroup(g, collapsed, c, gi) {
    var wrap = h("div", "rm-group");
    var listId = "grp-" + gi;
    var head = h("h3", "rm-group__head");
    var gAnchor = h("span", "rm-row__anchor");
    gAnchor.setAttribute("aria-hidden", "true");
    gAnchor.setAttribute("data-anchor", "group");
    head.appendChild(gAnchor);

    if (collapsed) {
      var btn = h("button", "rm-group__btn");
      var cnt = g.items.length + " " + plural(g.items.length, c.groupCount);
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", listId);
      // Без явного aria-label скрінрідер читає злиплий рядок
      // «Q-1 20261 пункт+» — перевірено в браузері.
      btn.setAttribute("aria-label", c.groupToggleOpen + " " + cnt + " за " + g.label);
      btn.appendChild(h("span", "rm-group__label", g.label));
      btn.appendChild(h("span", "rm-group__meta",
        g.items.length + " " + plural(g.items.length, c.groupCount)));
      btn.appendChild(h("span", "rm-group__chev", "+"));
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        btn.querySelector(".rm-group__chev").textContent = open ? "+" : "−";
        btn.setAttribute("aria-label", (open ? c.groupToggleOpen : c.groupToggleClose) + " " + cnt + " за " + g.label);
        wrap.classList.toggle("is-open", !open);
        list.hidden = open;
        document.dispatchEvent(new CustomEvent("rm:relayout", {
          detail: { list: list, opened: !open }
        }));
      });
      head.appendChild(btn);
    } else {
      head.appendChild(h("span", "rm-group__label", g.label));
      head.appendChild(h("span", "rm-group__meta",
        g.items.length + " " + plural(g.items.length, c.groupCount)));
    }

    wrap.appendChild(head);
    var list = rowList(g.items, c, "done", "h4");
    list.id = listId;
    if (collapsed) { list.hidden = true; wrap.classList.add("is-collapsed"); }
    wrap.appendChild(list);
    return wrap;
  }

  /* ВИПРАВЛЕНО агентом №4. Було: назва пункту завжди <h4>, тому в секціях
     «В роботі» і «Попереду» дерево заголовків стрибало h2 → h4 (h3 там немає,
     бо квартальних груп там немає). Перевірено обходом DOM: два стрибки.
     Стало: рівень передається зверху — h4 усередині квартальної групи (де h3 є),
     h3 у секціях без груп. */
  function rowList(items, c, state, level) {
    var ol = h("ol", "rm-rows rm-rows--" + state);
    items.forEach(function (it) { ol.appendChild(row(it, c, level || "h3")); });
    return ol;
  }

  /* ---------- 6. Рядок-пункт — атом сторінки ----------
     Структура ОДНАКОВА в усіх станах: змінюється акцент, не сутність.
     Той самий пункт, переїхавши «попереду» → «в роботі» → «зроблено»,
     лишається впізнаваним (критерій 7).                              */

  function row(it, c, hTag) {
    var li = h("li", "rm-row rm-row--" + it.state);
    li.id = it.id;
    if (it.state === "progress") li.setAttribute("aria-current", "step");

    // точка, у якій змійка перетинає пункт; вимірюється в motion.js
    var anchor = h("span", "rm-row__anchor");
    anchor.setAttribute("aria-hidden", "true");
    anchor.setAttribute("data-anchor", it.state);
    li.appendChild(anchor);

    var main = h("div", "rm-row__main");
    main.appendChild(h(hTag || "h3", "rm-row__title", it.title));
    if (it.description) main.appendChild(h("p", "rm-row__desc", it.description));
    li.appendChild(main);

    // Мета-колонка: стан + час одним рядком, платформа другим.
    // Стан тут — ТЕКСТ, а не лише колір і не лише рух (критерій 6).
    var meta = h("div", "rm-row__meta");

    var line = h("p", "rm-row__state");
    line.appendChild(sr("Стан: "));
    line.appendChild(h("span", "rm-row__state-word", c.stateLabels[it.state]));
    line.appendChild(h("span", "rm-row__dot", "·"));
    var t = h("time", "rm-row__date", it.date || c.noDate);
    if (it.date) t.setAttribute("datetime", isoFromQuarter(it.date));
    line.appendChild(sr(it.date ? "орієнтир " : ""));
    line.appendChild(t);
    meta.appendChild(line);

    var plat = h("p", "rm-row__plat");
    plat.appendChild(sr("Платформа: "));
    plat.appendChild(h("span", "rm-row__plat-mark rm-row__plat-mark--" + it.platform, null));
    plat.appendChild(document.createTextNode(c.platformLabels[it.platform]));
    plat.querySelector(".rm-row__plat-mark").setAttribute("aria-hidden", "true");
    meta.appendChild(plat);

    li.appendChild(meta);

    // ПРАВКА 1 (рішення власника 7.4) — ЄДИНА дозволена правка проти макета.
    // Контрол «#» рендериться лише для «В роботі» і «Попереду»: у «Зроблено»
    // він давав ~30 зайвих зупинок Tab на пунктах, посилання на які нікому
    // не потрібне. Якір на пункт (li.id) лишається робочим у ВСІХ станах —
    // зникає тільки кнопка копіювання. CSS .rm-row__link не змінений.
    if (it.state === "progress" || it.state === "ahead") {
      var link = h("button", "rm-row__link");
      link.type = "button";
      link.setAttribute("aria-label", c.copyLink + ": " + it.title);
      link.appendChild(h("span", "rm-row__link-glyph", "#"));
      link.addEventListener("click", function () {
        var url = location.origin + location.pathname + "#" + it.id;
        history.replaceState(null, "", "#" + it.id);
        // ВИПРАВЛЕНО агентом №4: раніше «Посилання скопійовано» казалось навіть
        // тоді, коли writeText відхилявся (немає дозволу, не secure context).
        // Обіцяти скрінрідеру те, чого не сталось, — це не дрібниця.
        function ok() {
          say(c.copyLinkDone);
          link.classList.add("is-done");
          setTimeout(function () { link.classList.remove("is-done"); }, 1200);
        }
        function fail() { say(c.copyLinkFail || "Не вдалося скопіювати. Посилання в адресному рядку."); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(ok, fail);
        } else { fail(); }
      });
      li.appendChild(link);
    }

    return li;
  }

  function isoFromQuarter(d) {
    var m = /Q-(\d)\s+(\d{4})/.exec(d);
    if (!m) return "";
    return m[2] + "-" + String((parseInt(m[1], 10) - 1) * 3 + 1).padStart(2, "0");
  }

  /* ---------- 7. Порожня «В роботі» ----------
     Секція НІКОЛИ не показує порожнечу: на її місце стає найсвіжіший
     завершений пункт із міткою «щойно завершили», плюс чесна фраза і
     запрошення вплинути на вибір. Доказ життя (loop M7) переїжджає
     сюди, а не зникає (критерій 17).                                  */

  function sectionEmptyProgress(c, latestDone, data) {
    var sec = h("section", "rm-sec rm-sec--progress rm-sec--empty");
    sec.id = "sec-progress";
    sec.setAttribute("aria-labelledby", "sec-progress-t");
    sec.setAttribute("data-state", "progress");

    var head = h("div", "rm-sec__head");
    var title = h("h2", "rm-sec__title", c.sections.progress.title);
    title.id = "sec-progress-t";
    head.appendChild(title);
    head.appendChild(h("p", "rm-sec__note", c.sections.progress.note));
    sec.appendChild(head);

    var body = h("div", "rm-sec__body");
    var box = h("div", "rm-void");

    var anchor = h("span", "rm-row__anchor");
    anchor.setAttribute("aria-hidden", "true");
    anchor.setAttribute("data-anchor", "progress");
    box.appendChild(anchor);

    var main = h("div", "rm-row__main");
    main.appendChild(h("p", "rm-void__eyebrow", c.progressEmptyEyebrow));
    if (latestDone) main.appendChild(h("h3", "rm-row__title", latestDone.title));
    main.appendChild(h("p", "rm-row__desc", c.progressEmptyText));
    var cta = h("button", "rm-cta rm-cta--ghost", c.progressEmptyCta);
    cta.type = "button";
    cta.addEventListener("click", openContact);
    main.appendChild(cta);
    box.appendChild(main);

    var meta = h("div", "rm-row__meta");
    var line = h("p", "rm-row__state");
    line.appendChild(sr("Стан: "));
    line.appendChild(h("span", "rm-row__state-word", c.progressEmptyTitle));
    meta.appendChild(line);
    box.appendChild(meta);

    body.appendChild(box);
    sec.appendChild(body);
    return sec;
  }

  /* ---------- 8. Кінцівка ---------- */

  function renderOutro(c, links) {
    var o = c.outro;
    el.outro.hidden = false;
    var inn = h("div", "rm-outro__in");
    inn.appendChild(h("p", "rm-eyebrow", "// " + o.eyebrow));
    var t = h("h2", "rm-outro__title", o.title);
    t.id = "outroTitle";
    inn.appendChild(t);
    inn.appendChild(h("p", "rm-outro__text", o.text));

    var actions = h("div", "rm-outro__actions");
    var main = h("button", "rm-cta", o.cta);
    main.type = "button";
    main.id = "outroContact";
    main.addEventListener("click", openContact);
    actions.appendChild(main);

    // Порожні канали не лишають дірок у сітці: їх просто немає в DOM.
    [["github", o.githubLabel], ["telegram", o.telegramLabel]].forEach(function (pair) {
      var url = links && links[pair[0]];
      if (!url) return;
      var a = h("a", "rm-chan", pair[1]);
      a.href = url;
      a.appendChild(h("span", "rm-chan__arrow", "↗"));
      actions.appendChild(a);
    });

    inn.appendChild(actions);
    el.outro.appendChild(inn);
  }

  /* ПРАВКА 3. Реальна модалка замість тоста макета. js/contact.js
     публікує window.AIAContact = { open: openModal } — роадмапу потрібні
     чотири точки виклику (футер, кінцівка, порожня «В роботі», панель
     помилки), а сам contact.js звʼязує лише #contactTrigger.
     Якщо модалка не піднялась (config.json недоступний) — не робимо
     вигляд, що все гаразд: кажемо про це скрінрідеру й у консоль. */
  function openContact() {
    if (window.AIAContact && window.AIAContact.open) { window.AIAContact.open(); return; }
    if (COPY && COPY.contactUnavailable) say(COPY.contactUnavailable);
    if (window.console) console.warn("[roadmap] модалка «Написати нам» недоступна");
  }
  /* ПРАВКА 5. Слухача на #contactTrigger тут НЕМАЄ: на сайті цю кнопку
     вже слухає js/contact.js (boot() → trigger.addEventListener). Два
     слухачі означали б два виклики openModal() на один клік, тобто
     подвійний resetForm() і подвійний рендер Turnstile. */

  /* ---------- 9. Помилка і порожнеча ---------- */

  function renderError(err) {
    var hsk = document.querySelector(".rm-sk--hero");
    if (hsk) hsk.remove();
    el.timeline.classList.remove("is-loading");
    el.sections.innerHTML = "";
    var box = h("div", "rm-panel is-in");
    box.setAttribute("role", "alert");
    box.appendChild(h("h2", "rm-panel__title", "Не вдалося завантажити план розвитку"));
    box.appendChild(h("p", "rm-panel__text",
      "Дані сторінки лежать в окремому файлі, і він зараз недоступний. Курси працюють як завжди — поверніться до них або напишіть нам."));
    var acts = h("div", "rm-panel__acts");
    var back = h("a", "rm-cta", "До курсу");
    back.href = ROOT + "index.html";
    acts.appendChild(back);
    var write = h("button", "rm-cta rm-cta--ghost", "Написати нам");
    write.type = "button";
    write.addEventListener("click", openContact);
    acts.appendChild(write);
    box.appendChild(acts);
    el.sections.appendChild(box);
    // У стані помилки анімація не грає взагалі.
    document.documentElement.classList.add("rm-error");
    if (window.console) console.warn("[roadmap] дані не завантажились:", err && err.message);
  }

  function renderEmpty(c) {
    el.timeline.classList.remove("is-loading");
    el.sections.innerHTML = "";
    var box = h("div", "rm-panel rm-panel--soft is-in");
    box.appendChild(h("h2", "rm-panel__title", c.emptyTitle));
    box.appendChild(h("p", "rm-panel__text", c.emptyText));
    var acts = h("div", "rm-panel__acts");
    var write = h("button", "rm-cta", c.outro.cta);
    write.type = "button";
    write.addEventListener("click", openContact);
    acts.appendChild(write);
    box.appendChild(acts);
    el.sections.appendChild(box);
    document.documentElement.classList.add("rm-ready");
  }

})();
