import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const PERSIST_UNGATE = `
(function add(){ var r = document.documentElement; if (!r) { setTimeout(add,0); return; }
  setInterval(function(){ var g=document.getElementById('aiaGate'); if(g) g.remove();
    var m=document.getElementById('main'); if(m) Array.prototype.forEach.call(m.children,function(c){ if(c.hasAttribute&&c.hasAttribute('hidden')) c.removeAttribute('hidden'); });
    if (r.getAttribute('data-aia-gate')) r.removeAttribute('data-aia-gate'); }, 40); })();`;

const P_WINS = `(function(){
  function hex(c){ return c; }
  return Array.from(document.querySelectorAll("figure.win")).map(function(w){
    var cls = w.className, id = w.id;
    var chrome = w.querySelector(".win__chrome"), body = w.querySelector(".win__body"), main = w.querySelector(".win__main");
    var cs = getComputedStyle(w), cch = chrome? getComputedStyle(chrome):null, cb = body? getComputedStyle(body):null;
    // статуси колонок дошки
    var cols = Array.from(w.querySelectorAll(".win__col")).map(function(c){
      var g = getComputedStyle(c);
      return { cat: c.getAttribute("data-cat")||c.className.replace("win__col","").trim(), bt: g.borderTopWidth, bs: g.borderTopStyle, bc: g.borderTopColor, bg: g.backgroundColor, w: Math.round(c.getBoundingClientRect().width) };
    });
    var cards = Array.from(w.querySelectorAll(".win__card")).map(function(c){ var g=getComputedStyle(c); return { bt:g.borderTopWidth, bs:g.borderTopStyle, bc:g.borderTopColor, bg:g.backgroundColor }; });
    var create = w.querySelector(".win__create, .win__btn--create, [class*='create']");
    var big = [];
    (function walk(n){ if(n.nodeType===3){ var t=n.textContent.trim(); if(t){ var p=n.parentElement, g=getComputedStyle(p); if(parseFloat(g.fontSize)>14) big.push({t:t.slice(0,25), fs:g.fontSize, cls:p.className}); } return; }
      if(n.nodeType===1) Array.prototype.forEach.call(n.childNodes, walk); })(w);
    var r = w.getBoundingClientRect();
    return { id: id, cls: cls, w: Math.round(r.width),
      winBg: cs.backgroundColor, chromeBg: cch? cch.backgroundColor : null, bodyBg: cb? cb.backgroundColor : null,
      borderTop: cs.borderTopWidth+" "+cs.borderTopStyle+" "+cs.borderTopColor,
      cols: cols, cards: cards.slice(0,6),
      create: create? { cls: create.className, bw: getComputedStyle(create).borderTopWidth, bc: getComputedStyle(create).borderTopColor, color: getComputedStyle(create).color } : null,
      big: big,
      media: w.querySelectorAll("img,svg,canvas").length,
      mainOv: main? Math.round(main.scrollWidth - main.clientWidth) : null,
      mainTab: main? main.getAttribute("tabindex") : null,
      mainFade: main? main.getAttribute("data-scroll-fade") : null
    };
  });
})()`;

const b = await browser(9334); const P = await b.page();
await P.inject(PERSIST_UNGATE);
const out = {};
for (let i = 1; i <= 23; i++) {
  const n = String(i).padStart(2, "0");
  out["jira-"+n] = {};
  for (const w of [390, 1280]) {
    await P.viewport(w, 1000, w < 700);
    await P.goto(`${D}/modules/jira-${n}`, 0);
    await P.eval("document.fonts.ready"); await sleep(1200);
    await P.eval(`window.AIA&&window.AIA.winScrollers&&window.AIA.winScrollers.sync(),1`);
    await sleep(300);
    out["jira-"+n][w] = await P.eval(P_WINS);
  }
}
// галерея макета
out["gallery"] = {};
for (const w of [390, 1280]) {
  await P.viewport(w, 1000, w < 700);
  await P.goto("http://127.0.0.1:8304/dev/design/012-jira/04-variants/_base/gallery.html", 0);
  await P.eval("document.fonts.ready"); await sleep(1500);
  out["gallery"][w] = await P.eval(P_WINS);
}
await P.close(); b.close();
fs.writeFileSync("wins.out.json", JSON.stringify(out));
const all = Object.entries(out).filter(([k])=>k!=="gallery").flatMap(([k,v]) => v[1280].map(x=>({pg:k,...x})));
console.log("вікон на 23 уроках (1280):", all.length, " у галереї макета:", out.gallery[1280].length);
console.log("медіа всередині вікон:", all.reduce((s,x)=>s+x.media,0));
console.log("текст > 14px у вікнах:", JSON.stringify(all.flatMap(x=>x.big.map(b=>`${x.pg}#${x.id} ${b.cls} ${b.fs} "${b.t}"`)), null, 0).slice(0,1200));
console.log("\n=== канти колонок за категорією (унікальні) ===");
const sigs = {};
all.concat(out.gallery[1280].map(x=>({pg:"gallery",...x}))).forEach(x => x.cols.forEach(c => {
  const k = `${c.cat} :: ${c.bt} ${c.bs} ${c.bc} bg=${c.bg}`;
  sigs[k] = (sigs[k]||0)+1; }));
Object.entries(sigs).sort().forEach(([k,v])=>console.log(`  ${v}×  ${k}`));
console.log("\n=== поверхня vs шапка (Р13), унікальні пари ===");
const p = {};
all.concat(out.gallery[1280].map(x=>({pg:"gallery",...x}))).forEach(x => { const k = `win=${x.winBg} chrome=${x.chromeBg} body=${x.bodyBg}`; p[k]=(p[k]||0)+1; });
Object.entries(p).forEach(([k,v])=>console.log(`  ${v}×  ${k}`));
console.log("\n=== + Create ===");
const cr = {}; all.concat(out.gallery[1280].map(x=>({pg:"gallery",...x}))).forEach(x=>{ if(x.create){ const k=`${x.create.cls} bw=${x.create.bw} bc=${x.create.bc} color=${x.create.color}`; cr[k]=(cr[k]||0)+1; }});
Object.entries(cr).forEach(([k,v])=>console.log(`  ${v}×  ${k}`));
