import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9334);
for (const u of ["/jira", "/claude-code", "/", "/architect"]) {
  const P = await b.page({ blocked: ["*supabase.co*"] });
  await P.viewport(1280,900,false);
  await P.goto(`${D}${u}`,0); await P.eval("document.fonts.ready"); await sleep(4500);
  console.log(`${u} (Supabase заблоковано): ` + await P.eval(`(function(){ var a=document.getElementById("aiaAuth");
    return JSON.stringify({ html: a? a.innerHTML.replace(/\\s+/g," ").trim().slice(0,70):"нема вузла", w: a? Math.round(a.getBoundingClientRect().width):null }); })()`));
  await P.close();
}
for (const u of ["/modules/jira-03", "/modules/claude-code-03", "/modules/module-03"]) {
  const P = await b.page({ blocked: ["*supabase.co*"] });
  await P.viewport(1280,900,false);
  await P.goto(`${D}${u}`,0); await P.eval("document.fonts.ready"); await sleep(5000);
  console.log(`${u} (Supabase заблоковано): ` + await P.eval(`(function(){ var m=document.getElementById("main");
    return JSON.stringify({ gate: !!document.getElementById("aiaGate"), hidden: Array.from(m.children).filter(function(c){return c.hidden;}).length,
      gateAttr: document.documentElement.getAttribute("data-aia-gate") }); })()`));
  await P.close();
}
b.close();
