import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const PERSIST_UNGATE = `
(function add(){ var r = document.documentElement; if (!r) { setTimeout(add,0); return; }
  setInterval(function(){ var g=document.getElementById('aiaGate'); if(g) g.remove();
    var m=document.getElementById('main'); if(m) Array.prototype.forEach.call(m.children,function(c){ if(c.hasAttribute&&c.hasAttribute('hidden')) c.removeAttribute('hidden'); });
    if (r.getAttribute('data-aia-gate')) r.removeAttribute('data-aia-gate'); }, 40); })();`;

const PROBE = `(function(){
  function parse(c){ var m=/rgba?\\(([^)]+)\\)/.exec(c); if(!m) return null; var p=m[1].split(",").map(parseFloat); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; }
  function over(fg, bg){ var a=fg.a; return {r: fg.r*a+bg.r*(1-a), g: fg.g*a+bg.g*(1-a), b: fg.b*a+bg.b*(1-a), a:1}; }
  function lum(c){ function f(v){ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4);} return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b); }
  function ratio(a,b){ var l1=lum(a), l2=lum(b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); }
  // композиція фону ВІД КОРЕНЯ вниз
  function bgOf(el){
    var chain=[], n=el;
    while(n && n.nodeType===1){ chain.push(n); n=n.parentElement; }
    chain.reverse();
    var acc = {r:255,g:255,b:255,a:1};
    chain.forEach(function(x){ var c=parse(getComputedStyle(x).backgroundColor); if(c && c.a>0) acc = over(c, acc); });
    return acc;
  }
  var out=[], n=0;
  Array.from(document.querySelectorAll("figure.win")).forEach(function(w){
    var walker = document.createTreeWalker(w, NodeFilter.SHOW_TEXT);
    var t;
    while((t = walker.nextNode())){
      var txt = t.textContent.trim(); if(!txt) continue;
      var p = t.parentElement; if(!p) continue;
      var cs = getComputedStyle(p);
      if (cs.visibility==="hidden" || cs.display==="none") continue;
      var r = p.getBoundingClientRect(); if (!r.width || !r.height) continue;
      n++;
      var fg = parse(cs.color); var bg = bgOf(p);
      if (fg.a < 1) fg = over(fg, bg);
      var fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight)||400;
      var large = fs >= 24 || (fs >= 18.66 && fw >= 700);
      var cr = ratio(fg, bg);
      var need = large ? 3 : 4.5;
      if (cr < need) out.push({ t: txt.slice(0,30), cls: p.className, fs: cs.fontSize, cr: Math.round(cr*100)/100, need: need, win: w.id });
    }
  });
  return { nodes: n, fails: out, min: null };
})()`;

const b = await browser(9334); const P = await b.page();
await P.inject(PERSIST_UNGATE);
await P.viewport(1280, 1000, false);
let total=0; const fails=[];
for (let i = 1; i <= 23; i++) {
  const n = String(i).padStart(2,"0");
  await P.goto(`${D}/modules/jira-${n}`, 0);
  await P.eval("document.fonts.ready"); await sleep(900);
  const r = await P.eval(PROBE);
  total += r.nodes;
  r.fails.forEach(f => fails.push({pg:"jira-"+n, ...f}));
}
// лендінг
await P.goto(`${D}/jira`,0); await P.eval("document.fonts.ready"); await sleep(1500);
const rl = await P.eval(PROBE); total += rl.nodes; rl.fails.forEach(f=>fails.push({pg:"jira",...f}));
await P.close(); b.close();
console.log("текстових вузлів у вікнах:", total, " провалів контрасту:", fails.length);
fails.slice(0,40).forEach(f=>console.log(`  ${f.pg}#${f.win} ${f.cls} ${f.fs} cr=${f.cr} (треба ${f.need}) "${f.t}"`));
fs.writeFileSync("contrast.out.json", JSON.stringify({total, fails}));
