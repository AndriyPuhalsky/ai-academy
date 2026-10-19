import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const UG = `(function add(){var r=document.documentElement; if(!r){setTimeout(add,0);return;} setInterval(function(){var g=document.getElementById('aiaGate'); if(g)g.remove(); var m=document.getElementById('main'); if(m)Array.prototype.forEach.call(m.children,function(c){if(c.hasAttribute&&c.hasAttribute('hidden'))c.removeAttribute('hidden');}); r.removeAttribute('data-aia-gate');},40);})();`;
const b = await browser(9334);
for (const u of ["/modules/jira-01","/modules/jira-12","/modules/jira-23"]) {
  const P = await b.page(); await P.inject(UG); await P.viewport(1280,900,false);
  await P.goto(`${D}${u}`,0); await P.eval("document.fonts.ready"); await sleep(2000);
  console.log(u + ": " + await P.eval(`(function(){
    var q = document.getElementById("quiz") || document.querySelector("[class*='quiz']");
    var data = document.getElementById("quizData");
    var n = 0; try { n = JSON.parse(data.textContent).length; } catch(e) { n = "JSON не парситься: "+e.message; }
    return JSON.stringify({ питань: n, намальовано: document.querySelectorAll(".ds-quiz__q, .quiz__q, [class*='quiz'] fieldset, [class*='quiz'] li").length,
      сайдбар: document.querySelectorAll(".ds-snav a, #moduleNav a").length,
      count: (document.querySelector(".ds-snav__count")||{}).textContent,
      next: (document.querySelector(".ds-mnav")||{}).textContent.replace(/\\s+/g," ").trim().slice(0,70),
      completeTitle: (document.getElementById("completeTitle")||{}).textContent }); })()`));
  await P.close();
}
b.close();
