/* Точковий пробник однієї таблиці: що саме в комірці і як вона ламається. */
import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";

const ORIGIN = "http://127.0.0.1:8302";
const page = process.argv[2];
const sel = process.argv[3];          // CSS-селектор таблиці
const width = Number(process.argv[4] || 390);
const cssArg = process.argv.find(a => a.startsWith("--css="));
const extraCss = cssArg ? fs.readFileSync(cssArg.slice(6), "utf8") : "";

const b = await browser(9335);
const P = await b.page();
if (extraCss) await P.inject(`(function add(){var r=document.documentElement; if(!r){setTimeout(add,0);return;}
  var go=function(){ if(document.getElementById('__fixcss'))return; var st=document.createElement('style'); st.id='__fixcss'; st.textContent=${JSON.stringify(extraCss)}; (document.head||r).appendChild(st); };
  go(); document.addEventListener('DOMContentLoaded', go); setTimeout(go,50); setTimeout(go,400);})();`);
await P.viewport(width, 900, width < 700);
await P.goto(`${ORIGIN}/${page}.html`, 0);
await P.eval(`document.fonts.ready`);
await sleep(600);
const out = await P.eval(`(function(){
  var t = document.querySelector(${JSON.stringify(sel)});
  if (!t) return "no table";
  function lines(cell){ var r=document.createRange(); r.selectNodeContents(cell);
    var ys={}; Array.from(r.getClientRects()).filter(function(x){return x.height>2&&x.width>0;}).forEach(function(x){ys[Math.round(x.top)]=1;});
    return Object.keys(ys).length; }
  var rows = Array.from(t.rows);
  return rows.map(function(r){ return Array.from(r.cells).map(function(c){
    var cs=getComputedStyle(c);
    return { txt: c.textContent.trim().slice(0,30), html: c.innerHTML.trim().slice(0,70),
      w: Math.round(c.getBoundingClientRect().width*10)/10,
      ln: lines(c), ws: cs.whiteSpace, ow: cs.overflowWrap, wb: cs.wordBreak,
      ff: cs.fontFamily.split(",")[0], fs: cs.fontSize, mw: cs.minWidth, pad: cs.paddingLeft };
  }); });
})()`);
console.log(JSON.stringify(out, null, 1));
await P.close(); b.close();
