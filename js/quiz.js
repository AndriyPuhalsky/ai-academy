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

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    var status = document.createElement("p");
    status.className = "quiz-status";
    status.textContent = "Обирай відповіді — пояснення з'являтимуться одразу.";
    host.appendChild(status);

    // Тонкий прогрес-бар: заповнюється в міру відповідей.
    var progress = document.createElement("div");
    progress.className = "quiz-progress";
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-label", "Прогрес квіза");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    progress.style.cssText =
      "height:4px;border-radius:999px;background:#3A342E;overflow:hidden;margin:0.75rem 0 1.5rem;";
    var progressFill = document.createElement("div");
    progressFill.style.cssText =
      "height:100%;width:0%;background:#D97757;" +
      (prefersReduced ? "" : "transition:width .4s ease;");
    progress.appendChild(progressFill);
    host.appendChild(progress);

    function updateProgress() {
      var pct = total ? Math.round((answered / total) * 100) : 0;
      progressFill.style.width = pct + "%";
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

      var card = document.createElement("div");
      card.className = "quiz-q";
      card.innerHTML =
        '<p class="quiz-num">Питання ' + (qi + 1) + " з " + total + "</p>" +
        '<p class="quiz-text">' + esc(q.q) + "</p>" +
        '<div class="quiz-opts" role="group" aria-label="Варіанти відповіді"></div>' +
        '<div class="quiz-explain" hidden></div>';

      var optsBox = card.querySelector(".quiz-opts");
      var explain = card.querySelector(".quiz-explain");

      optionTexts.forEach(function (text, oi) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-opt";
        btn.textContent = text;

        btn.addEventListener("click", function () {
          // Кожне питання приймає лише одну відповідь
          if (card.classList.contains("is-answered")) return;
          card.classList.add("is-answered");

          var ok = oi === answerIndex;
          answered++;
          if (ok) correct++;

          var buttons = optsBox.querySelectorAll(".quiz-opt");
          Array.prototype.forEach.call(buttons, function (b, bi) {
            b.setAttribute("data-locked", "1");
            b.setAttribute("aria-disabled", "true");
            if (bi === answerIndex) {
              b.classList.add("is-correct");
              b.textContent = "✓ " + optionTexts[bi];
            }
            if (bi === oi && !ok) {
              b.classList.add("is-wrong");
              b.textContent = "✗ " + optionTexts[bi];
            }
          });

          explain.className = "quiz-explain " + (ok ? "ok" : "bad");
          explain.innerHTML =
            '<span class="verdict">' + (ok ? "Правильно!" : "Не зовсім.") + "</span>" +
            esc(q.explain || "");
          explain.hidden = false;
          if (!prefersReduced) {
            explain.style.opacity = "0";
            explain.style.transform = "translateY(-4px)";
            explain.style.transition = "opacity .35s ease, transform .35s ease";
            requestAnimationFrame(function () {
              explain.style.opacity = "1";
              explain.style.transform = "translateY(0)";
            });
          }

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
      box.className = "quiz-summary";
      box.innerHTML =
        '<p class="quiz-score">Результат: ' + correct + " з " + total + " (" + share + "%)</p>" +
        "<p>" + esc(summaryMessage(correct, total)) + "</p>" +
        '<button type="button" class="quiz-restart">Пройти квіз ще раз</button>';

      box.querySelector(".quiz-restart").addEventListener("click", function () {
        renderQuiz(host, data);
        host.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
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
        host.innerHTML =
          '<p class="quiz-status">Не вдалося завантажити квіз — перевір формат JSON у сторінці.</p>';
      }
    });
  });
})();
