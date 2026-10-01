import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9334);
console.log("=== К22: 12 ширин /jira ===");
{
  const P = await b.page();
  for (const w of [390,768,1023,1024,1025,1100,1152,1200,1280,1366,1440,1920]) {
    await P.viewport(w, 900, w<700);
    await P.goto(`${D}/jira`,0); await P.eval("document.fonts.ready"); await sleep(1300);
    const r = await P.eval(`(function(){ var d=document.documentElement;
      var over = Array.from(document.querySelectorAll("body *")).filter(function(n){ var r=n.getBoundingClientRect(); return r.right > d.clientWidth + 1 && getComputedStyle(n).position !== "fixed"; }).slice(0,3).map(function(n){return n.tagName+"."+(typeof n.className==="string"?n.className.split(" ")[0]:"")+"@"+Math.round(n.getBoundingClientRect().right);});
      return JSON.stringify({ d: d.scrollWidth - d.clientWidth, over: over, win: Math.round((document.querySelector("#jiraHero .win")||{getBoundingClientRect:function(){return{width:0}}}).getBoundingClientRect().width) }); })()`);
    console.log(`  ${String(w).padStart(5)}: ${r}`);
  }
  await P.close();
}
console.log("\n=== К22b: 12 ширин на уроці й довідниках ===");
{
  const P = await b.page();
  await P.inject(`(function add(){var r=document.documentElement; if(!r){setTimeout(add,0);return;} setInterval(function(){var g=document.getElementById('aiaGate'); if(g)g.remove(); var m=document.getElementById('main'); if(m)Array.prototype.forEach.call(m.children,function(c){if(c.hasAttribute&&c.hasAttribute('hidden'))c.removeAttribute('hidden');}); r.removeAttribute('data-aia-gate');},40);})();`);
  for (const u of ["/modules/jira-07","/modules/jira-15","/modules/jira-23","/jira-ref-jql","/jira-ref-automation","/jira-ref-map"]) {
    const res = [];
    for (const w of [390,768,1023,1024,1280,1440]) {
      await P.viewport(w,900,w<700);
      await P.goto(`${D}${u}`,0); await P.eval("document.fonts.ready"); await sleep(1100);
      res.push(w+":"+ await P.eval(`document.documentElement.scrollWidth - document.documentElement.clientWidth`));
    }
    console.log("  "+u+" → "+res.join("  "));
  }
  await P.close();
}
console.log("\n=== К24: без JS ===");
{
  const P = await b.page();
  await P.s("Emulation.setScriptExecutionDisabled", { value: true });
  await P.viewport(1280,900,false);
  await P.goto(`${D}/jira`,0); await sleep(1500);
  console.log(await P.eval(`1`).catch(()=> "eval недоступний (очікувано)"));
  await P.s("Emulation.setScriptExecutionDisabled", { value: false });
  const r = await P.eval(`(function(){
    var hidden = Array.from(document.querySelectorAll("body *")).filter(function(n){ var t=(n.textContent||"").trim(); if(!t||n.children.length) return false; var c=getComputedStyle(n); return parseFloat(c.opacity)===0; }).map(function(n){return n.tagName+"."+(typeof n.className==="string"?n.className.split(" ")[0]:"")+" «"+n.textContent.trim().slice(0,20)+"»";});
    return JSON.stringify({ h1: (document.querySelector("h1")||{}).textContent.replace(/\\s+/g," ").trim().slice(0,50),
      cta: document.querySelectorAll(".jira-hero a.ds-btn, #jiraHero a.ds-btn").length,
      boardText: Array.from(document.querySelectorAll("#jiraHero .win *")).filter(function(n){return !n.children.length && n.textContent.trim();}).length,
      noscript: !!document.querySelector("noscript"), playing: document.querySelectorAll(".is-playing").length,
      opacity0: hidden, scroll: document.documentElement.scrollWidth-document.documentElement.clientWidth }); })()`);
  console.log("  "+r);
  await P.close();
}
console.log("\n=== К69: зум 200 % ===");
{
  const P = await b.page();
  await P.s("Emulation.setDeviceMetricsOverride", { width: 640, height: 450, deviceScaleFactor: 1, mobile: false });
  await P.goto(`${D}/jira`,0); await P.eval("document.fonts.ready"); await sleep(1500);
  console.log("  640×450: scroll=" + await P.eval(`document.documentElement.scrollWidth-document.documentElement.clientWidth`));
  console.log("  viewport meta: " + await P.eval(`(document.querySelector("meta[name=viewport]")||{}).content`));
  await P.close();
}
console.log("\n=== К38: stateDiagram j10/j19 ===");
{
  const P = await b.page();
  await P.inject(`(function add(){var r=document.documentElement; if(!r){setTimeout(add,0);return;} setInterval(function(){var g=document.getElementById('aiaGate'); if(g)g.remove(); var m=document.getElementById('main'); if(m)Array.prototype.forEach.call(m.children,function(c){if(c.hasAttribute&&c.hasAttribute('hidden'))c.removeAttribute('hidden');}); r.removeAttribute('data-aia-gate');},40);})();`);
  for (const u of ["/modules/jira-10","/modules/jira-19","/modules/jira-22","/modules/claude-code-07"]) {
    await P.viewport(390, 844, true);
    await P.goto(`${D}${u}`,0); await P.eval("document.fonts.ready"); await sleep(3500);
    console.log("  "+u+" @390: "+ await P.eval(`(function(){
      return JSON.stringify(Array.from(document.querySelectorAll("pre.mermaid")).map(function(p){
        var svg=p.querySelector("svg"); if(!svg) return {err:"нема svg"};
        var lbl = svg.querySelector("foreignObject .nodeLabel, .nodeLabel, text");
        return { type: svg.getAttribute("aria-roledescription"), svgW: Math.round(svg.getBoundingClientRect().width),
          attrW: svg.getAttribute("width"), maxW: (svg.getAttribute("style")||"").includes("max-width"),
          scroll: Math.round(p.scrollWidth - p.clientWidth), fs: lbl? getComputedStyle(lbl).fontSize : null,
          scrollable: p.hasAttribute("data-scrollable")||p.hasAttribute("tabindex") };
      }));})()`));
  }
  await P.close();
}
b.close();
