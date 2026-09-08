/* ============================================================================
   010 · Б2 · ПАНЕЛЬ СТАНІВ — У КОД САЙТУ НЕ ЇДЕ
   Перемикає рівно те, що вимагає §10 «Стани і крайні випадки» для T2/T3.
   Стан читається з ?state=… і пишеться назад в адресу, щоб кадр можна було
   переслати посиланням.
   ========================================================================== */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var params = new URLSearchParams(location.search);

  var GROUPS = [
    { key: "pos",   label: "модуль",  def: "mid",
      opts: [["first", "перший"], ["mid", "середній"], ["last", "останній"]] },
    { key: "state", label: "стан",    def: "open",
      opts: [["open", "звичайний"], ["done", "пройдений"], ["locked", "заблокований"]] },
    { key: "prose", label: "проза",   def: "narrow",
      opts: [["narrow", "672"], ["wide", "768"]] },
    { key: "code",  label: "код ≤640", def: "system",
      opts: [["system", "13.52"], ["prod", "12"]] },
    { key: "course", label: "курс",   def: "terminal",
      opts: [["terminal", "Термінал"], ["academy", "Академія"], ["architect", "Architect"]] },
    { key: "motion", label: "рух",    def: "on",
      opts: [["on", "standard"], ["off", "reduce"]] }
  ];

  var state = {};
  GROUPS.forEach(function (g) { state[g.key] = params.get(g.key) || g.def; });

  var MODULE_BY_POS = { first: "c01", mid: "c05", last: "c23" };

  function apply() {
    root.setAttribute("data-course", state.course);
    root.setAttribute("data-fs-code", state.code);
    root.classList.toggle("rm", state.motion === "off");

    var art = doc.querySelector(".ds-prose");
    if (art) art.setAttribute("data-prose", state.prose);

    doc.body.setAttribute("data-module", MODULE_BY_POS[state.pos] || "c05");

    /* Демо-прогрес: «останній модуль» показує prev/next фінальної форми лише
       тоді, коли попередні пройдені, — інакше побачили б форму «заверши цей». */
    var P = window.AIADemoProgress;
    if (P) {
      P.done.clear();
      var upto = state.pos === "last" ? 22 : (state.pos === "mid" ? 4 : 0);
      for (var i = 1; i <= upto; i++) P.done.add("c" + String(i).padStart(2, "0"));
      if (state.state === "done") P.done.add(MODULE_BY_POS[state.pos]);
      P.setCompleted("__noop__", false);         /* тригерить перерендер */
    }
    if (window.AIADemoLock) window.AIADemoLock(state.state === "locked");

    var url = new URL(location.href);
    GROUPS.forEach(function (g) { url.searchParams.set(g.key, state[g.key]); });
    history.replaceState(null, "", url);
    render();
  }

  var panel, toggle;
  function render() {
    if (!panel) return;
    panel.querySelectorAll(".dm__opt").forEach(function (b) {
      b.setAttribute("aria-pressed", String(state[b.dataset.group] === b.dataset.value));
    });
  }

  function build() {
    toggle = doc.createElement("button");
    toggle.type = "button";
    toggle.className = "dm__toggle";
    toggle.textContent = "стани ▲";

    panel = doc.createElement("div");
    panel.className = "dm";
    panel.hidden = true;
    var html = '<div class="dm__head"><p class="dm__title">макет · перемикачі станів</p>' +
               '<button type="button" class="dm__opt" data-close>✕</button></div>';
    GROUPS.forEach(function (g) {
      html += '<div class="dm__row"><span class="dm__label">' + g.label + "</span>";
      g.opts.forEach(function (o) {
        html += '<button type="button" class="dm__opt" data-group="' + g.key +
                '" data-value="' + o[0] + '" aria-pressed="false">' + o[1] + "</button>";
      });
      html += "</div>";
    });
    html += '<p class="dm__note">Панель у код сайту не їде. Ширина шторки й шапки ' +
            'міряються зміною розміру вікна: 1024 — шторка, 700 по висоті — тонка шапка.</p>';
    panel.innerHTML = html;

    doc.body.appendChild(toggle);
    doc.body.appendChild(panel);

    toggle.addEventListener("click", function () {
      panel.hidden = false; toggle.hidden = true;
    });
    panel.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-close")) { panel.hidden = true; toggle.hidden = false; return; }
      state[b.dataset.group] = b.dataset.value;
      apply();
    });
  }

  function start() {
    /* У кадрах лабораторії й розвилки панель не потрібна — вона накривала б
       контент усередині <iframe>. */
    if (!params.has("lab") && !params.has("fork")) build();
    apply();
  }
  /* Дані курсу приїжджають асинхронно; до того сайдбар, prev/next і замок
     будувати нема з чого. Тому стан застосовується ДВІЧІ. */
  doc.addEventListener("aia:demo-ready", apply);
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", start);
  else start();
})();
