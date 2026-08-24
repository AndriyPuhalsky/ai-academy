/* ============================================================
   ВАРІАНТ B — «Один явний клік»
   ------------------------------------------------------------
   Вісь: жорсткість гарантованого дотику з іменем.
   B стоїть посередині: діалог перед сабмітом, дві кнопки,
   підложка не закриває, Escape = скасувати завершення модуля.

   Це дефолт специфікації (§5.8) і те, що зібрав агент №3.
   Тут він лишається як є — але на виправленій базі.
   ============================================================ */

window.AIA_VARIANT = {
  id: "b",
  title: "Один явний клік",
  subtitle:
    "Перед тим, як модуль стане останнім, відкривається діалог із прев'ю сертифіката. " +
    "Далі — тільки через один із двох явних кліків. Ціна: +1 клік для всіх, зокрема для тих, у кого ім'я й так правильне.",

  /* Гарантований дотик: діалог. Перший раз — з полем, другий — м'якше. */
  onComplete: function (api, btn) {
    api.openNameDialog(api.demo.nameTouched ? "soft" : "last", btn, function () {
      api.finishModule(
        "Ім'я підтверджено → <b>тільки тепер</b> викликано submit_quiz. Лічильник у шапці: 12/12."
      );
    });
  },

  scenes: function (api) {
    var demo = api.demo;
    return {
      c1: {
        group: "Ім'я для сертифіката", label: "Постійна поверхня (з шапки)",
        page: "home", width: 1280, session: "user",
        note:
          "Вхід — ім'я в шапці, яке зі <code>&lt;span&gt;</code> стало <code>&lt;button&gt;</code>. " +
          "Клікабельність показана пунктирним підкресленням, а не новим кольором.<br>" +
          "<b>Естетичний ризик макета:</b> кремова смужка — не описова плитка, а буквальний фрагмент PDF " +
          "(ті самі кольори, та сама Literata, той самий порядок рядків, що в <code>js/certificate.js:188–191</code>), " +
          "врізаний <b>в обріз</b>. Перемикач «прев'ю імені» вгорі показує альтернативу — темну плитку. Спробуй набрати ім'я.",
        actions: [
          ["Довге ім'я", function () {
            demo.name = "Костянтин-Володимир Гнатюк-Верхогляденко";
            api.renderSite(); api.openNameDialog("permanent", document.getElementById("aiaNameBtn"));
          }],
          ["Коротке ім'я", function () {
            demo.name = "Олена Ковальчук";
            api.renderSite(); api.openNameDialog("permanent", document.getElementById("aiaNameBtn"));
          }]
        ],
        run: function () {
          api.renderSite();
          api.openNameDialog("permanent", document.getElementById("aiaNameBtn"));
        }
      },

      c2: {
        group: "Ім'я для сертифіката", label: "Гарантований дотик (11/12 → 12/12)",
        page: "module", width: 1280, session: "user",
        note:
          "Тригер — клік по <code>#completeBtn</code> у стані, коли він переводить курс у <b>n/n</b>. " +
          "Не квіз і не сторінка сертифіката. Підложка не закриває; потрібен один із двох явних кліків.<br>" +
          "<b>Перевірено валідатором:</b> Escape лишає лічильник <b>11/12</b> і повертає фокус на кнопку, клік по підложці не закриває, " +
          "«Зберегти й завершити» дає <b>12/12</b>. Спробуй обидва шляхи.",
        actions: [
          ["Модуль 5/12 — дотику немає", function () { demo.modProgress = 5; demo.nameTouched = false; api.renderSite(); }],
          ["Модуль 11/12 — дотик є", function () { demo.modProgress = 11; demo.nameTouched = false; api.renderSite(); }]
        ],
        run: function () { demo.modProgress = 11; demo.nameTouched = false; demo.name = "olena p"; api.renderSite(); }
      },

      c3: {
        group: "Ім'я для сертифіката", label: "Другий раз, м'якше",
        page: "module", width: 1280, session: "user",
        note:
          "Курсів два (12 і 22 модулі), тому дотик спрацьовує до двох разів. Удруге — той самий діалог, " +
          "але <b>без режиму редагування за замовчуванням</b>: заголовок, прев'ю, «Так, усе вірно». «Змінити ім'я» лишається, просто тихішим.",
        run: function () {
          demo.modProgress = 11; demo.nameTouched = true; demo.name = "Олена Ковальчук";
          api.renderSite();
          api.openNameDialog("soft", document.getElementById("completeBtn"), function () {
            api.finishModule("Підтверджено без редагування — 12/12.");
          });
        }
      },

      c4: {
        group: "Ім'я для сертифіката", label: "Ім'я схоже на заглушку",
        page: "module", width: 1280, session: "user",
        note:
          "Евристика без вгадування: містить <code>@</code> · одне слово · увесь нижній регістр · коротше 4 символів.<br>" +
          "Попередження стоїть <b>на темному боці</b>, а не обведенням смужки: clay на кремовому дає 2.85:1 і не пройшов би 3:1, " +
          "тоді як clay на surface = 5.49. Це <b>нічого не блокує</b> й не міняє кнопок — у цьому й різниця B від C.",
        run: function () {
          demo.modProgress = 11; demo.nameTouched = false; demo.name = "olena p";
          api.renderSite();
          api.openNameDialog("last", document.getElementById("completeBtn"), function () {
            api.finishModule("Ім'я підтверджено → 12/12.");
          });
        }
      }
    };
  }
};
