// Класифікація розривів усередині слова: по якій саме парі символів Chrome розірвав.
// Дефект — лише розрив МІЖ ДВОМА БУКВОЦИФРАМИ (саме так ріже overflow-wrap: anywhere).
// Розрив після дефіса, слеша, крапки, дужки — штатна можливість переносу, не дефект.
import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const WIDTHS = (process.argv[3] || "390,1280").split(",").map(Number);
const BASE = process.argv[2] || D;
const PAGES = ["jira-ref-jql","jira-ref-automation","jira-ref-map",
  "claude-code-ref-commands","claude-code-ref-settings","claude-code-ref-hooks"];

const EV = `(function(){
  function tol(el){ var lh=parseFloat(getComputedStyle(el).lineHeight);
    if(!isFinite(lh)) lh=parseFloat(getComputedStyle(el).fontSize)*1.5; return Math.max(4, lh*0.5); }
  function lineOf(tn, i, t){ // верх рядка символа i
    var r=document.createRange(); r.setStart(tn,i); r.setEnd(tn,i+1);
    var rs=Array.from(r.getClientRects()).filter(function(x){return x.height>2;});
    return rs.length? rs[0].top : null;
  }
  var res=[];
  Array.from(document.querySelectorAll("table.ds-tbl td, table.ds-tbl th")).forEach(function(cell){
    var T=tol(cell);
    var w=document.createTreeWalker(cell, NodeFilter.SHOW_TEXT), tn;
    while((tn=w.nextNode())){
      var s=tn.nodeValue; if(!s||!/\\S/.test(s)) continue;
      var re=/[^\\s]+/g, m;
      while((m=re.exec(s))){
        var word=m[0]; if(word.length<2) continue;
        var r=document.createRange(); r.setStart(tn,m.index); r.setEnd(tn,m.index+word.length);
        var rects=Array.from(r.getClientRects()).filter(function(x){return x.height>2&&x.width>0;});
        if(rects.length<2) continue;
        var tops=rects.map(function(x){return x.top;}).sort(function(a,b){return a-b;});
        var nl=0,cur=-1e9; tops.forEach(function(t){ if(t-cur>T){nl++;cur=t;} });
        if(nl<2) continue;
        // знайти індекси, де змінюється рядок
        var prev=lineOf(tn,m.index,T), breaks=[];
        for(var i=1;i<word.length;i++){
          var cu=lineOf(tn,m.index+i,T);
          if(cu!==null&&prev!==null&&Math.abs(cu-prev)>T) breaks.push(i);
          if(cu!==null) prev=cu;
        }
        breaks.forEach(function(i){
          var a=word[i-1], b=word[i];
          var alnum=/[\\p{L}\\p{N}]/u;
          res.push({ word:word.slice(0,48), at:i, pair:a+"|"+b,
            hard: alnum.test(a)&&alnum.test(b),
            sec:(function(){var n=cell;while(n&&n!==document.body){if(n.id)return "#"+n.id;n=n.parentElement;}return "";})() });
        });
      }
    }
  });
  return res;
})()`;

const b = await browser(9336); const P = await b.page();
const out = {};
for (const id of PAGES) {
  out[id] = {};
  await P.viewport(WIDTHS[0], 900, WIDTHS[0] < 700);
  await P.goto(`${BASE}/${id}${process.env.QA_EXT || ""}`, 0);
  for (const w of WIDTHS) {
    await P.viewport(w, 900, w < 700);
    await sleep(500); await P.eval(`document.fonts.ready`); await sleep(200);
    const r = await P.eval(EV);
    out[id][w] = r;
    const hard = r.filter(x => x.hard);
    console.log(`${id} @${w}: розривів ${r.length}, із них МІЖ БУКВОЦИФРАМИ ${hard.length}`);
    if (hard.length) console.log("   " + hard.slice(0, 10).map(x => `${x.sec} "${x.word}"@${x.at}(${x.pair})`).join("  "));
  }
}
await P.close(); b.close();
fs.writeFileSync(new URL(`./r2-splits.${BASE === D ? "after" : "before"}.json`, import.meta.url), JSON.stringify(out));
