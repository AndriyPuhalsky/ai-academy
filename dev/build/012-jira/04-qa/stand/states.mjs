import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9334);
console.log("=== конфіг не доїхав ===");
{
  const P = await b.page({ blocked: ["*jira.config.json*"] });
  await P.viewport(1280, 900, false);
  await P.goto(`${D}/jira`, 0); await P.eval("document.fonts.ready"); await sleep(2500);
  console.log("  " + await P.eval(`(function(){ var e=document.getElementById("configError"); var m=document.getElementById("jiraMap");
    return JSON.stringify({ configError: e? getComputedStyle(e).display!=="none" : "нема вузла",
      h1: (document.querySelector("h1")||{}).textContent.replace(/\\s+/g," ").trim().slice(0,40),
      cta: document.querySelectorAll("#jiraHero a.ds-btn").length,
      mapH: m? Math.round(m.getBoundingClientRect().height) : null,
      footerMeta: (document.getElementById("footerMeta")||{}).textContent,
      scroll: document.documentElement.scrollWidth-document.documentElement.clientWidth,
      ready: document.documentElement.hasAttribute("data-config-ready") }); })()`));
  await P.close();
}
console.log("\n=== Supabase лежить (гість) ===");
{
  const P = await b.page({ blocked: ["*supabase.co*"] });
  await P.viewport(1280, 900, false);
  await P.goto(`${D}/jira`, 0); await P.eval("document.fonts.ready"); await sleep(4000);
  console.log("  лендінг: " + await P.eval(`(function(){ return JSON.stringify({
    auth: (document.getElementById("aiaAuth")||{}).textContent.trim().slice(0,24),
    pill: (function(){var n=document.getElementById("navProgress"); return n? getComputedStyle(n).display+"/"+Math.round(n.getBoundingClientRect().width):"нема";})(),
    map: document.querySelectorAll("#jiraMap .jira-row").length, scroll: document.documentElement.scrollWidth-document.documentElement.clientWidth }); })()`));
  await P.goto(`${D}/modules/jira-01`, 0); await P.eval("document.fonts.ready"); await sleep(5000);
  console.log("  урок: " + await P.eval(`(function(){ var g=document.getElementById("aiaGate"); var m=document.getElementById("main");
    return JSON.stringify({ gate: !!g, gateText: g? g.textContent.replace(/\\s+/g," ").trim().slice(0,70):null,
      hiddenKids: Array.from(m.children).filter(function(c){return c.hidden;}).length,
      scroll: document.documentElement.scrollWidth-document.documentElement.clientWidth }); })()`));
  await P.close();
}
console.log("\n=== offline ===");
{
  const P = await b.page();
  await P.viewport(1280, 900, false);
  await P.goto(`${D}/jira`, 0); await P.eval("document.fonts.ready"); await sleep(1500);
  await P.s("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await sleep(500);
  await P.eval(`(function(){ var a=document.querySelector("#jiraHero a.ds-btn"); window.__href=a.getAttribute("href"); return 1; })()`);
  console.log("  CTA href під час offline:", await P.eval(`window.__href`));
  await P.s("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await P.close();
}
b.close();
