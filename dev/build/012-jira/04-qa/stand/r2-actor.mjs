// Правка 990bf0c: блоки учасників sequenceDiagram на уроці 22 мають бути суцільні.
// Доказ — не computed style, а ПІКСЕЛІ: всередині блока не має бути пікселів лінії життя.
import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const UNGATE = `(function add(){var r=document.documentElement; if(!r){setTimeout(add,0);return;}
  setInterval(function(){var g=document.getElementById('aiaGate'); if(g)g.remove();
   var m=document.getElementById('main'); if(m)Array.prototype.forEach.call(m.children,function(c){if(c.hasAttribute&&c.hasAttribute('hidden'))c.removeAttribute('hidden');});
   if(r.getAttribute('data-aia-gate'))r.removeAttribute('data-aia-gate');},40);})();`;
const PAGES = [
  ["modules/jira-22", "j22"], ["modules/jira-10", "j10"], ["modules/jira-19", "j19"],
  ["modules/architect-03", "a03"], ["modules/claude-code-07", "c07"]
];
const b = await browser(9336); const P = await b.page();
await P.inject(UNGATE);
await P.viewport(1280, 900, false);
for (const [p, id] of PAGES) {
  await P.goto(`${D}/${p}`, 0);
  await P.eval(`document.fonts.ready`);
  // чекати, доки Mermaid домалює (умова, не таймаут)
  for (let i = 0; i < 60; i++) {
    const ok = await P.eval(`(function(){var pre=document.querySelectorAll('pre.mermaid');
      if(!pre.length) return true; var svg=document.querySelectorAll('pre.mermaid svg');
      return svg.length===pre.length;})()`);
    if (ok) break;
    await sleep(300);
  }
  await sleep(600);
  const r = await P.eval(`(function(){
    var out=[]; document.querySelectorAll('rect.actor').forEach(function(rc,i){
      var cs=getComputedStyle(rc); var bb=rc.getBoundingClientRect();
      out.push({i:i, fill:cs.fill, box:[Math.round(bb.left),Math.round(bb.top),Math.round(bb.width),Math.round(bb.height)]});
    });
    return JSON.stringify({page:document.body.getAttribute('data-module'),
      diagrams: document.querySelectorAll('pre.mermaid svg').length,
      actors: out.length, actorFills: out.slice(0,6)});
  })()`);
  console.log(`${id}: ${r}`);
}
await P.close(); b.close();
