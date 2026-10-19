import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const UG = `(function add(){var r=document.documentElement; if(!r){setTimeout(add,0);return;} setInterval(function(){var g=document.getElementById('aiaGate'); if(g)g.remove(); var m=document.getElementById('main'); if(m)Array.prototype.forEach.call(m.children,function(c){if(c.hasAttribute&&c.hasAttribute('hidden'))c.removeAttribute('hidden');}); r.removeAttribute('data-aia-gate');},40);})();`;
const b = await browser(9334);
console.log("=== К1: --c-accent на трьох типах сторінок Jira ===");
for (const u of ["/jira","/modules/jira-07","/jira-ref-map","/certificate?from=jira"]) {
  const P = await b.page(); await P.viewport(1280,900,false);
  await P.goto(`${D}${u}`,0); await P.eval("document.fonts.ready"); await sleep(1500);
  console.log("  "+u+": "+ await P.eval(`(function(){var r=getComputedStyle(document.documentElement);
    return JSON.stringify({accent:r.getPropertyValue("--c-accent").trim(), hover:r.getPropertyValue("--c-accent-hover").trim(), edge:r.getPropertyValue("--c-accent-edge").trim(), quiet:r.getPropertyValue("--c-accent-quiet").trim(), onAccent:r.getPropertyValue("--c-on-accent").trim(), lit: document.documentElement.hasAttribute("data-lit")});})()`));
  await P.close();
}
console.log("\n=== К5: верхній кант вікна (data-lit) ===");
{
  const P = await b.page(); await P.inject(UG); await P.viewport(1280,900,false);
  await P.goto(`${D}/modules/jira-05`,0); await P.eval("document.fonts.ready"); await sleep(2000);
  console.log("  "+ await P.eval(`(function(){ var w=document.querySelector("figure.win"); var c=getComputedStyle(w);
    return JSON.stringify({top:c.borderTopColor, right:c.borderRightColor, bottom:c.borderBottomColor, lit: document.documentElement.hasAttribute("data-lit")}); })()`));
  await P.close();
}
console.log("\n=== К59-61 (БД): що видно без акаунта ===");
{
  const P = await b.page(); await P.inject(UG); await P.viewport(1280,900,false);
  const msgs=[];
  b.on(m=>{ if(m.sessionId!==P.sessionId) return;
    if(m.method==="Runtime.consoleAPICalled") { const s=(m.params.args||[]).map(a=>a.value||a.description||"").join(" "); if(/модул|module|unknown|невідом/i.test(s)) msgs.push(m.params.type+": "+s.slice(0,120)); } });
  await P.goto(`${D}/modules/jira-07`,0); await P.eval("document.fonts.ready"); await sleep(4000);
  console.log("  повідомлень про «невідомий модуль»: " + msgs.length + (msgs.length?" → "+msgs.join(" | "):""));
  console.log("  AIA_MODULE_MAP: " + await P.eval(`(function(){ var m=window.AIA_MODULE_MAP; if(!m) return "немає (гість, auth не піднявся)";
    var ks=Object.keys(m); return JSON.stringify({ключів:ks.length, jira: ks.filter(function(k){return /^j\\d\\d$/.test(k);}).length}); })()`));
  await P.close();
}
b.close();
