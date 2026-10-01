// Р-А: курсор тягне картку на ОБОХ переїздах (15→27 % і 42→54 % циклу).
// Анімації на паузі, крок по currentTime; міряємо вектор курсор−картка.
import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9336); const P = await b.page();
const STEP = `(function(p){ window.__as.forEach(function(a){ a.currentTime = window.__dur*p/100; }); return 1; })`;
const GEO = `(function(){
  var cur=document.querySelector("#jiraHero .jira-cursor");
  var fly=document.querySelector("#jiraHero .jira-fly");
  if(!cur||!fly) return null;
  var c=cur.getBoundingClientRect(), f=fly.getBoundingClientRect();
  return JSON.stringify({dx:Math.round((c.left-f.left)*10)/10, dy:Math.round((c.top-f.top)*10)/10,
    cl:Math.round(c.left), fl:Math.round(f.left), op:+getComputedStyle(cur).opacity});
})()`;
for (const w of [1024, 1280, 1440]) {
  await P.viewport(w, 900, false);
  await P.goto(`${D}/jira`, 0);
  await P.eval(`document.fonts.ready`); await sleep(1200);
  await P.eval(`(function(){ window.__as=document.getAnimations(); window.__as.forEach(function(a){a.pause();});
    window.__dur = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--jira-cycle'))*1000; return window.__dur; })()`);
  const dur = await P.eval(`window.__dur`);
  const seg = async (from, to, label) => {
    const pts = [];
    for (let p = from; p <= to; p += (to - from) / 8) {
      await P.eval(`(${STEP})(${p})`); await sleep(60);
      pts.push(JSON.parse(await P.eval(GEO)));
    }
    const dxs = pts.map(x => x.dx), dys = pts.map(x => x.dy);
    const rng = (a) => Math.round((Math.max(...a) - Math.min(...a)) * 10) / 10;
    console.log(`  ${label} (${from}→${to} %): dx ${Math.round(dxs[0])}→${Math.round(dxs.at(-1))} розкид ${rng(dxs)} px · dy розкид ${rng(dys)} px · картка їде ${Math.round(pts.at(-1).fl - pts[0].fl)} px`);
    return rng(dxs);
  };
  console.log(`@${w} (цикл ${dur} мс)`);
  await seg(15, 27, "переїзд 1");
  await seg(42, 54, "переїзд 2");
  // натиск перед обома переїздами
  const press = [];
  for (const p of [12, 13.5, 15, 39, 40.5, 42]) {
    await P.eval(`(${STEP})(${p})`); await sleep(60);
    press.push(p + ":" + (await P.eval(`(function(){var c=document.querySelector("#jiraHero .jira-cursor");
      var m=getComputedStyle(c).transform.match(/matrix\\(([-\\d.]+)/); return m? (+m[1]).toFixed(2):"?";})()`)));
  }
  console.log(`  натиск (scale у % циклу): ${press.join("  ")}`);
}
// reduce
await P.viewport(1280, 900, false);
await P.s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await P.goto(`${D}/jira`, 0); await P.eval(`document.fonts.ready`); await sleep(1500);
console.log("reduce:", await P.eval(`(function(){ var a=document.getAnimations();
  var run=a.filter(function(x){return x.playState==='running';});
  var cur=document.querySelector("#jiraHero .jira-cursor");
  return JSON.stringify({ анімацій:a.length, запущених:run.length,
    максТривалість: Math.max.apply(null,a.map(function(x){return (x.effect&&x.effect.getTiming().duration)||0;}).concat([0])),
    курсорTransform: cur? getComputedStyle(cur).transform.slice(0,40) : "немає",
    пауза: !!document.querySelector('#jiraHero [aria-pressed]') }); })()`));
await P.s("Emulation.setEmulatedMedia", { features: [] });
// calm до завантаження: інлайновий стан циклу
const calm = [];
for (let i = 0; i < 5; i++) {
  await P.goto(`${D}/jira`, 0);
  calm.push(await P.eval(`(function(){ var f=document.querySelector("#jiraHero .jira-fly");
    if(!f) return "немає"; var cs=getComputedStyle(f);
    return cs.animationPlayState + "|" + cs.transform.replace(/\\s/g,"").slice(0,34) + "|loop=" + (document.documentElement.style.getPropertyValue('--loop-state')||"-"); })()`));
}
console.log("calm (5 проб одразу після load):", JSON.stringify(calm));
await P.close(); b.close();
