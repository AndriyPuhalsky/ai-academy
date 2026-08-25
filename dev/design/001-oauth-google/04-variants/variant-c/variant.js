/* ============================================================
   ВАРІАНТ C — «Підтверди дослівно»
   ------------------------------------------------------------
   Вісь: жорсткість гарантованого дотику з іменем.
   C — найжорсткіший кінець: завершити модуль НЕ МОЖНА, поки
   людина явно не підтвердила ім'я. Не «клікнула далі» —
   а поставила галочку навпроти конкретного рядка або
   виправила його власноруч.

   Щоб це був найкращий варіант свого підходу, а не покарання:
     · галочка — рівно одна дія, поруч із самим іменем,
       нативний <input type="checkbox"> з нативною міткою;
     · тому, у кого ім'я вже правильне, це один клік або
       один пробіл із клавіатури;
     · заблокована кнопка не мовчить: під нею стоїть причина,
       і вона озвучується (aria-describedby), а не тільки
       блідне;
     · ім'я, що не проходить евристику, не можна підтвердити
       галочкою взагалі — його треба виправити. Це єдине
       місце, де інтерфейс справді впирається;
     · Escape як і в B скасовує завершення — критерій 29
       не порушується навіть тут.
   ============================================================ */

(function () {

  function dialogHtml(api, value) {
    var esc = api.esc, T = api.T;
    var v = String(value || "").trim();
    var shown = v || T.name.fallback;
    var auto = api.looksAuto(v);
    var tile = api.paper() === "tile";

    var warn = auto
      ? '<p class="paper-warn">' + api.SVG_ALERT +
          "<span>Схоже на автоматичне ім'я з Google. Підтвердити його галочкою не можна — виправ поле нижче.</span></p>"
      : "";

    var confirmBlock = auto
      ? ""
      : '<label class="confirm" for="aiaConfirm">' +
          '<input type="checkbox" id="aiaConfirm" />' +
          '<span class="confirm__txt">Так, друкуйте саме так: <b>' + esc(shown) + "</b></span>" +
        "</label>";

    return (
      '<div class="aia-scrim" id="aiaNameModal" data-mode="confirm">' +
        '<div class="aia-card aia-card--paper" role="dialog" aria-modal="true" ' +
             'aria-labelledby="aiaNameTitle" aria-describedby="aiaNameDesc" tabindex="-1">' +

          '<div class="aia-head"><div>' +
            '<p class="aia-eyebrow">' + esc(T.name.eyebrow) + "</p>" +
            '<h2 class="aia-title" id="aiaNameTitle">' + esc(T.name.title) + "</h2>" +
          "</div></div>" +

          '<p class="aia-note" id="aiaNameDesc">' + esc(T.name.descLast) + "</p>" +

          warn +

          '<div class="paper' + (tile ? " paper--tile" : "") + '" id="aiaPaper">' +
            '<p class="paper__quiet" aria-hidden="true">' + esc(T.name.quiet) + "</p>" +
            '<p class="paper__name"><span class="sr-only">' + esc(T.name.srPrefix) + "</span>" +
              '<span id="aiaPaperName">' + esc(shown) + "</span></p>" +
            '<div class="paper__rule" aria-hidden="true"></div>' +
            '<p class="paper__after" aria-hidden="true">' + esc(T.name.after) + "</p>" +
          "</div>" +

          '<p class="aia-warnline" id="aiaPaperCaption">' +
            esc(T.name.caption) + " <b>" + esc(T.name.captionStrong) + "</b></p>" +

          '<div style="margin-top:var(--s-4)">' +
            '<label class="aia-label" for="aiaNameInput">' + esc(T.name.label) + "</label>" +
            '<input id="aiaNameInput" class="aia-input" type="text" maxlength="100" ' +
                   'autocomplete="name" value="' + esc(v) + '" aria-describedby="aiaConfirmWhy" />' +
          "</div>" +

          confirmBlock +

          '<div class="aia-actions aia-actions--row">' +
            '<button type="button" class="aia-submit" data-act="finish" disabled ' +
                    'aria-describedby="aiaConfirmWhy">Завершити модуль</button>' +
            '<button type="button" class="aia-text-btn" data-act="cancel">' + esc(T.name.cancel) + "</button>" +
          "</div>" +

          '<p class="aia-hint" id="aiaConfirmWhy" role="status">' +
            (auto
              ? "Щоб завершити модуль, виправ ім'я: потрібні щонайменше два слова з великої літери."
              : "Щоб завершити модуль, підтверди ім'я галочкою вище або виправ його.") +
          "</p>" +

        "</div>" +
      "</div>"
    );
  }

  function ok(api, v) {
    v = String(v || "").trim();
    return v.length >= 4 && !api.looksAuto(v);
  }

  function wire(api, el, onDone) {
    var q = function (s) { return el.querySelector(s); };
    var input = q("#aiaNameInput");
    var finish = q("[data-act='finish']");
    var why = q("#aiaConfirmWhy");
    var edited = false;
    var t = null;

    function sync() {
      var v = input.value.trim();
      var box = q("#aiaConfirm");
      var can = ok(api, v) && (edited || (box && box.checked));
      finish.disabled = !can;
      if (can) {
        why.textContent = "Готово. Ім'я підтверджено — модуль можна завершувати.";
      } else if (!ok(api, v)) {
        why.textContent = "Щоб завершити модуль, виправ ім'я: потрібні щонайменше два слова з великої літери.";
      } else {
        why.textContent = "Щоб завершити модуль, підтверди ім'я галочкою вище або виправ його.";
      }
    }

    input.addEventListener("input", function () {
      edited = true;
      clearTimeout(t);
      t = setTimeout(function () {
        var v = input.value.trim();
        q("#aiaPaperName").textContent = v || api.T.name.fallback;
        var cap = q("#aiaPaperCaption");
        cap.innerHTML = (v ? "" : api.esc(api.T.name.fallbackWhy) + " ") +
          api.esc(api.T.name.caption) + " <b>" + api.esc(api.T.name.captionStrong) + "</b>";
        sync();
      }, 120);
    });

    el.addEventListener("change", function (e) {
      if (e.target.id === "aiaConfirm") sync();
    });

    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var act = b.getAttribute("data-act");
      if (act === "cancel") { api.closeTop("cancel"); return; }
      if (act === "finish") {
        if (finish.disabled) return;
        api.demo.name = input.value.trim().slice(0, 100) || api.demo.name;
        api.demo.nameTouched = true;
        api.closeTop("done");
        if (onDone) onDone();
      }
    });

    sync();
  }

  function open(api, btn, onDone) {
    var el = api.openDialog(dialogHtml(api, api.demo.name), {
      host: api.stage(),
      opener: btn,
      dismissible: false,      // підложка не закриває — точка неповернення
      onClose: function (reason) {
        if (reason !== "done") {
          api.flash(
            "Escape / «Скасувати» у гарантованому дотику <b>скасував завершення модуля</b>. " +
            "submit_quiz не викликано, лічильник лишився " + api.demo.modProgress + "/12 (критерій 29 виконано й у найжорсткішому варіанті)."
          );
        }
      }
    });
    wire(api, el, onDone);
    return el;
  }

  window.AIA_VARIANT = {
    id: "c",
    title: "Підтверди дослівно",
    subtitle:
      "Завершити модуль не можна, поки ім'я не підтверджене явно — галочкою або власноруч виправленим полем. " +
      "Ціна: стіна в найтріумфальніший момент курсу. Вигода: неправильне ім'я в PDF стає майже неможливим.",

    onComplete: function (api, btn) {
      open(api, btn, function () {
        api.finishModule("Ім'я підтверджено дослівно → тільки тепер submit_quiz. Лічильник: 12/12.");
      });
    },

    scenes: function (api) {
      var demo = api.demo;
      return {
        c1: {
          group: "Ім'я для сертифіката", label: "Постійна поверхня (з шапки)",
          page: "home", width: 1280, session: "user",
          note:
            "Спільне для всіх трьох варіантів: ім'я в шапці — <code>&lt;button&gt;</code>, редагування без переходу на нову сторінку (критерій 30). " +
            "Тут жодних перешкод немає: людина прийшла сама, її не тримають.<br>" +
            "<b>Естетичний ризик макета</b> — кремова смужка з буквальним фрагментом PDF; перемикач «прев'ю імені» вгорі показує альтернативу.",
          run: function () {
            api.renderSite();
            api.openNameDialog("permanent", document.getElementById("aiaNameBtn"));
          }
        },

        c2: {
          group: "Ім'я для сертифіката", label: "Дотик: ім'я вже правильне",
          page: "module", width: 1280, session: "user",
          note:
            "Найчастіший випадок і головна перевірка варіанта C: людині, у якої все гаразд, це має коштувати <b>одну дію</b>. " +
            "Кнопка «Завершити модуль» заблокована, поки не поставлена галочка «Так, друкуйте саме так».<br>" +
            "Заблокована кнопка <b>не мовчить</b>: під нею стоїть причина в <code>role=\"status\"</code>, тобто її озвучує й скрін-рідер, а не тільки бачить око. " +
            "Спробуй Tab → пробіл → Enter: три натискання без миші.",
          actions: [
            ["Escape — скасувати", function () {
              var el = document.getElementById("aiaNameModal");
              if (el) api.closeTop("escape");
            }]
          ],
          run: function () {
            demo.modProgress = 11; demo.nameTouched = false; demo.name = "Олена Ковальчук";
            api.renderSite();
            open(api, document.getElementById("completeBtn"), function () {
              api.finishModule("Підтверджено галочкою → 12/12.");
            });
          }
        },

        c3: {
          group: "Ім'я для сертифіката", label: "Дотик: ім'я з Google — стіна",
          page: "module", width: 1280, session: "user",
          note:
            "Тут C відрізняється від B радикально. «olena p» не проходить евристику, тому <b>галочки просто немає</b>: " +
            "підтвердити таке ім'я неможливо, його треба виправити.<br>" +
            "Це і є та сама стіна, ціну якої треба назвати вголос: людина щойно закінчила 12 модулів, а їй не дають натиснути останню кнопку. " +
            "Escape лишає вихід — але виходом буде незавершений курс.",
          run: function () {
            demo.modProgress = 11; demo.nameTouched = false; demo.name = "olena p";
            api.renderSite();
            open(api, document.getElementById("completeBtn"), function () {
              api.finishModule("Ім'я виправлено вручну → 12/12.");
            });
          }
        },

        c4: {
          group: "Ім'я для сертифіката", label: "Дотик на 320 px",
          page: "module", width: 320, session: "user",
          note:
            "Найважчий кадр варіанта C: діалог тут найвищий із трьох (прев'ю + поле + галочка + причина). " +
            "Саме тому виправлення підложки (скрол + <code>margin:auto</code>) було блокуючим — без нього кнопка «Завершити модуль» просто не існувала б для користувача iPhone SE. Прокрути підложку.",
          run: function () {
            api.stage().style.height = "560px";
            demo.modProgress = 11; demo.nameTouched = false; demo.name = "Олена Ковальчук";
            api.renderSite();
            open(api, document.getElementById("completeBtn"), function () {
              api.finishModule("Підтверджено на 320×560 → 12/12.");
            });
          }
        }
      };
    }
  };
})();
