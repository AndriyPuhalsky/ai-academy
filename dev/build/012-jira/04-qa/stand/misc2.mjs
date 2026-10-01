import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const UG = `(function add(){var r=document.documentElement; if(!r){setTimeout(add,0);return;} setInterval(function(){var g=document.getElementById('aiaGate'); if(g)g.remove(); var m=document.getElementById('main'); if(m)Array.prototype.forEach.call(m.children,function(c){if(c.hasAttribute&&c.hasAttribute('hidden'))c.removeAttribute('hidden');}); r.removeAttribute('data-aia-gate');},40);})();`;
const b = await browser(9334);
console.log("=== К47: «модул» у видимому тексті ===");
{
  const P = await b.page(); await P.inject(UG); await P.viewport(1280,900,false);
  const WORD = `(function(){
    var out=[]; var w=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var t; while((t=w.nextNode())){ var s=t.textContent; if(!/[Мм]одул/.test(s)) continue;
      var p=t.parentElement; if(!p) continue; var c=getComputedStyle(p);
      if(c.display==="none"||c.visibility==="hidden") continue;
      out.push((p.className||p.tagName)+" «"+s.trim().replace(/\\s+/g," ").slice(0,60)+"»"); }
    // плюс доступні імена
    var aria = Array.from(document.querySelectorAll("[aria-label]")).filter(function(n){return /[Мм]одул/.test(n.getAttribute("aria-label"));}).map(function(n){return "aria-label: "+n.getAttribute("aria-label");});
    return JSON.stringify({visible: out, aria: aria});
  })()`;
  for (const u of ["/jira","/modules/jira-01","/modules/jira-07","/modules/jira-23","/jira-ref-map"]) {
    await P.goto(`${D}${u}`,0); await P.eval("document.fonts.ready"); await sleep(1800);
    console.log("  "+u+": "+ await P.eval(WORD));
  }
  console.log("  --- контроль: інші курси мусять казати «Модуль» ---");
  for (const u of ["/modules/claude-code-07","/modules/module-01"]) {
    await P.goto(`${D}${u}`,0); await P.eval("document.fonts.ready"); await sleep(1800);
    const r = JSON.parse(await P.eval(WORD));
    console.log(`  ${u}: видимих входжень «модул» ${r.visible.length} (приклад: ${r.visible[0]||"—"})`);
  }
  await P.close();
}
console.log("\n=== К18/19: футер і слот авторизації /jira ===");
{
  const P = await b.page(); await P.viewport(1280,900,false);
  await P.goto(`${D}/jira`,0); await P.eval("document.fonts.ready"); await sleep(2000);
  console.log(await P.eval(`(function(){
    var f = document.querySelector("footer");
    return JSON.stringify({
      footerMeta: (document.getElementById("footerMeta")||{}).textContent,
      links: Array.from(f.querySelectorAll("a")).map(function(a){return a.textContent.trim().slice(0,22)+"→"+a.getAttribute("href");}),
      contact: !!document.getElementById("contactTrigger"),
      contactText: (document.getElementById("contactTrigger")||{}).textContent,
      rmEntry: !!f.querySelector(".rm-entry"),
      auth: (document.getElementById("aiaAuth")||{}).textContent.trim().slice(0,30),
      navProgress: (function(){ var n=document.getElementById("navProgress"); if(!n) return "нема вузла";
        var c=getComputedStyle(n); return "display="+c.display+" vis="+c.visibility+" w="+Math.round(n.getBoundingClientRect().width); })()
    });})()`));
  // модалка контакту
  await P.eval(`document.getElementById("contactTrigger").click(),1`); await sleep(700);
  console.log("  модалка: " + await P.eval(`(function(){ var d=document.querySelector("[role=dialog]");
    return JSON.stringify({ є: !!d, modal: d&&d.getAttribute("aria-modal"), focus: document.activeElement.id||document.activeElement.tagName }); })()`));
  await P.s("Input.dispatchKeyEvent",{type:"rawKeyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
  await P.s("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27});
  await sleep(500);
  console.log("  після Esc: " + await P.eval(`(function(){ var d=document.querySelector("[role=dialog]"); return JSON.stringify({ hidden: d? d.hasAttribute("hidden")||getComputedStyle(d).display==="none" : "нема", lock: document.documentElement.className }); })()`));
  await P.close();
}
console.log("\n=== К13: Range.toString у вікні ===");
{
  const P = await b.page(); await P.inject(UG); await P.viewport(1280,900,false);
  await P.goto(`${D}/modules/jira-05`,0); await P.eval("document.fonts.ready"); await sleep(1500);
  console.log("  " + await P.eval(`(function(){
    var w=document.querySelector("figure.win"); var r=document.createRange(); r.selectNodeContents(w);
    var a=r.toString().replace(/\\s+/g," ").trim(), b=w.textContent.replace(/\\s+/g," ").trim();
    return JSON.stringify({збіг: a===b, len: a.length, media: w.querySelectorAll("img,svg,canvas").length});})()`));
  await P.close();
}
console.log("\n=== К70: версії у футерах ===");
{
  const P = await b.page(); await P.viewport(1280,900,false);
  for (const u of ["/","/architect","/claude-code","/jira"]) {
    await P.goto(`${D}${u}`,0); await P.eval("document.fonts.ready"); await sleep(1800);
    console.log("  "+u+": "+ await P.eval(`(function(){ var m=document.getElementById("footerMeta")||document.querySelector("[id*='footerMeta'],.ds-ftr__bar");
      return m? m.textContent.replace(/\\s+/g," ").trim().slice(0,70) : "нема"; })()`));
  }
  await P.close();
}
b.close();
