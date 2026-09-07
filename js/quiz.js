/* ============================================================
   AI Академія — універсальний двигун квізів самоперевірки
   Використання на сторінці модуля:
     <div data-quiz="quizData"></div>
     <script type="application/json" id="quizData">{ ... }</script>
   Формат даних:
     {
       "questions": [
         { "q": "Питання?", "options": ["А", "Б"], "answer": 0,
           "explain": "Чому саме так." }
       ]
     }
   Жодного бекенду й оцінок: миттєвий фідбек, пояснення до
   кожної відповіді та підсумок наприкінці.
   ============================================================ */
(function () {
  "use strict";

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* ⚠ 010 · П-27. Було matchMedia("(prefers-reduced-motion: reduce)") напряму:
     воно бачить ТІЛЬКИ системну настройку, тому пресет data-motion="calm" і
     клас html.rm для цього файла не існували — рух лишався живим там, де його
     вимкнули. Єдине джерело правди — AIA.motion.on(). Функція, а не значення:
     перемикач може змінитись між рендерами. */
  function motionOn() {
    if (window.AIA && window.AIA.motion) return window.AIA.motion.on();
    return !(window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  var KEYS = ["А", "Б", "В", "Г", "Д", "Е"];   /* П-25 · українські літери */

  function summaryMessage(correct, total) {
    var share = total ? correct / total : 0;
    if (share === 1) return "Бездоганно! Ти впевнено володієш матеріалом модуля.";
    if (share >= 0.75) return "Дуже добре! Базу закладено міцно — дрібниці легко освіжити.";
    if (share >= 0.5) return "Непогано. Переглянь пояснення до помилок і відповідні уроки.";
    return "Варто пройти модуль ще раз — і квіз обов'язково підкориться.";
  }

  function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function renderQuiz(host, data) {
    // Перемішуємо і порядок питань, і варіанти (нижче) — щоразу новий розклад.
    var questions = shuffleArray((data.questions || []).slice());
    var total = questions.length;
    var answered = 0;
    var correct = 0;

    host.innerHTML = "";
    host.className = "ds-quiz";

    var status = document.createElement("p");
    status.className = "ds-quiz__status";
    status.textContent = "Обирай відповіді — пояснення з'являтимуться одразу.";
    host.appendChild(status);

    /* Тонкий прогрес-бар: заповнюється в міру відповідей.
       ⚠ 010 · П-28 · js-diff quiz.js:61–70. `.ds-prog__bar` малює
       transform: scaleX(var(--prog-v)), а НЕ width. Прод ставив width — після
       міграції смуга лишилась би на нулі назавжди, і помилки не було б.
       Разом із цим зникають два хекси (#3A342E, #D97757) і тривалість
       рядком ("transition:width .4s ease") — усе це тепер токени. */
    var progress = document.createElement("span");
    progress.className = "ds-prog";
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-label", "Прогрес квіза");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    progress.setAttribute("aria-valuenow", "0");
    var progressFill = document.createElement("span");
    progressFill.className = "ds-prog__bar";
    progressFill.style.setProperty("--prog-v", "0");
    progress.appendChild(progressFill);
    host.appendChild(progress);

    function updateProgress() {
      var pct = total ? Math.round((answered / total) * 100) : 0;
      progressFill.style.setProperty("--prog-v", String(total ? answered / total : 0));
      progress.setAttribute("aria-valuenow", String(pct));
    }

    questions.forEach(function (q, qi) {
      // Перемішуємо варіанти (Фішер–Єйтс), запам'ятовуючи, який правильний.
      // Так позиція правильної відповіді щоразу різна — її не «вивчити напам'ять».
      var shuffled = (q.options || []).map(function (text, i) {
        return { text: text, correct: i === q.answer };
      });
      for (var s = shuffled.length - 1; s > 0; s--) {
        var r = Math.floor(Math.random() * (s + 1));
        var tmp = shuffled[s]; shuffled[s] = shuffled[r]; shuffled[r] = tmp;
      }
      var optionTexts = shuffled.map(function (o) { return o.text; });
      var answerIndex = shuffled.findIndex(function (o) { return o.correct; });

      /* Три рівні розкриття, а не два: зовнішній .ds-quiz__reveal тримає
         grid-template-rows 0fr→1fr, СЕРЕДНІЙ (без класу) — overflow: hidden,
         і лише внутрішній має падінги й кант. Падінги на елементі з height 0
         усе одно малюються — інакше під кожним питанням лишалась би порожня
         смуга. Це M7, тривалість — --dur-state, жодного переходу рядком. */
      var card = document.createElement("div");
      card.className = "ds-quiz__card";
      card.innerHTML =
        '<p class="ds-quiz__num">Питання ' + (qi + 1) + " з " + total + "</p>" +
        '<p class="ds-quiz__q">' + esc(q.q) + "</p>" +
        '<div class="ds-quiz__opts" role="group" aria-label="Варіанти відповіді"></div>' +
        '<div class="ds-quiz__reveal"><div><div class="ds-quiz__explain"></div></div></div>';

      var optsBox = card.querySelector(".ds-quiz__opts");
      var explain = card.querySelector(".ds-quiz__explain");

      optionTexts.forEach(function (text, oi) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ds-quiz__opt";
        /* ⚠ 010 · П-25 · js-diff quiz.js:~110. Без цього атрибута
           `content: attr(data-key)` у components.css малює порожнечу, і
           варіанти лишаються без «А/Б/В/Г» на 57 сторінках. */
        btn.setAttribute("data-key", KEYS[oi] || String(oi + 1));
        btn.setAttribute("aria-pressed", "false");
        btn.textContent = text;

        btn.addEventListener("click", function () {
          // Кожне питання приймає лише одну відповідь
          if (card.classList.contains("is-answered")) return;
          card.classList.add("is-answered");

          var ok = oi === answerIndex;
          answered++;
          if (ok) correct++;

          var buttons = optsBox.querySelectorAll(".ds-quiz__opt");
          Array.prototype.forEach.call(buttons, function (b, bi) {
            b.setAttribute("data-locked", "1");
            b.setAttribute("aria-disabled", "true");
            /* ⚠ 010 · П-26 · js-diff quiz.js:126,131. Гліфи ✓ / ✕ малює ТІЛЬКИ
               псевдоелемент (--ok::after / --bad::after). Прод дописував "✓ "
               у сам текст варіанта — разом вийшло б «✓ Відповідь ✓». */
            if (bi === answerIndex) b.classList.add("ds-quiz__opt--ok");
            if (bi === oi && !ok) b.classList.add("ds-quiz__opt--bad");
          });
          btn.setAttribute("aria-pressed", "true");

          explain.className = "ds-quiz__explain " +
            (ok ? "ds-quiz__explain--ok" : "ds-quiz__explain--bad");
          explain.innerHTML =
            '<span class="ds-quiz__verdict">' + (ok ? "Правильно!" : "Не зовсім.") + "</span>" +
            esc(q.explain || "");

          status.textContent =
            "Відповіли: " + answered + " з " + total + " · Правильно: " + correct;
          updateProgress();

          if (answered === total) showSummary();
        });

        optsBox.appendChild(btn);
      });

      host.appendChild(card);
    });

    function showSummary() {
      var share = Math.round((correct / total) * 100);
      var box = document.createElement("div");
      box.className = "ds-quiz__summary";
      box.innerHTML =
        '<p class="ds-quiz__score">Результат: ' + correct + " з " + total + " (" + share + "%)</p>" +
        "<p>" + esc(summaryMessage(correct, total)) + "</p>" +
        '<button type="button" class="ds-btn ds-btn--secondary ds-quiz__restart">Пройти квіз ще раз</button>';

      box.querySelector(".ds-quiz__restart").addEventListener("click", function () {
        renderQuiz(host, data);
        /* П-27: поведінка скролу теж іде через ворота --motion, а не matchMedia. */
        host.scrollIntoView({
          behavior: motionOn() ? "smooth" : "auto",
          block: "start"
        });
      });

      host.appendChild(box);

      var live = document.getElementById("ariaLive");
      if (live) live.textContent = "Квіз завершено: " + correct + " з " + total;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var hosts = document.querySelectorAll("[data-quiz]");
    Array.prototype.forEach.call(hosts, function (host) {
      var src = document.getElementById(host.getAttribute("data-quiz"));
      if (!src) return;
      try {
        renderQuiz(host, JSON.parse(src.textContent));
      } catch (err) {
        console.error("[AIA] Помилка в даних квіза:", err);
        host.className = "ds-quiz";
        host.innerHTML =
          '<p class="ds-quiz__status">Не вдалося завантажити квіз — перевір формат JSON у сторінці.</p>';
      }
    });
  });
})();
