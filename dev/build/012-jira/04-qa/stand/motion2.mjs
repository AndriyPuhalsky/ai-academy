import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9334);
async function key(P,k,code,vk,text){ await P.s("Input.dispatchKeyEvent",{type:"rawKeyDown",key:k,code,windowsVirtualKeyCode:vk,text:text||""}); if(text) await P.s("Input.dispatchKeyEvent",{type:"char",key:k,text}); await P.s("Input.dispatchKeyEvent",{type:"keyUp",key:k,code,windowsVirtualKeyCode:vk}); await sleep(200); }

console.log("=== К29: кнопка паузи ===");
{
  const P = await b.page(); await P.viewport(1280,900,false);
  await P.goto(`${D}/jira`,0); await P.eval("document.fonts.ready"); await sleep(1500);
  const st = () => P.eval(`(function(){ var bt=document.querySelector("#jiraHero button, .jira-hero button")||Array.from(document.querySelectorAll("button")).filter(function(x){return /показ/.test(x.textContent);})[0];
    var f=document.querySelector("#jiraHero [class*='fly']");
    return JSON.stringify({ tag:bt.tagName, pressed: bt.getAttribute("aria-pressed"), label: bt.textContent.trim(),
      play: getComputedStyle(f).animationPlayState, loop: getComputedStyle(document.getElementById("jiraHero")).getPropertyValue("--loop-state").trim() }); })()`);
  console.log("  до:", await st());
  await P.eval(`(function(){var bt=Array.from(document.querySelectorAll("button")).filter(function(x){return /показ/.test(x.textContent);})[0]; bt.focus(); return 1;})()`);
  await key(P,"Enter","Enter",13,"\r");
  console.log("  після Enter:", await st());
  // прокрутити hero за межі екрана й назад
  await P.eval(`window.scrollTo(0, 2500),1`); await sleep(1200);
  await P.eval(`window.scrollTo(0, 0),1`); await sleep(1200);
  console.log("  після прокрутки геть і назад:", await st());
  await key(P," ","Space",32," ");
  console.log("  після Space:", await st());
  await P.close();
}
console.log("\n=== К30: цикл поза екраном ===");
{
  const P = await b.page(); await P.viewport(1280,900,false);
  await P.goto(`${D}/jira`,0); await P.eval("document.fonts.ready"); await sleep(1500);
  console.log("  в екрані:", await P.eval(`(function(){var f=document.querySelector("#jiraHero [class*='fly']"); return getComputedStyle(f).animationPlayState + " | inline=" + document.getElementById("jiraHero").style.getPropertyValue("--loop-state");})()`));
  await P.eval(`window.scrollTo(0, 3000),1`); await sleep(1500);
  console.log("  поза екраном:", await P.eval(`(function(){var f=document.querySelector("#jiraHero [class*='fly']"); return getComputedStyle(f).animationPlayState + " | inline=" + document.getElementById("jiraHero").style.getPropertyValue("--loop-state");})()`));
  await P.eval(`window.scrollTo(0, 0),1`); await sleep(1500);
  console.log("  назад:", await P.eval(`(function(){var f=document.querySelector("#jiraHero [class*='fly']"); return getComputedStyle(f).animationPlayState + " | inline=" + document.getElementById("jiraHero").style.getPropertyValue("--loop-state");})()`));
  await P.close();
}
console.log("\n=== К31: декоративні вузли руху aria-hidden ===");
{
  const P = await b.page(); await P.viewport(1280,900,false);
  await P.goto(`${D}/jira`,0); await P.eval("document.fonts.ready"); await sleep(1500);
  console.log("  " + await P.eval(`(function(){
    var dec = Array.from(document.querySelectorAll("#jiraHero [class*='cursor'], #jiraHero [class*='trail'], #jiraHero [class*='strike'], #jiraHero [class*='flip']"));
    return JSON.stringify(dec.map(function(n){ return n.className + " aria-hidden=" + n.getAttribute("aria-hidden"); })); })()`));
  await P.close();
}
console.log("\n=== К20 (контракт, без БД): підміна AIAProgress у памʼяті ===");
{
  const P = await b.page(); await P.viewport(1280,900,false);
  await P.goto(`${D}/jira`,0); await P.eval("document.fonts.ready"); await sleep(2000);
  console.log("  до: " + await P.eval(`(function(){ var m=document.getElementById("jiraMap");
    return JSON.stringify({ done: m.querySelectorAll("[data-state='done'], .is-done").length,
      start: (m.textContent.match(/почати звідси/g)||[]).length,
      marks: Array.from(m.querySelectorAll(".jira-row")).slice(0,3).map(function(r){return r.textContent.replace(/\\s+/g," ").trim().slice(0,46);}) }); })()`));
  await P.eval(`(function(){
    window.AIAProgress = window.AIAProgress || {};
    window.AIAProgress.completedSet = function(){ return new Set(["j01","j02","j03"]); };
    window.AIAProgress.isHydrated = function(){ return true; };
    document.dispatchEvent(new CustomEvent("aia:progress", { detail: { done: ["j01","j02","j03"] } }));
    return 1; })()`);
  await sleep(900);
  console.log("  після aia:progress: " + await P.eval(`(function(){ var m=document.getElementById("jiraMap");
    return JSON.stringify({ rows: m.querySelectorAll(".jira-row").length, exam: m.querySelectorAll(".jira-exam").length,
      doneMarks: (m.textContent.match(/пройдено/g)||[]).length,
      start: (m.textContent.match(/почати звідси/g)||[]).length,
      marks: Array.from(m.querySelectorAll(".jira-row")).slice(0,5).map(function(r){return r.textContent.replace(/\\s+/g," ").trim().slice(0,46);}),
      pill: (document.getElementById("navProgress")||{}).textContent }); })()`));
  await P.eval(`document.dispatchEvent(new CustomEvent("aia:progress", { detail: { done: ["j01","j02","j03"] } })),1`);
  await sleep(700);
  console.log("  друга подія (дублю немає?): " + await P.eval(`(function(){var m=document.getElementById("jiraMap"); return JSON.stringify({rows:m.querySelectorAll(".jira-row").length, phases:m.querySelectorAll(".jira-phase").length, exam:m.querySelectorAll(".jira-exam").length});})()`));
  await P.close();
}
b.close();
