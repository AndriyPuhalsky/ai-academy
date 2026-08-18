/* ============================================================
   AI Академія — прогрес проходження через Supabase.
   Зберігає ТОЙ САМИЙ публічний інтерфейс window.AIAProgress,
   що й раніше, тож config.js та module.js не змінюються.

   Відмінність від localStorage-версії:
   • дані живуть на сервері (таблиця progress), синхронні між
     пристроями і не підробляються з консолі браузера;
   • завершення модуля йде через RPC submit_quiz(), яка на сервері
     перевіряє, що модуль розблоковано (попередній пройдено);
   • auth.js підвантажує прогрес у кеш і кличе hydrate().

   Кеш у пам'яті дозволяє лишити completedSet() синхронним —
   саме так його викликають config.js / module.js.
   ============================================================ */
(function () {
  "use strict";

  var cache = new Set();   // коди завершених модулів: 'm01', 'a03', ...
  var hydrated = false;

  function notify() { document.dispatchEvent(new CustomEvent("aia:progress")); }

  function moduleUuid(code) {
    var map = window.AIA_MODULE_MAP;
    return map ? map[code] : null;
  }

  function loggedIn() { return !!window.AIA_USER; }

  function needLogin() {
    if (window.AIAAuth && typeof window.AIAAuth.open === "function") {
      window.AIAAuth.open("Щоб зберігати прогрес і отримати сертифікат, увійди або зареєструйся.");
    } else {
      console.warn("[AIA] Для збереження прогресу потрібен вхід.");
    }
  }

  window.AIAProgress = {
    /** Множина кодів завершених модулів, напр. Set { "m01", "m03" } */
    completedSet: function () { return new Set(cache); },

    isCompleted: function (id) { return cache.has(id); },

    /** Чи вже завантажено прогрес із сервера */
    isHydrated: function () { return hydrated; },

    /** Викликається auth.js після читання прогресу з Supabase */
    hydrate: function (codes) {
      cache = new Set(codes || []);
      hydrated = true;
      notify();
    },

    /** Сумісність зі старим інтерфейсом: true → завершити, false → зняти */
    setCompleted: function (id, value) {
      if (!id) return Promise.resolve(false);
      return value === false ? this._uncomplete(id) : this._complete(id, 100);
    },

    _complete: function (code, score) {
      if (!loggedIn()) { needLogin(); return Promise.resolve(false); }
      var sb = window.sb, uuid = moduleUuid(code);
      if (!sb || !uuid) {
        console.warn("[AIA] Supabase ще не готовий або невідомий модуль:", code);
        return Promise.resolve(false);
      }
      return sb.rpc("submit_quiz", { p_module: uuid, p_score: score == null ? 100 : score })
        .then(function (r) {
          if (r.error) throw r.error;
          var passed = r.data && r.data.passed;
          if (passed) { cache.add(code); notify(); }
          return !!passed;
        })
        .catch(function (e) {
          var msg = (e && e.message) || String(e);
          if (/заблоковано/i.test(msg)) alert("Спершу заверши попередній модуль 🙂");
          else console.error("[AIA] submit_quiz:", msg);
          return false;
        });
    },

    _uncomplete: function (code) {
      if (!loggedIn()) { needLogin(); return Promise.resolve(false); }
      var sb = window.sb, uuid = moduleUuid(code);
      if (!sb || !uuid) return Promise.resolve(false);
      return sb.rpc("uncomplete_module", { p_module: uuid })
        .then(function (r) {
          if (r.error) throw r.error;
          cache.delete(code); notify(); return true;
        })
        .catch(function (e) { console.error("[AIA] uncomplete:", e.message || e); return false; });
    },

    /** Надіслати результат квізу (реальний %). Сервер вирішує, чи зараховано (поріг 70%). */
    submitQuiz: function (code, score) { return this._complete(code, score); },

    /** Множина кодів РОЗБЛОКОВАНИХ модулів: 1-й + ті, чий попередній пройдено. */
    unlockedSet: function (modules) {
      var done = this.completedSet();
      var byNumber = {};
      (modules || []).forEach(function (m) { byNumber[m.number] = m; });
      var set = new Set();
      (modules || []).forEach(function (m) {
        var ok = (m.number <= 1) || done.has(m.id);
        if (!ok) { var prev = byNumber[m.number - 1]; if (prev && done.has(prev.id)) ok = true; }
        if (ok) set.add(m.id);
      });
      return set;
    },

    percent: function (total) { if (!total) return 0; return Math.round((cache.size / total) * 100); },

    /** Локальне очищення відображення (на сервері прогрес лишається) */
    reset: function () { cache = new Set(); notify(); }
  };
})();
