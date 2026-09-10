/* ============================================================
   AI Академія — сторінка сертифіката.
   Бере сертифікат(и) користувача з Supabase і дозволяє завантажити
   PDF. Кирилиця + шрифти зберігаються, бо PDF будується з рендеру
   стилізованого блоку (html2canvas → зображення в jsPDF).

   Залежності (підключені в certificate.html):
   • auth.js → window.sb, window.AIA_USER, подія aia:auth
   • jsPDF (window.jspdf), html2canvas (window.html2canvas)
   • qrcode (window.QRCode) — для QR на перевірку
   ============================================================ */
(function () {
  "use strict";

  function $(s, r) { return (r || document).querySelector(s); }

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) { return iso || ""; }
  }

  function verifyUrl(code) {
    return new URL("verify.html", location.href).href + "?code=" + encodeURIComponent(code);
  }

  /* ---------- Бренд курсу ----------
     Сторінка /certificate одна на всі курси, а сертифікат — документ конкретного
     курсу: підпис видавця, медальйон і шапка додатка мають називати той курс,
     який людина справді закінчила. Ключ — courses.slug; значення звірені з
     живою базою через Supabase MCP 2026-09-06
     (select slug, title from courses order by sort_order → ai-essentials,
     ai-architect, claude-code). Назви — дослівно site.name трьох конфігів,
     посилання — лендінг + якір програми (у AI Термінала це #map, бо
     #syllabus на claude-code.html немає). */
  var BRANDS = {
    "ai-essentials": {
      brand: "AI Академія", brandCaps: "AI АКАДЕМІЯ", mono: "AIA",
      home: "index.html", program: "index.html#syllabus",
      accent: "#BF8A3A", accentDeep: "#966400"   /* шафран · --p-accent-academy-500 / -edge */
    },
    "ai-architect": {
      brand: "AI Architect", brandCaps: "AI ARCHITECT", mono: "AIA",
      home: "architect.html", program: "architect.html#syllabus",
      accent: "#1FA68E", accentDeep: "#007D67"   /* патина · --p-accent-architect-500 / -edge */
    },
    "claude-code": {
      brand: "AI Термінал", brandCaps: "AI ТЕРМІНАЛ", mono: "AIT",
      home: "claude-code.html", program: "claude-code.html#map",
      accent: "#7692DC", accentDeep: "#536CB3"   /* лазур · --p-accent-terminal-500 / -edge */
    }
  };
  /* Акцент PDF — рішення власника 2026-09-10 (011, рядок 11): аркуш бере колір
     СВОГО курсу, а не одну теракоту на всіх. Значення — літерали з css/tokens.css
     (500 і edge), бо аркуш малюється офскрин і токени курсу через data-course
     на нього не діють; при зміні токена правити тут. Контраст на папері #F9F3E7:
     edge 4,56–4,61 (AA для дрібного тексту, було 3,90 у теракоти), білий на edge
     5,0–5,1 (монограма медальйона; на 500 було б 3,0), 500 — лише лінії й рамки. */
  var BRAND_FALLBACK = BRANDS["ai-essentials"];

  // Попереджаємо про кожен невідомий слаг один раз на завантаження сторінки:
  // три картки одного курсу не мають давати три однакові рядки в консолі.
  var warnedSlugs = {};

  // Невідомий або порожній слаг НЕ повинен ламати видачу: сертифікат має
  // побудуватись і завантажитись навіть із фолбек-брендом (напр. якщо в базі
  // з'явиться четвертий курс раніше, ніж рядок у цій мапі).
  function brandOf(cert) {
    var slug = (cert && cert.courses && cert.courses.slug) || "";
    var b = BRANDS[slug];
    if (b) return b;
    if (!warnedSlugs[slug]) {
      warnedSlugs[slug] = true;
      console.warn("[AIA cert] невідомий slug курсу:", slug);
    }
    return BRAND_FALLBACK;
  }

  /* ---------- Рендер сторінки ---------- */

  /* ---------- Розмітка сторінки ----------
     010 · етап 8. 101 Tailwind-утиліта карток → ds-card / ds-empty / ds-btn /
     ds-note / ds-skel зі СТАТИЧНОГО css/components.css. ⚠ Жодної
     Tailwind-утиліти: клас, що приходить у DOM лише з JS, CDN генерує через
     ~53 мс (006 D-02). Відступи — інлайновими style із токенів --s-*,
     так само як у js/verify.js. */
  var MT = function (n) { return ' style="margin-top:var(--s-' + n + ')"'; };

  function renderLoggedOut() {
    var body = $("#certBody");
    if (!body) return;
    body.innerHTML =
      '<div class="ds-empty">' +
        '<p class="ds-h4">Спершу увійди</p>' +
        '<p class="ds-small">Сертифікати прив\'язані до акаунта. Увійди, щоб переглянути свої.</p>' +
        '<button type="button" id="certLogin" class="ds-btn ds-btn--primary">Увійти або зареєструватися</button>' +
      '</div>';
    var b = $("#certLogin");
    if (b) b.addEventListener("click", function () { if (window.AIAAuth) window.AIAAuth.open(); });
  }

  function renderEmpty() {
    var body = $("#certBody");
    if (!body) return;
    body.innerHTML =
      '<div class="ds-empty">' +
        '<p class="ds-h4">Сертифіката ще немає</p>' +
        '<p class="ds-small">Проходь модулі по черзі — щойно завершиш останній модуль курсу, сертифікат з\'явиться тут автоматично.</p>' +
        /* 011 · рядок 18, четверте рішення власника. Бренд сторінки /certificate
           визначає ТОЧКА ВХОДУ, і його кладе інлайн у certificate.html у
           window.AIA_CERT (?from= → referrer → sessionStorage aia:certFrom).
           Тут потрібне лише посилання на програму того курсу, звідки прийшла
           людина: у цьому стані сертифікатів немає взагалі, тож питати «курс
           сертифіката» нема в кого. ⚠ Це НЕ мапа BRANDS вище: там ключ —
           courses.slug документа з бази (ai-essentials/ai-architect/claude-code),
           тут — звідки прийшов відвідувач. Дві різні відповіді на два різні
           питання. Без інлайну (старий кеш HTML, вимкнений JS у шапці) — фолбек
           на Академію, як було до правки. */
        '<a href="' + esc((window.AIA_CERT && window.AIA_CERT.program) || "index.html#syllabus") +
        '" class="ds-btn ds-btn--secondary">До програми курсу →</a>' +
      '</div>';
  }

  /* Скелетон РОЗМІРУ МАЙБУТНЬОЇ КАРТКИ, тому CLS = 0 (кадр T7 пакета). */
  function renderLoading() {
    var body = $("#certBody");
    if (!body) return;
    body.innerHTML =
      '<div class="ds-card">' +
        '<span class="ds-skel ds-skel--name" style="display:block" aria-hidden="true"></span>' +
        '<span class="ds-skel ds-skel--certs" style="display:block;margin-top:var(--s-4)" aria-hidden="true"></span>' +
        '<p class="ds-small"' + MT(4) + '>Завантажуємо…</p>' +
      '</div>';
  }

  function renderLoadError() {
    var body = $("#certBody");
    if (!body) return;
    body.innerHTML =
      '<div class="ds-note ds-note--err" role="alert">' +
        '<span class="ds-note__glyph" aria-hidden="true">✕</span>' +
        '<p class="ds-note__title">Не вдалося завантажити сертифікати</p>' +
        '<p>Онови сторінку. Якщо не допомогло — сертифікат нікуди не подівся, напиши нам.</p>' +
      '</div>';
  }

  function certCard(cert) {
    var course = (cert.courses && cert.courses.title) || "Курс";
    var b = brandOf(cert);
    return (
      '<article class="ds-card">' +
        '<p class="ds-eyebrow">Сертифікат</p>' +
        '<h2 class="ds-h3"' + MT(1) + '>' + esc(course) + '</h2>' +
        '<p class="ds-small"' + MT(2) + '>Видано ' + esc(fmtDate(cert.issued_at)) + '</p>' +
        '<p class="ds-small"' + MT(1) + '>Код <code class="ds-code--inline">' + esc(cert.public_code) + '</code></p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:var(--s-2);margin-top:var(--s-6)">' +
          '<button type="button" data-cert="' + esc(cert.public_code) + '" class="cert-dl ds-btn ds-btn--primary">Завантажити PDF</button>' +
          '<a href="' + esc(verifyUrl(cert.public_code)) + '" target="_blank" rel="noopener" class="ds-btn ds-btn--secondary">Сторінка перевірки ↗</a>' +
          '<a href="' + esc(b.program) + '" class="ds-btn ds-btn--quiet">До програми курсу →</a>' +
        '</div>' +
        /* Імʼя — знімок, а не посилання на профіль (звірено з живою базою
           2026-08-25: maybe_issue_certificate вставляє full_name через
           on conflict do nothing). Сказано словами, бо інакше людина міняє
           імʼя в профілі й чекає, що PDF зміниться. Форма — з кадру T7. */
        '<p class="ds-small"' + MT(6) + '>Імʼя на сертифікаті — <strong>' + esc(cert.full_name || "Студент") +
          '</strong> — записане в момент видачі. Зміна імені в профілі його не переписує: ' +
          'для перевидачі напиши нам.</p>' +
      '</article>'
    );
  }

  function renderCerts(certs) {
    var body = $("#certBody");
    if (!body) return;
    body.innerHTML = certs.map(certCard).join("");
    body.querySelectorAll(".cert-dl").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cert = certs.filter(function (c) { return c.public_code === btn.getAttribute("data-cert"); })[0];
        if (cert) downloadPdf(cert, btn);
      });
    });
  }

  /* ---------- Завантаження даних ---------- */

  // Для якого user.id дані вже тягнули. Подія aia:auth прилітає двічі підряд
  // (refreshSession і onAuthStateChange у js/auth.js), а слухач на цій сторінці
  // один — без прапорця це два однакові GET certificates на кожне завантаження.
  var loadedFor = null;

  function load() {
    var uid = window.AIA_USER ? window.AIA_USER.id : null;
    // Вихід скидає кеш: інакше вхід іншим акаунтом у тій самій вкладці
    // показав би дані попереднього з пам'яті.
    if (!uid) { loadedFor = null; renderLoggedOut(); return; }
    if (!window.sb) return;
    if (uid === loadedFor) return;
    // Прапорець ставиться ДО запиту, а не в .then: обидві події прилітають
    // раніше, ніж повернеться відповідь, і прапорець «після» не рятує взагалі.
    loadedFor = uid;
    renderLoading();

    window.sb
      .from("certificates")
      .select("public_code, full_name, issued_at, course_id, courses(title, slug)")
      .order("issued_at", { ascending: false })
      .then(function (res) {
        if (res.error) throw res.error;
        var rows = res.data || [];
        if (!rows.length) renderEmpty();
        else renderCerts(rows);
      })
      .catch(function (e) {
        // Знімаємо прапорець, щоб наступний aia:auth (або повторний вхід)
        // мав право спробувати ще раз.
        loadedFor = null;
        console.error("[AIA cert]", e.message || e);
        renderLoadError();
      });
  }

  /* ---------- Побудова й завантаження PDF ---------- */

  /* ---------- ПАЛІТРА АРКУША PDF ----------
     010 · етап 8. Було 43 хекс-літерали (плюс один #fff), розкидані по трьох
     будівниках. Стало — ОДНЕ читання токенів на генерацію, з кешем на весь
     час життя сторінки: getComputedStyle у циклі рядків додатка коштував би
     relayout на кожен модуль курсу.

     ⚠ Що читається з CSS: рівно чотири --c-paper-* (фон, текст, тихий текст,
     хайрлайн) — саме те, що назване в docs/js-diff.md. `--c-paper-quiet` у
     системі СВІДОМО темніший за старий #8a7f6f (4.68 проти 3.58 на папері,
     див. коментар у css/tokens.css), тобто дрібний текст додатка стане
     контрастнішим. Це не побічний ефект, а сенс міграції.

     ⚠ Акценту тут більше немає: з 2026-09-10 він у BRANDS (accent / accentDeep),
     бо залежить від курсу. До того аркуш був теракотовим (#D97757 / #BD5F40) для
     всіх трьох курсів — так затвердили в 005; власник змінив це в 011 (рядок 11). */
  var PDF = {
    stripe:     "#F2EBDB",   /* зебра рядків додатка; тон між фоном і хайрлайном */
    white:      "#FFFFFF",   /* монограма на заливці медальйона */
    gold: {                  /* золота медаль-водяний знак: декор, не палітра */
      light: "#ECD06A", mid: "#C9A227", dark: "#9C7A1A",
      ring:  "#D9B441", star: "#FFF7DF"
    }
  };

  var paperCache = null;

  function paper() {
    if (paperCache) return paperCache;
    var cs = window.getComputedStyle(document.documentElement);
    var v = function (name, fallback) {
      var raw = (cs.getPropertyValue(name) || "").trim();
      return raw || fallback;
    };
    paperCache = {
      /* Фолбеки = поточні значення css/tokens.css. Спрацюють лише якщо токени
         не завантажились узагалі — тоді PDF однаково згенерується. */
      bg:    v("--c-paper-bg",    "#F9F3E7"),
      text:  v("--c-paper-text",  "#231D18"),
      quiet: v("--c-paper-quiet", "#746C62"),
      rule:  v("--c-paper-rule",  "#CCC4BC")
    };
    return paperCache;
  }

  // Спільна «оболонка» аркуша A4 (альбомна): кремовий фон, подвійна рамка,
  // кутові акценти. Усередині — центрований контент.
  function pageShell(contentHtml, b) {
    var P = paper();
    var node = document.createElement("div");
    node.style.cssText = [
      "position:fixed", "left:-99999px", "top:0",
      "width:1123px", "height:794px", "background:" + P.bg, "color:" + P.text,
      "font-family:'IBM Plex Sans',system-ui,sans-serif", "box-sizing:border-box", "padding:34px"
    ].join(";");

    var corner = function (pos) {
      var base = "position:absolute;width:26px;height:26px;border-color:" + b.accent + ";border-style:solid;border-width:0;";
      var m = {
        tl: "top:14px;left:14px;border-top-width:2px;border-left-width:2px;",
        tr: "top:14px;right:14px;border-top-width:2px;border-right-width:2px;",
        bl: "bottom:14px;left:14px;border-bottom-width:2px;border-left-width:2px;",
        br: "bottom:14px;right:14px;border-bottom-width:2px;border-right-width:2px;"
      };
      return '<div style="' + base + m[pos] + '"></div>';
    };

    node.innerHTML =
      '<div style="position:relative;height:100%;box-sizing:border-box;border:1.5px solid ' + b.accent + ';overflow:hidden">' +
        '<div style="position:absolute;inset:6px;border:1px solid ' + P.rule + ';pointer-events:none"></div>' +
        corner("tl") + corner("tr") + corner("bl") + corner("br") +
        medalWatermark() +
        '<div style="position:relative;z-index:1;height:100%;box-sizing:border-box;padding:50px 76px;display:flex;flex-direction:column;align-items:center;text-align:center">' +
          contentHtml +
        '</div>' +
      '</div>';
    return node;
  }

  function medallion(b) {
    var P = paper();
    return (
      '<div style="display:flex;flex-direction:column;align-items:center">' +
        '<div style="width:76px;height:76px;border-radius:50%;border:2px solid ' + b.accent + ';display:flex;align-items:center;justify-content:center">' +
          '<div style="width:56px;height:56px;border-radius:50%;background:' + b.accentDeep + ';display:flex;align-items:center;justify-content:center;font-family:\'IBM Plex Mono\',monospace;font-weight:600;font-size:18px;color:' + PDF.white + ';letter-spacing:.05em">' + esc(b.mono) + '</div>' +
        '</div>' +
        '<p style="margin:9px 0 0;font-family:\'IBM Plex Mono\',monospace;letter-spacing:.34em;font-size:11px;color:' + P.quiet + '">' + esc(b.brandCaps) + '</p>' +
      '</div>'
    );
  }

  // Золота медаль як делікатний водяний знак на фоні аркуша (символічно).
  function medalWatermark() {
    var ribbon = "position:absolute;bottom:40px;width:50px;height:140px;border-radius:6px;";
    return (
      '<div style="position:absolute;top:46%;left:50%;transform:translate(-50%,-50%);' +
        'width:300px;height:320px;opacity:0.08;pointer-events:none;display:flex;align-items:center;justify-content:center">' +
        '<div style="' + ribbon + 'left:84px;background:' + PDF.gold.mid + ';transform:rotate(16deg)"></div>' +
        '<div style="' + ribbon + 'right:84px;background:' + PDF.gold.dark + ';transform:rotate(-16deg)"></div>' +
        '<div style="position:relative;width:220px;height:220px;border-radius:50%;' +
          'background:radial-gradient(circle at 50% 36%, ' + PDF.gold.light + ', ' + PDF.gold.mid + ' 58%, ' + PDF.gold.dark + ');' +
          'display:flex;align-items:center;justify-content:center">' +
          '<div style="width:172px;height:172px;border-radius:50%;border:6px solid ' + PDF.gold.ring + ';' +
            'display:flex;align-items:center;justify-content:center">' +
            '<span style="font-family:Georgia,serif;font-size:110px;line-height:1;color:' + PDF.gold.star + '">★</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function buildCertNode(cert, qrDataUrl) {
    var P = paper();
    var course = (cert.courses && cert.courses.title) || "Курс";
    var b = brandOf(cert);
    var vurl = verifyUrl(cert.public_code);
    return pageShell(
      medallion(b) +
      '<h1 style="margin:22px 0 0;font-family:Literata,Georgia,serif;font-size:54px;font-weight:700;letter-spacing:.01em;line-height:1.18">Сертифікат</h1>' +
      '<p style="margin:16px 0 0;font-family:\'IBM Plex Mono\',monospace;letter-spacing:.26em;font-size:12px;color:' + b.accentDeep + '">ПРО УСПІШНЕ ПРОХОДЖЕННЯ КУРСУ</p>' +
      '<p style="margin:38px 0 0;font-family:Literata,Georgia,serif;font-style:italic;font-size:19px;color:' + P.quiet + '">цей сертифікат вручається</p>' +
      '<p style="margin:14px 0 0;font-family:Literata,Georgia,serif;font-size:44px;font-weight:600;color:' + P.text + ';line-height:1.22">' + esc(cert.full_name || "Студент") + '</p>' +
      '<div style="width:280px;height:1px;background:' + b.accent + ';margin:18px 0 0"></div>' +
      '<p style="margin:22px 0 0;font-size:16px;color:' + P.quiet + '">за успішне завершення курсу</p>' +
      '<p style="margin:8px 0 0;font-family:Literata,Georgia,serif;font-size:30px;font-weight:600;color:' + b.accentDeep + '">«' + esc(course) + '»</p>' +
      '<div style="margin-top:auto;width:100%">' +
        '<div style="display:flex;align-items:flex-end;justify-content:space-between">' +
          '<div style="text-align:left">' +
            '<p style="margin:0;font-family:Literata,Georgia,serif;font-style:italic;font-size:20px;color:' + P.text + '">' + esc(b.brand) + '</p>' +
            '<div style="width:172px;height:1px;background:' + P.rule + ';margin:6px 0 0"></div>' +
            '<p style="margin:7px 0 0;font-size:12px;color:' + P.quiet + '">Команда курсу · ' + esc(fmtDate(cert.issued_at)) + '</p>' +
          '</div>' +
          // data-verify-link: поверх цих двох блоків у PDF ляже клікабельна
          // анотація на сторінку перевірки (див. verifyLinkAreas). Геометрія
          // не дублюється числами — вона рахується з цих же елементів.
          '<div data-verify-link style="text-align:center">' +
            (qrDataUrl ? '<img src="' + qrDataUrl + '" width="92" height="92" style="display:block;margin:0 auto" alt="QR" />' : '<div style="width:92px;height:92px"></div>') +
            '<p style="margin:7px 0 0;font-family:\'IBM Plex Mono\',monospace;font-size:11px;letter-spacing:.12em;color:' + P.quiet + '">КОД ПЕРЕВІРКИ</p>' +
            '<p style="margin:2px 0 0;font-family:\'IBM Plex Mono\',monospace;font-size:13px;color:' + P.text + '">' + esc(cert.public_code) + '</p>' +
          '</div>' +
        '</div>' +
        '<p data-verify-link style="margin:16px 0 0;text-align:center;font-family:\'IBM Plex Mono\',monospace;font-size:11px;color:' + P.quiet + ';word-break:break-all">Перевірити справжність: ' + esc(vurl) + '</p>' +
      '</div>',
      b
    );
  }

  function makeQr(text) {
    var P = paper();
    try {
      if (window.QRCode && typeof window.QRCode.toDataURL === "function") {
        return window.QRCode
          .toDataURL(text, { margin: 1, width: 220, color: { dark: P.text, light: P.bg } })
          .then(function (u) { return u; })
          .catch(function (e) { console.warn("[AIA qr]", e && e.message || e); return null; });
      }
    } catch (e) { console.warn("[AIA qr]", e && e.message || e); }
    console.warn("[AIA qr] бібліотека QRCode недоступна");
    return Promise.resolve(null);
  }

  // Чекаємо, поки зображення (QR) реально завантажиться, перш ніж знімати канвас.
  function waitImages(node) {
    var imgs = Array.prototype.slice.call(node.querySelectorAll("img"));
    return Promise.all(imgs.map(function (img) {
      if (img.complete && img.naturalWidth) return Promise.resolve();
      return new Promise(function (res) { img.onload = res; img.onerror = res; });
    }));
  }

  // Результати по модулях курсу: найкращий бал квіза по кожній темі.
  function fetchTranscript(courseId) {
    return window.sb
      .from("modules")
      .select("number, title, progress(best_score, status)")
      .eq("course_id", courseId)
      .order("number", { ascending: true })
      .then(function (res) {
        if (res.error) throw res.error;
        return (res.data || []).map(function (m) {
          var pr = (m.progress && m.progress[0]) || null;
          return {
            number: m.number,
            title: m.title,
            score: pr && pr.best_score != null ? pr.best_score : null,
            done: !!(pr && pr.status === "completed")
          };
        });
      });
  }

  function buildTranscriptNode(cert, rows) {
    var P = paper();
    var course = (cert.courses && cert.courses.title) || "Курс";
    var b = brandOf(cert);
    var scored = rows.filter(function (r) { return r.score != null; });
    var avg = scored.length ? Math.round(scored.reduce(function (s, r) { return s + r.score; }, 0) / scored.length) : 0;

    function tRow(r, gi) {
      var pct = r.score != null ? Math.max(0, Math.min(100, r.score)) : 0;
      var label = r.score != null ? r.score + "%" : "—";
      var num = String(r.number).padStart(2, "0");
      var bg = gi % 2 ? PDF.stripe : "transparent";
      return (
        '<div style="display:flex;align-items:center;gap:9px;padding:4px 9px;background:' + bg + ';border-radius:5px">' +
          '<span style="font-family:\'IBM Plex Mono\',monospace;font-size:11px;color:' + b.accentDeep + ';width:20px;flex-shrink:0">' + num + '</span>' +
          '<span style="flex:1;font-size:12px;color:' + P.text + ';text-align:left;line-height:1.25">' + esc(r.title) + '</span>' +
          '<span style="width:64px;height:6px;background:' + P.rule + ';border-radius:4px;overflow:hidden;flex-shrink:0"><span style="display:block;height:100%;width:' + pct + '%;background:' + b.accent + '"></span></span>' +
          '<span style="width:36px;text-align:right;font-family:\'IBM Plex Mono\',monospace;font-size:12px;color:' + P.text + ';flex-shrink:0">' + label + '</span>' +
        '</div>'
      );
    }
    var mid = Math.ceil(rows.length / 2);
    var colLeft = rows.slice(0, mid).map(function (r, i) { return tRow(r, i); }).join("");
    var colRight = rows.slice(mid).map(function (r, i) { return tRow(r, i + mid); }).join("");
    var rowsHtml =
      '<div style="display:flex;gap:24px;align-items:flex-start;width:100%">' +
        '<div style="flex:1;display:flex;flex-direction:column;gap:2px">' + colLeft + '</div>' +
        '<div style="flex:1;display:flex;flex-direction:column;gap:2px">' + colRight + '</div>' +
      '</div>';

    return pageShell(
      '<p style="margin:0;font-family:\'IBM Plex Mono\',monospace;letter-spacing:.3em;font-size:11px;color:' + b.accentDeep + '">' + esc(b.brandCaps) + ' · ДОДАТОК</p>' +
      '<h1 style="margin:10px 0 0;font-family:Literata,Georgia,serif;font-size:34px;font-weight:700;line-height:1.1">Результати проходження</h1>' +
      '<p style="margin:6px 0 0;font-size:15px;color:' + P.quiet + '">' + esc(cert.full_name || "Студент") + ' · «' + esc(course) + '»</p>' +
      '<div style="width:100%;margin-top:18px">' + rowsHtml + '</div>' +
      '<div style="margin-top:auto;width:100%;display:flex;justify-content:space-between;align-items:center;padding-top:14px;border-top:1px solid ' + P.rule + '">' +
        '<span style="font-family:\'IBM Plex Mono\',monospace;font-size:12px;color:' + P.quiet + '">Код: ' + esc(cert.public_code) + '</span>' +
        '<span style="font-size:16px;font-weight:500;color:' + P.text + '">Середній результат: <span style="color:' + b.accentDeep + '">' + avg + '%</span></span>' +
      '</div>',
      b
    );
  }

  function fontsReady() {
    return (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  }

  // Геометрія аркуша: вузол шаблона 1123×794 px кладеться в PDF як A4-ландшафт
  // 297×210 мм (це той самий аркуш при 96 dpi, тому пропорції збігаються).
  var PAGE_W_MM = 297;
  var PAGE_H_MM = 210;

  // Якість JPEG для сторінок сертифіката. PNG тут давав ~28 МБ на два аркуші
  // (html2canvas scale:2 → растр ~2246×1588 px без стиснення), а таку пошту
  // частина скриньок просто відкидає. 0.9 — межа, нижче якої моноширинний
  // код перевірки починає «пливти»; це документ, не ілюстрація.
  var JPEG_QUALITY = 0.9;

  // Області першої сторінки, поверх яких лягає клікабельне посилання на
  // перевірку: блок «КОД ПЕРЕВІРКИ» (разом із QR, коли той є) і рядок з URL.
  // Координати рахуються з живого DOM шаблона й переводяться px → мм тим
  // самим коефіцієнтом, яким addImage розтягує канвас на аркуш, — тому
  // область збігається з друком навіть якщо верстку колись зсунуть.
  function verifyLinkAreas(node) {
    var box = node.getBoundingClientRect();
    if (!box.width || !box.height) return [];
    var kx = PAGE_W_MM / box.width;
    var ky = PAGE_H_MM / box.height;
    var pad = 1; // мм запасу з кожного боку — щоб влучити пальцем на телефоні
    var out = [];
    Array.prototype.forEach.call(node.querySelectorAll("[data-verify-link]"), function (el) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      out.push({
        x: Math.max(0, (r.left - box.left) * kx - pad),
        y: Math.max(0, (r.top - box.top) * ky - pad),
        w: r.width * kx + pad * 2,
        h: r.height * ky + pad * 2
      });
    });
    return out;
  }

  function downloadPdf(cert, btn) {
    var P = paper();
    if (!window.jspdf || !window.html2canvas) {
      alert("Бібліотеки для PDF ще вантажаться — спробуй за секунду.");
      return;
    }
    var course = (cert.courses && cert.courses.title) || brandOf(cert).brand;
    var vurl = verifyUrl(cert.public_code);
    var original = btn ? btn.textContent : "";
    if (btn) { btn.disabled = true; btn.textContent = "Готуємо PDF…"; }

    Promise.all([makeQr(vurl), fetchTranscript(cert.course_id)])
      .then(function (arr) {
        var qr = arr[0], rows = arr[1];
        var n1 = buildCertNode(cert, qr);
        var n2 = buildTranscriptNode(cert, rows);
        var areas = [];
        document.body.appendChild(n1);
        document.body.appendChild(n2);

        return fontsReady()
          .then(function () { return waitImages(n1); })
          .then(function () {
            // Міряємо після шрифтів і картинок: до цього моменту текст ще
            // може переверстатись, і область поїхала б повз надрукований URL.
            areas = verifyLinkAreas(n1);
            return window.html2canvas(n1, { scale: 2, backgroundColor: P.bg, useCORS: true });
          })
          .then(function (c1) {
            return window.html2canvas(n2, { scale: 2, backgroundColor: P.bg, useCORS: true }).then(function (c2) {
              n1.remove(); n2.remove();
              var jsPDF = window.jspdf.jsPDF;
              var doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
              // JPEG, а не PNG: обидва канваси знімаються з непрозорим фоном
              // (backgroundColor вище), тому чорних ділянок — типової пастки
              // JPEG на прозорому канвасі — тут не виникає.
              doc.addImage(c1.toDataURL("image/jpeg", JPEG_QUALITY), "JPEG", 0, 0, PAGE_W_MM, PAGE_H_MM);
              // Після html2canvas увесь аркуш — це пікселі, тож URL перевірки
              // не клікнути й не скопіювати: його переписували очима і ловили
              // кириличні двійники латинських літер («сертифікат недійсний»).
              // Анотація-посилання повертає штатний шлях перевірки.
              if (typeof doc.link === "function") {
                areas.forEach(function (a) { doc.link(a.x, a.y, a.w, a.h, { url: vurl }); });
              } else {
                console.warn("[AIA cert pdf] jsPDF без doc.link: посилання на перевірку лишиться лише друкованим текстом");
              }
              doc.addPage();
              doc.addImage(c2.toDataURL("image/jpeg", JPEG_QUALITY), "JPEG", 0, 0, PAGE_W_MM, PAGE_H_MM);
              doc.save("Сертифікат — " + course + ".pdf");
            });
          });
      })
      .catch(function (e) {
        console.error("[AIA cert pdf]", e.message || e);
        alert("Не вдалося згенерувати PDF. Спробуй ще раз.");
      })
      .finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = original; }
      });
  }

  /* ---------- Старт ---------- */

  // Читальний доступ для перевірки бренду з консолі без видачі сертифіката
  // (у certificates немає політики DELETE, тому справжній рядок заради тесту
  // не створюємо). Нічого не пише й не тягне з мережі — лише будує вузол
  // з переданого об'єкта.
  window.AIACert = { brandOf: brandOf, certCard: certCard, buildCertNode: buildCertNode, buildTranscriptNode: buildTranscriptNode };

  document.addEventListener("aia:auth", load);
  document.addEventListener("DOMContentLoaded", function () {
    // Якщо auth.js іще не готовий — покажемо запрошення увійти,
    // подія aia:auth згодом перемалює.
    if (!window.sb) renderLoggedOut();
  });
})();
