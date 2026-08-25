/* ============================================================
   ВАРІАНТ A — «Тихий банер»
   ------------------------------------------------------------
   Вісь: жорсткість гарантованого дотику з іменем.
   A — найлегший кінець: діалогу перед завершенням НЕМАЄ взагалі.
   Замість нього — банер на сторінці модуля, який з'являється
   заздалегідь (не в останню мить) і показує те саме прев'ю
   сертифіката. Завершити модуль можна, не чіпаючи його.

   Щоб це був найкращий варіант свого підходу, а не солом'яне
   опудало, банер:
     · з'являється не тільки на останньому модулі, а від 9/12,
       тобто задовго до точки неповернення;
     · показує САМЕ ІМ'Я великим кеглем Literata, а не абстрактне
       «перевірте профіль»;
     · при спрацюванні евристики підвищує голос (clay + іконка),
       але все одно не блокує;
     · веде в ту саму поверхню редагування, що й шапка.
   ============================================================ */

(function () {
  var SHOW_FROM = 9;   // з якого модуля банер стоїть на сторінці

  function bannerHtml(api) {
    var demo = api.demo, esc = api.esc;
    var shown = String(demo.name || "").trim() || api.T.name.fallback;
    var auto = api.looksAuto(demo.name);
    var last = demo.modProgress === 11;

    var why = auto
      ? '<p class="nban__why">' + api.SVG_ALERT +
          "<span>Схоже на автоматичне ім'я з Google. У PDF надрукується саме так.</span></p>"
      : '<p class="nban__why"><span>' +
          (last
            ? "Це останній модуль. Після нього сертифікат випишеться на це ім'я — змінити його потім не вийде."
            : "Саме так ім'я буде надруковано у PDF. Змінити можна будь-коли до видачі сертифіката.") +
        "</span></p>";

    return (
      '<div class="nban' + (auto ? " nban--alert" : "") + '" id="aiaNameBanner">' +
        "<div>" +
          '<p class="nban__label">Ім\'я для сертифіката</p>' +
          '<p class="nban__name">' + esc(shown) + "</p>" +
          why +
        "</div>" +
        '<button type="button" class="nban__act" data-act="edit-name">Змінити ім\'я</button>' +
      "</div>"
    );
  }

  // Банер живе під блоком завершення, тобто нижче згину сцени.
  // Щоб власник не шукав головний елемент варіанта вручну, кожна
  // сцена доводить його до центру. Це риштування, не поведінка сайту.
  function show(api) {
    api.renderSite();
    setTimeout(function () {
      var b = document.getElementById("aiaNameBanner");
      if (b) b.scrollIntoView({ block: "center" });
    }, 30);
  }

  window.AIA_VARIANT = {
    id: "a",
    title: "Тихий банер",
    subtitle:
      "Діалогу перед завершенням немає. Ім'я показане банером на сторінці модуля заздалегідь — " +
      "від 9/12, а не в останню мить. Ціна: найтихіший, і його проігнорують саме ті, кому він потрібен.",

    /* Гарантованого дотику як перешкоди немає: клік завершує модуль одразу. */
    onComplete: function (api) {
      api.finishModule(
        "Модуль завершено <b>одразу</b>, без жодного діалогу: submit_quiz пішов на сервер із поточним іменем " +
        "«<b>" + api.esc(api.demo.name) + "</b>». Це і є ціна варіанта A."
      );
    },

    /* Банер дописується після кожного рендера сторінки модуля. */
    afterRender: function (api) {
      var host = document.querySelector(".mod__complete");
      if (!host) return;
      if (api.demo.session !== "user") return;
      if (api.demo.modProgress < SHOW_FROM) return;
      if (api.demo.modProgress >= 12) return;

      var wrap = document.createElement("div");
      wrap.innerHTML = bannerHtml(api);
      var el = wrap.firstElementChild;
      host.parentNode.insertBefore(el, host.nextSibling);

      el.addEventListener("click", function (e) {
        var b = e.target.closest("[data-act='edit-name']");
        if (!b) return;
        api.openNameDialog("permanent", b, function () { api.renderSite(); });
      });
    },

    scenes: function (api) {
      var demo = api.demo;
      return {
        c1: {
          group: "Ім'я для сертифіката", label: "Постійна поверхня (з шапки)",
          page: "home", width: 1280, session: "user",
          note:
            "Спільне для всіх трьох варіантів: ім'я в шапці стало <code>&lt;button&gt;</code> і відкриває редагування без переходу на нову сторінку (критерій 30).<br>" +
            "<b>Естетичний ризик макета</b> — кремова смужка з буквальним фрагментом PDF. Перемикач «прев'ю імені» вгорі показує альтернативу.",
          run: function () {
            api.renderSite();
            api.openNameDialog("permanent", document.getElementById("aiaNameBtn"));
          }
        },

        c2: {
          group: "Ім'я для сертифіката", label: "Банер на 9/12 — задовго до кінця",
          page: "module", width: 1280, session: "user",
          note:
            "Головна відмінність варіанта A: людина бачить своє ім'я <b>тоді, коли ще нікуди не поспішає</b>, а не в останню секунду курсу. " +
            "Банер стоїть під блоком завершення, показує ім'я кеглем сертифіката й веде в ту саму поверхню редагування.<br>" +
            "Нічого не блокує: «Позначити завершеним» працює одразу.",
          actions: [
            ["Правильне ім'я", function () { demo.name = "Олена Ковальчук"; show(api); }],
            ["Ім'я з Google", function () { demo.name = "olena p"; show(api); }]
          ],
          run: function () { demo.modProgress = 9; demo.name = "Олена Ковальчук"; show(api); }
        },

        c3: {
          group: "Ім'я для сертифіката", label: "Останній модуль — банер голосніший",
          page: "module", width: 1280, session: "user",
          note:
            "На 11/12 текст банера змінюється на «змінити потім не вийде», але кнопка завершення лишається вільною. " +
            "<b>Натисни її</b> — модуль закриється <b>без жодного діалогу</b>, з тим іменем, яке зараз у банері. Саме тут ціна варіанта видно найкраще.",
          actions: [
            ["Правильне ім'я", function () { demo.modProgress = 11; demo.name = "Олена Ковальчук"; show(api); }],
            ["Ім'я з Google", function () { demo.modProgress = 11; demo.name = "olena p"; show(api); }]
          ],
          run: function () { demo.modProgress = 11; demo.name = "Олена Ковальчук"; show(api); }
        },

        c4: {
          group: "Ім'я для сертифіката", label: "Ім'я схоже на заглушку",
          page: "module", width: 1280, session: "user",
          note:
            "Евристика (<code>@</code> · одне слово · увесь нижній регістр · &lt;4 символів) підвищує голос банера: межа <b>clay</b>, іконка, прямий текст. " +
            "Але й тут вона <b>не блокує</b> — це визначальна властивість варіанта A.<br>" +
            "clay на surface = 5.49:1, тобто попередження читається; на кремовому папері воно дало б 2.85 і не пройшло б, тому його там і немає.",
          run: function () { demo.modProgress = 11; demo.name = "olena p"; show(api); }
        },

        c5: {
          group: "Ім'я для сертифіката", label: "Мобілка 390 — банер і аркуш",
          page: "module", width: 390, session: "user",
          note:
            "На вузькому екрані банер стає двома рядами (ім'я зверху, кнопка знизу, обидві на всю ширину). " +
            "Другий вхід у ту саму поверхню — кружечок у шапці → аркуш → «Ім'я для сертифіката».",
          run: function () { demo.modProgress = 11; demo.name = "olena p"; show(api); }
        }
      };
    }
  };
})();
