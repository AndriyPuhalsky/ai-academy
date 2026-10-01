import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9334);
const P = await b.page(); await P.viewport(1280, 900, false);
await P.goto(`${D}/jira`,0); await P.eval("document.fonts.ready"); await sleep(2000);
console.log("=== контраст у карті (композиція від кореня) ===");
console.log(await P.eval(`(function(){
  function parse(c){ var m=/rgba?\\(([^)]+)\\)/.exec(c); if(!m) return null; var p=m[1].split(",").map(parseFloat); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; }
  function over(f,b){ var a=f.a; return {r:f.r*a+b.r*(1-a), g:f.g*a+b.g*(1-a), b:f.b*a+b.b*(1-a), a:1}; }
  function lum(c){ function f(v){v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);} return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b);}
  function ratio(a,b){var l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);}
  function bgOf(el){var ch=[],n=el; while(n&&n.nodeType===1){ch.push(n);n=n.parentElement;} ch.reverse();
    var acc={r:255,g:255,b:255,a:1}; ch.forEach(function(x){var c=parse(getComputedStyle(x).backgroundColor); if(c&&c.a>0) acc=over(c,acc);}); return acc;}
  var out=[], n=0, min=99;
  var w=document.createTreeWalker(document.getElementById("map"), NodeFilter.SHOW_TEXT); var t;
  while((t=w.nextNode())){ var s=t.textContent.trim(); if(!s) continue; var p=t.parentElement;
    var cs=getComputedStyle(p); if(cs.display==="none"||cs.visibility==="hidden") continue;
    var r=p.getBoundingClientRect(); if(!r.width) continue; n++;
    var fg=parse(cs.color), bg=bgOf(p); if(fg.a<1) fg=over(fg,bg);
    var fs=parseFloat(cs.fontSize), fw=parseInt(cs.fontWeight)||400;
    var large = fs>=24 || (fs>=18.66&&fw>=700); var need=large?3:4.5; var cr=ratio(fg,bg);
    if (cr<min) min=cr;
    if (cr<need) out.push({t:s.slice(0,28), cls:p.className, fs:cs.fontSize, cr:Math.round(cr*100)/100, need:need});
  }
  return JSON.stringify({вузлів:n, мінімум:Math.round(min*100)/100, провали:out});
})()`));
console.log("\n=== фокус у рядках карти (справжній Tab) ===");
await P.eval(`(function(){ var a=document.querySelector("#map .jira-row__link, #map a"); a.previousElementSibling; window.__first=a; return 1; })()`);
await P.eval(`(function(){ var links=Array.from(document.querySelectorAll("#map a")); window.__links=links; return links.length; })()`);
console.log("  посилань у карті:", await P.eval(`window.__links.length`));
// сфокусувати попередній у порядку й натиснути Tab
await P.eval(`(function(){ var l=window.__links[0]; l.focus(); return 1; })()`);
await P.s("Input.dispatchKeyEvent",{type:"rawKeyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
await P.s("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
await sleep(300);
console.log("  після Tab: " + await P.eval(`(function(){var a=document.activeElement; var cs=getComputedStyle(a);
  return JSON.stringify({cls:a.className, text:a.textContent.replace(/\\s+/g," ").trim().slice(0,32), fv:a.matches(":focus-visible"), shadow:cs.boxShadow.slice(0,60), outline:cs.outlineStyle});})()`));
console.log("\n=== цілі дотику в карті ≥24px? ===");
console.log(await P.eval(`(function(){ var small = window.__links.map(function(a){var r=a.getBoundingClientRect(); return {t:a.textContent.replace(/\\s+/g," ").trim().slice(0,26), w:Math.round(r.width), h:Math.round(r.height)};}).filter(function(x){return x.h<24||x.w<24;});
  return JSON.stringify({усього: window.__links.length, менших24: small.length, приклади: small.slice(0,5)}); })()`));
await P.close();
// 390
const Q = await b.page(); await Q.viewport(390,844,true);
await Q.goto(`${D}/jira`,0); await Q.eval("document.fonts.ready"); await sleep(2000);
console.log("\n=== 390: цілі дотику в карті ===");
console.log(await Q.eval(`(function(){ var ls=Array.from(document.querySelectorAll("#map a"));
  var small=ls.map(function(a){var r=a.getBoundingClientRect(); return {t:a.textContent.replace(/\\s+/g," ").trim().slice(0,26), w:Math.round(r.width), h:Math.round(r.height)};}).filter(function(x){return x.h<24;});
  return JSON.stringify({усього:ls.length, нижчих24:small.length, приклади:small.slice(0,4)}); })()`));
await Q.close();
b.close();
