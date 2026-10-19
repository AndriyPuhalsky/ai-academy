// Смоук після правки components.css: 4 лендінги + по уроку кожного курсу.
// Консоль (винятки, помилки, збої мережі), скрол <body> на 390 і 1280,
// випадайка «Курси», блок «Підтримка».
import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const PAGES = ["index", "architect", "claude-code", "jira",
  "modules/module-01", "modules/architect-09", "modules/claude-code-07", "modules/jira-15",
  "jira-ref-map", "jira-ref-jql", "jira-ref-automation", "claude-code-ref-commands"];
const b = await browser(9336);
const UNGATE = `(function add(){var r=document.documentElement; if(!r){setTimeout(add,0);return;}
  setInterval(function(){var g=document.getElementById('aiaGate'); if(g)g.remove();
   var m=document.getElementById('main'); if(m)Array.prototype.forEach.call(m.children,function(c){if(c.hasAttribute&&c.hasAttribute('hidden'))c.removeAttribute('hidden');});
   if(r.getAttribute('data-aia-gate'))r.removeAttribute('data-aia-gate');},40);})();`;
for (const pg of PAGES) {
  const P = await b.page();
  const logs = [];
  b.on((m) => {
    if (m.sessionId !== P.sessionId) return;
    if (m.method === "Runtime.exceptionThrown") logs.push("ВИНЯТОК: " + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text || "").slice(0, 120));
    if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type)) {
      const t = m.params.args.map(a => a.value || a.description || "").join(" ").slice(0, 110);
      if (!/cdn\.tailwindcss\.com/.test(t)) logs.push(m.params.type.toUpperCase() + ": " + t);
    }
    if (m.method === "Network.loadingFailed") logs.push("МЕРЕЖА: " + (m.params.errorText || "") + " " + (m.params.type || ""));
  });
  await P.inject(UNGATE);
  const res = {};
  for (const w of [390, 1280]) {
    await P.viewport(w, 900, w < 700);
    await P.goto(`${D}/${pg}`, 0);
    await P.eval(`document.fonts.ready`); await sleep(1600);
    res[w] = await P.eval(`(function(){
      var m=document.getElementById('coursesMenu');
      var sup=document.querySelector('[data-copy], .ds-donate, #donate, [id*="donate" i]');
      var iban=(document.body.innerText.match(/UA\\d{20,}/)||[])[0]||null;
      return JSON.stringify({ скрол: document.documentElement.scrollWidth-document.documentElement.clientWidth,
        поза: Array.from(document.querySelectorAll('body *')).filter(function(e){
          if (e.closest('.ds-tbl__wrap,.ds-diag,.term,.ds-code,.win__main,.win__cols,.win__tabs,.ds-nav__menu,.ds-drawer,[hidden]')) return false;
          var r=e.getBoundingClientRect(); return r.width>0 && r.right > document.documentElement.clientWidth + 1; }).length,
        курсиПунктів: m? m.querySelectorAll('[role=menuitem]').length : null,
        ariaCurrent: m? (m.querySelector('[aria-current]')||{}).textContent : null,
        підтримка: !!sup, iban: iban });
    })()`);
  }
  console.log(`${pg.padEnd(26)} 390: ${res[390]}\n${"".padEnd(26)} 1280: ${res[1280]}\n${"".padEnd(26)} консоль: ${logs.length ? logs.slice(0, 4).join(" || ") : "чисто"}`);
  await P.close();
}
b.close();
