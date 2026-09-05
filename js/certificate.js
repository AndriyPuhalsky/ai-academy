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

  /* ---------- Рендер сторінки ---------- */

  function renderLoggedOut() {
    var body = $("#certBody");
    if (!body) return;
    body.innerHTML =
      '<div class="rounded-2xl border border-line bg-surface p-8 text-center">' +
        '<p class="font-display text-2xl">Спершу увійди</p>' +
        '<p class="mt-3 text-muted">Сертифікати прив\'язані до акаунта. Увійди, щоб переглянути свої.</p>' +
        '<button type="button" id="certLogin" class="mt-5 inline-flex rounded-lg bg-clay px-5 py-2.5 font-medium text-ink transition hover:bg-clay-deep">Увійти / зареєструватися</button>' +
      '</div>';
    var b = $("#certLogin");
    if (b) b.addEventListener("click", function () { if (window.AIAAuth) window.AIAAuth.open(); });
  }

  function renderEmpty() {
    var body = $("#certBody");
    if (!body) return;
    body.innerHTML =
      '<div class="rounded-2xl border border-line bg-surface p-8 text-center">' +
        '<p class="font-display text-2xl">Сертифіката ще немає</p>' +
        '<p class="mt-3 text-muted">Проходь модулі по черзі — щойно завершиш останній модуль курсу, сертифікат з\'явиться тут автоматично.</p>' +
        '<a href="index.html#syllabus" class="mt-5 inline-flex rounded-lg border border-line px-5 py-2.5 transition hover:border-clay/60">До програми курсу →</a>' +
      '</div>';
  }

  function certCard(cert) {
    var course = (cert.courses && cert.courses.title) || "Курс";
    return (
      '<div class="rounded-2xl border border-line bg-surface p-6">' +
        '<div class="flex flex-wrap items-start justify-between gap-4">' +
          '<div>' +
            '<p class="font-mono text-xs text-clay">Сертифікат</p>' +
            '<h3 class="mt-1 font-display text-2xl">' + esc(course) + '</h3>' +
            '<p class="mt-1 text-sm text-muted">Видано: ' + esc(fmtDate(cert.issued_at)) + '</p>' +
            '<p class="mt-1 font-mono text-xs text-faint">Код: ' + esc(cert.public_code) + '</p>' +
          '</div>' +
          '<div class="flex flex-col gap-2">' +
            '<button type="button" data-cert="' + esc(cert.public_code) + '" class="cert-dl inline-flex items-center justify-center rounded-lg bg-clay px-5 py-2.5 font-medium text-ink transition hover:bg-clay-deep">Завантажити PDF</button>' +
            '<a href="' + esc(verifyUrl(cert.public_code)) + '" target="_blank" rel="noopener" class="inline-flex items-center justify-center rounded-lg border border-line px-5 py-2.5 text-sm transition hover:border-clay/60">Сторінка перевірки ↗</a>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderCerts(certs) {
    var body = $("#certBody");
    if (!body) return;
    body.innerHTML = '<div class="space-y-4">' + certs.map(certCard).join("") + '</div>';
    body.querySelectorAll(".cert-dl").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cert = certs.filter(function (c) { return c.public_code === btn.getAttribute("data-cert"); })[0];
        if (cert) downloadPdf(cert, btn);
      });
    });
  }

  /* ---------- Завантаження даних ---------- */

  function load() {
    var body = $("#certBody");
    if (!window.AIA_USER) { renderLoggedOut(); return; }
    if (!window.sb) return;
    if (body) body.innerHTML = '<p class="text-muted">Завантажуємо…</p>';

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
        console.error("[AIA cert]", e.message || e);
        if (body) body.innerHTML = '<p class="text-clay">Не вдалося завантажити сертифікати. Онови сторінку.</p>';
      });
  }

  /* ---------- Побудова й завантаження PDF ---------- */

  // Спільна «оболонка» аркуша A4 (альбомна): кремовий фон, подвійна рамка,
  // кутові акценти. Усередині — центрований контент.
  function pageShell(contentHtml) {
    var node = document.createElement("div");
    node.style.cssText = [
      "position:fixed", "left:-99999px", "top:0",
      "width:1123px", "height:794px", "background:#f8f4ec", "color:#2b2620",
      "font-family:'IBM Plex Sans',system-ui,sans-serif", "box-sizing:border-box", "padding:34px"
    ].join(";");

    var corner = function (pos) {
      var base = "position:absolute;width:26px;height:26px;border-color:#D97757;border-style:solid;border-width:0;";
      var m = {
        tl: "top:14px;left:14px;border-top-width:2px;border-left-width:2px;",
        tr: "top:14px;right:14px;border-top-width:2px;border-right-width:2px;",
        bl: "bottom:14px;left:14px;border-bottom-width:2px;border-left-width:2px;",
        br: "bottom:14px;right:14px;border-bottom-width:2px;border-right-width:2px;"
      };
      return '<div style="' + base + m[pos] + '"></div>';
    };

    node.innerHTML =
      '<div style="position:relative;height:100%;box-sizing:border-box;border:1.5px solid #D97757;overflow:hidden">' +
        '<div style="position:absolute;inset:6px;border:1px solid #e6dcca;pointer-events:none"></div>' +
        corner("tl") + corner("tr") + corner("bl") + corner("br") +
        medalWatermark() +
        '<div style="position:relative;z-index:1;height:100%;box-sizing:border-box;padding:50px 76px;display:flex;flex-direction:column;align-items:center;text-align:center">' +
          contentHtml +
        '</div>' +
      '</div>';
    return node;
  }

  function medallion() {
    return (
      '<div style="display:flex;flex-direction:column;align-items:center">' +
        '<div style="width:76px;height:76px;border-radius:50%;border:2px solid #D97757;display:flex;align-items:center;justify-content:center">' +
          '<div style="width:56px;height:56px;border-radius:50%;background:#D97757;display:flex;align-items:center;justify-content:center;font-family:\'IBM Plex Mono\',monospace;font-weight:600;font-size:18px;color:#fff;letter-spacing:.05em">AIA</div>' +
        '</div>' +
        '<p style="margin:9px 0 0;font-family:\'IBM Plex Mono\',monospace;letter-spacing:.34em;font-size:11px;color:#a8997f">AI АКАДЕМІЯ</p>' +
      '</div>'
    );
  }

  // Золота медаль як делікатний водяний знак на фоні аркуша (символічно).
  function medalWatermark() {
    var ribbon = "position:absolute;bottom:40px;width:50px;height:140px;border-radius:6px;";
    return (
      '<div style="position:absolute;top:46%;left:50%;transform:translate(-50%,-50%);' +
        'width:300px;height:320px;opacity:0.08;pointer-events:none;display:flex;align-items:center;justify-content:center">' +
        '<div style="' + ribbon + 'left:84px;background:#c9a227;transform:rotate(16deg)"></div>' +
        '<div style="' + ribbon + 'right:84px;background:#9c7a1a;transform:rotate(-16deg)"></div>' +
        '<div style="position:relative;width:220px;height:220px;border-radius:50%;' +
          'background:radial-gradient(circle at 50% 36%, #ecd06a, #c9a227 58%, #9c7a1a);' +
          'display:flex;align-items:center;justify-content:center">' +
          '<div style="width:172px;height:172px;border-radius:50%;border:6px solid #d9b441;' +
            'display:flex;align-items:center;justify-content:center">' +
            '<span style="font-family:Georgia,serif;font-size:110px;line-height:1;color:#fff7df">★</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function buildCertNode(cert, qrDataUrl) {
    var course = (cert.courses && cert.courses.title) || "Курс";
    var vurl = verifyUrl(cert.public_code);
    return pageShell(
      medallion() +
      '<h1 style="margin:22px 0 0;font-family:Literata,Georgia,serif;font-size:54px;font-weight:700;letter-spacing:.01em;line-height:1.18">Сертифікат</h1>' +
      '<p style="margin:16px 0 0;font-family:\'IBM Plex Mono\',monospace;letter-spacing:.26em;font-size:12px;color:#BD5F40">ПРО УСПІШНЕ ПРОХОДЖЕННЯ КУРСУ</p>' +
      '<p style="margin:38px 0 0;font-family:Literata,Georgia,serif;font-style:italic;font-size:19px;color:#8a7f6f">цей сертифікат вручається</p>' +
      '<p style="margin:14px 0 0;font-family:Literata,Georgia,serif;font-size:44px;font-weight:600;color:#1f1b17;line-height:1.22">' + esc(cert.full_name || "Студент") + '</p>' +
      '<div style="width:280px;height:1px;background:#D97757;margin:18px 0 0"></div>' +
      '<p style="margin:22px 0 0;font-size:16px;color:#8a7f6f">за успішне завершення курсу</p>' +
      '<p style="margin:8px 0 0;font-family:Literata,Georgia,serif;font-size:30px;font-weight:600;color:#BD5F40">«' + esc(course) + '»</p>' +
      '<div style="margin-top:auto;width:100%">' +
        '<div style="display:flex;align-items:flex-end;justify-content:space-between">' +
          '<div style="text-align:left">' +
            '<p style="margin:0;font-family:Literata,Georgia,serif;font-style:italic;font-size:20px;color:#2b2620">AI Академія</p>' +
            '<div style="width:172px;height:1px;background:#cdbfa8;margin:6px 0 0"></div>' +
            '<p style="margin:7px 0 0;font-size:12px;color:#9a8f7f">Команда курсу · ' + esc(fmtDate(cert.issued_at)) + '</p>' +
          '</div>' +
          // data-verify-link: поверх цих двох блоків у PDF ляже клікабельна
          // анотація на сторінку перевірки (див. verifyLinkAreas). Геометрія
          // не дублюється числами — вона рахується з цих же елементів.
          '<div data-verify-link style="text-align:center">' +
            (qrDataUrl ? '<img src="' + qrDataUrl + '" width="92" height="92" style="display:block;margin:0 auto" alt="QR" />' : '<div style="width:92px;height:92px"></div>') +
            '<p style="margin:7px 0 0;font-family:\'IBM Plex Mono\',monospace;font-size:11px;letter-spacing:.12em;color:#9a8f7f">КОД ПЕРЕВІРКИ</p>' +
            '<p style="margin:2px 0 0;font-family:\'IBM Plex Mono\',monospace;font-size:13px;color:#2b2620">' + esc(cert.public_code) + '</p>' +
          '</div>' +
        '</div>' +
        '<p data-verify-link style="margin:16px 0 0;text-align:center;font-family:\'IBM Plex Mono\',monospace;font-size:11px;color:#9a8f7f;word-break:break-all">Перевірити справжність: ' + esc(vurl) + '</p>' +
      '</div>'
    );
  }

  function makeQr(text) {
    try {
      if (window.QRCode && typeof window.QRCode.toDataURL === "function") {
        return window.QRCode
          .toDataURL(text, { margin: 1, width: 220, color: { dark: "#2b2620", light: "#f8f4ec" } })
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
    var course = (cert.courses && cert.courses.title) || "Курс";
    var scored = rows.filter(function (r) { return r.score != null; });
    var avg = scored.length ? Math.round(scored.reduce(function (s, r) { return s + r.score; }, 0) / scored.length) : 0;

    function tRow(r, gi) {
      var pct = r.score != null ? Math.max(0, Math.min(100, r.score)) : 0;
      var label = r.score != null ? r.score + "%" : "—";
      var num = String(r.number).padStart(2, "0");
      var bg = gi % 2 ? "#f2ebdb" : "transparent";
      return (
        '<div style="display:flex;align-items:center;gap:9px;padding:4px 9px;background:' + bg + ';border-radius:5px">' +
          '<span style="font-family:\'IBM Plex Mono\',monospace;font-size:11px;color:#BD5F40;width:20px;flex-shrink:0">' + num + '</span>' +
          '<span style="flex:1;font-size:12px;color:#2b2620;text-align:left;line-height:1.25">' + esc(r.title) + '</span>' +
          '<span style="width:64px;height:6px;background:#e2d6c0;border-radius:4px;overflow:hidden;flex-shrink:0"><span style="display:block;height:100%;width:' + pct + '%;background:#D97757"></span></span>' +
          '<span style="width:36px;text-align:right;font-family:\'IBM Plex Mono\',monospace;font-size:12px;color:#2b2620;flex-shrink:0">' + label + '</span>' +
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
      '<p style="margin:0;font-family:\'IBM Plex Mono\',monospace;letter-spacing:.3em;font-size:11px;color:#BD5F40">AI АКАДЕМІЯ · ДОДАТОК</p>' +
      '<h1 style="margin:10px 0 0;font-family:Literata,Georgia,serif;font-size:34px;font-weight:700;line-height:1.1">Результати проходження</h1>' +
      '<p style="margin:6px 0 0;font-size:15px;color:#8a7f6f">' + esc(cert.full_name || "Студент") + ' · «' + esc(course) + '»</p>' +
      '<div style="width:100%;margin-top:18px">' + rowsHtml + '</div>' +
      '<div style="margin-top:auto;width:100%;display:flex;justify-content:space-between;align-items:center;padding-top:14px;border-top:1px solid #e6dcca">' +
        '<span style="font-family:\'IBM Plex Mono\',monospace;font-size:12px;color:#9a8f7f">Код: ' + esc(cert.public_code) + '</span>' +
        '<span style="font-size:16px;font-weight:500;color:#2b2620">Середній результат: <span style="color:#BD5F40">' + avg + '%</span></span>' +
      '</div>'
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
    if (!window.jspdf || !window.html2canvas) {
      alert("Бібліотеки для PDF ще вантажаться — спробуй за секунду.");
      return;
    }
    var course = (cert.courses && cert.courses.title) || "AI-Academy";
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
            return window.html2canvas(n1, { scale: 2, backgroundColor: "#f8f4ec", useCORS: true });
          })
          .then(function (c1) {
            return window.html2canvas(n2, { scale: 2, backgroundColor: "#f8f4ec", useCORS: true }).then(function (c2) {
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

  document.addEventListener("aia:auth", load);
  document.addEventListener("DOMContentLoaded", function () {
    // Якщо auth.js іще не готовий — покажемо запрошення увійти,
    // подія aia:auth згодом перемалює.
    if (!window.sb) renderLoggedOut();
  });
})();
