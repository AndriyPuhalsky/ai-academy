import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9334);

// --- 1. звичайний рух: коли перша картка доходить до Done + відстань курсор↔картка
{
  const P = await b.page();
  await P.viewport(1280, 900, false);
  await P.goto(`${D}/jira`, 0); await P.eval("document.fonts.ready"); await sleep(1500);
  console.log("=== К26: цикл ===");
  console.log(await P.eval(`(function(){
    var card = document.querySelector("#jiraHero .win__card--fly, #jiraHero [class*='fly']") || document.querySelector("#jiraHero .win__card");
    var anims = document.getAnimations();
    return JSON.stringify({ anims: anims.map(function(a){return {n:a.animationName, st:a.playState, d:Math.round(a.effect.getTiming().duration), it:String(a.effect.getTiming().iterations)};}),
      cycle: getComputedStyle(document.documentElement).getPropertyValue("--jira-cycle").trim() });
  })()`));
  // траса: ставимо всі анімації на паузу і йдемо по currentTime
  console.log("\n=== Р-А: курсор ↔ картка по фазах циклу (1280) ===");
  console.log(await P.eval(`(function(){
    var as = document.getAnimations();
    as.forEach(function(a){ a.pause(); });
    var dur = Math.max.apply(null, as.map(function(a){ return a.effect.getTiming().duration||0; }));
    var cur = document.querySelector("#jiraHero [class*='cursor']");
    var fly = document.querySelector("#jiraHero [class*='fly']");
    if (!cur || !fly) return JSON.stringify({err:"не знайдено", cur: !!cur, fly: !!fly, classes: Array.from(document.querySelectorAll("#jiraHero *")).map(function(n){return n.className;}).filter(function(c){return typeof c==="string" && /cur|fly/.test(c);}).slice(0,10)});
    var res = [];
    for (var p = 0; p <= 100; p += 3) {
      as.forEach(function(a){ a.currentTime = dur * p / 100; });
      var c = cur.getBoundingClientRect(), f = fly.getBoundingClientRect();
      res.push({ p: p, dx: Math.round(c.left + c.width/2 - (f.left + f.width/2)), dy: Math.round(c.top + c.height/2 - (f.top + f.height/2)), d: Math.round(Math.hypot(c.left-f.left, c.top-f.top)) });
    }
    as.forEach(function(a){ a.play(); });
    return JSON.stringify(res);
  })()`));
  await P.close();
}
// --- 2. reduce
{
  const P = await b.page();
  await P.s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await P.viewport(1280, 900, false);
  await P.goto(`${D}/jira`, 0); await P.eval("document.fonts.ready"); await sleep(1500);
  console.log("\n=== К27: reduce ===");
  console.log(await P.eval(`(function(){
    var a = document.getAnimations();
    var running = a.filter(function(x){return x.playState==="running";});
    var maxd = Math.max.apply(null, a.map(function(x){return x.effect.getTiming().duration||0;}).concat([0]));
    var inf = a.filter(function(x){ return x.effect.getTiming().iterations === Infinity; });
    var fly = document.querySelector("#jiraHero [class*='fly']");
    var pause = document.querySelector("#jiraHeroPause, [data-label-pause]");
    return JSON.stringify({ total: a.length, running: running.length, maxDur: maxd, infinite: inf.length,
      flyTransform: fly? getComputedStyle(fly).transform : null,
      pauseVisible: pause? getComputedStyle(pause).display !== "none" && getComputedStyle(pause).visibility !== "hidden" : null,
      motion: getComputedStyle(document.documentElement).getPropertyValue("--motion").trim(),
      doneCards: document.querySelectorAll("#jiraHero .win__col[data-cat='done'] .win__card").length });
  })()`));
  await P.close();
}
// --- 3. calm ДО завантаження
{
  const P = await b.page();
  await P.inject(`(function add(){ var r=document.documentElement; if(!r){setTimeout(add,0);return;} r.setAttribute("data-motion","calm"); })();`);
  await P.viewport(1280, 900, false);
  await P.goto(`${D}/jira`, 0); await P.eval("document.fonts.ready"); await sleep(1500);
  console.log("\n=== К28: calm (5 проб) ===");
  const probes = [];
  for (let i = 0; i < 5; i++) {
    probes.push(await P.eval(`(function(){ var f=document.querySelector("#jiraHero [class*='fly']");
      return JSON.stringify({ tr: getComputedStyle(f).transform, ps: getComputedStyle(f).animationPlayState,
        inline: document.getElementById("jiraHero").style.getPropertyValue("--loop-state"),
        loop: getComputedStyle(document.getElementById("jiraHero")).getPropertyValue("--loop-state").trim(),
        motion: getComputedStyle(document.documentElement).getPropertyValue("--motion").trim() }); })()`));
    await sleep(700);
  }
  console.log(probes.join("\n"));
  await P.close();
}
b.close();
