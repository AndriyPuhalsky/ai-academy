import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9334);

// --- 1. data-jira ключі, карта, перший екран
const P = await b.page();
await P.viewport(1280, 653, false);
await P.goto(`${D}/jira`, 0); await P.eval("document.fonts.ready"); await sleep(1500);
console.log("=== К15: data-jira ===");
console.log(await P.eval(`(function(){
  var ns = Array.from(document.querySelectorAll("[data-jira]"));
  var empty = ns.filter(function(n){ return !n.textContent.trim(); });
  return JSON.stringify({ total: ns.length, empty: empty.map(function(n){return n.getAttribute("data-jira");}) });
})()`));
console.log("\n=== К16/17: секції й нав ===");
console.log(await P.eval(`(function(){
  return JSON.stringify({
    sections: Array.from(document.querySelectorAll("main > section")).map(function(s){return s.id || s.className.split(" ")[0];}),
    author: !!document.getElementById("author"),
    navDesktop: Array.from(document.querySelectorAll("#jiraNav a")).map(function(a){return a.textContent.trim();}),
    navMobile: Array.from(document.querySelectorAll("#jiraNavMobile a")).map(function(a){return a.textContent.trim();}),
    gaps: Array.from(document.querySelectorAll("main > section")).map(function(s,i,arr){
      if(!i) return null; var prev = arr[i-1].getBoundingClientRect(), cur = s.getBoundingClientRect();
      return Math.round(cur.top - prev.bottom); }).filter(function(x){return x!==null;})
  });
})()`));
console.log("\n=== К21: карта ===");
console.log(await P.eval(`(function(){
  var map = document.getElementById("jiraMap");
  return JSON.stringify({
    rows: map.querySelectorAll(".jira-row").length,
    exam: map.querySelectorAll(".jira-exam").length,
    phases: map.querySelectorAll(".jira-phase").length,
    links: map.querySelectorAll("a").length,
    nodes: map.querySelectorAll(".jira-phase__node").length,
    refs: document.querySelectorAll("#refs a").length,
    cls: map.className, parent: map.parentElement.className,
    reveal: map.hasAttribute("data-reveal-root")
  });
})()`));
console.log("\n=== К23: перший екран 1280×653 ===");
console.log(await P.eval(`(function(){
  var btns = Array.from(document.querySelectorAll(".jira-hero a.ds-btn, #jiraHero a.ds-btn"));
  var h1 = document.querySelector("h1");
  var r = document.createRange(); r.selectNodeContents(h1);
  var lines = new Set(Array.from(r.getClientRects()).filter(function(x){return x.height>2;}).map(function(x){return Math.round(x.top);})).size;
  var win = document.querySelector("#jiraHero .win, .jira-hero .win");
  var main = document.querySelector("main");
  return JSON.stringify({
    ctaBottoms: btns.map(function(b){ return Math.round(b.getBoundingClientRect().bottom + window.scrollY); }),
    h1Lines: lines,
    winW: Math.round(win.getBoundingClientRect().width),
    winRight: Math.round(win.getBoundingClientRect().right),
    contentRight: Math.round(main.getBoundingClientRect().right),
    vp: innerHeight
  });
})()`));
console.log("\n=== К32/68: консоль і сторонні ===");
await P.close();

// --- 2. консоль на 7 сторінках
const pages = ["/jira","/modules/jira-01","/modules/jira-10","/modules/jira-23","/jira-ref-jql","/jira-ref-automation","/jira-ref-map","/roadmap","/certificate","/verify","/","/architect","/claude-code"];
for (const u of pages) {
  const Q = await b.page();
  const msgs = [], failed = [];
  b.on(m => {
    if (m.sessionId !== Q.sessionId) return;
    if (m.method === "Runtime.consoleAPICalled" && (m.params.type === "error" || m.params.type === "warning"))
      msgs.push(m.params.type + ": " + (m.params.args||[]).map(a=>a.value||a.description||a.type).join(" ").slice(0,160));
    if (m.method === "Runtime.exceptionThrown")
      msgs.push("EXC: " + (m.params.exceptionDetails.text||"") + " " + ((m.params.exceptionDetails.exception||{}).description||"").slice(0,160));
    if (m.method === "Network.loadingFailed") failed.push(m.params.errorText);
    if (m.method === "Network.responseReceived" && m.params.response.status >= 400) failed.push(m.params.response.status + " " + m.params.response.url.slice(0,110));
  });
  await Q.viewport(1280, 900, false);
  await Q.goto(`${D}${u}`, 0); await Q.eval("document.fonts.ready"); await sleep(2500);
  console.log(`${u}: помилок ${msgs.length}, мережевих збоїв ${failed.length}`);
  msgs.slice(0,5).forEach(x=>console.log("    "+x));
  failed.slice(0,5).forEach(x=>console.log("    NET "+x));
  await Q.close();
}
b.close();
