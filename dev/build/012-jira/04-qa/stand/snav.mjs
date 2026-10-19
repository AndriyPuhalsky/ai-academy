import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const UG = `(function add(){var r=document.documentElement; if(!r){setTimeout(add,0);return;} setInterval(function(){var g=document.getElementById('aiaGate'); if(g)g.remove(); var m=document.getElementById('main'); if(m)Array.prototype.forEach.call(m.children,function(c){if(c.hasAttribute&&c.hasAttribute('hidden'))c.removeAttribute('hidden');}); r.removeAttribute('data-aia-gate');},40);})();`;
const b = await browser(9334);
for (const u of ["/modules/jira-01","/modules/jira-12","/modules/claude-code-01","/modules/module-01"]) {
  const P = await b.page(); await P.inject(UG); await P.viewport(1280,900,false);
  await P.goto(`${D}${u}`,0); await P.eval("document.fonts.ready"); await sleep(2500);
  console.log(u + ": " + await P.eval(`(function(){ var s=document.querySelector(".ds-snav")||document.getElementById("moduleNav");
    if(!s) return "сайдбара нема";
    return JSON.stringify({ li: s.querySelectorAll("li").length, a: s.querySelectorAll("a").length, span: s.querySelectorAll("span.ds-snav__item, li > span").length,
      current: (s.querySelector("[aria-current]")||{}).textContent, перші3: Array.from(s.querySelectorAll("li")).slice(0,3).map(function(x){return x.textContent.replace(/\\s+/g," ").trim().slice(0,30);}) }); })()`));
  await P.close();
}
b.close();
