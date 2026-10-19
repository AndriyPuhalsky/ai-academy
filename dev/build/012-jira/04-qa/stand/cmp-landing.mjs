import { browser, sleep } from "./cdp.mjs";
import fs from "node:fs";
const PREV = "https://dev-ai-academy.andriy-puhalsky.workers.dev/jira";
const MOCK = "http://127.0.0.1:8304/dev/design/012-jira/04-variants/_base/jira.html";
const W = [390, 768, 1024, 1280, 1440];

const PROBE = `(function(){
  function cs(sel, props){ var e = document.querySelector(sel); if(!e) return null;
    var c = getComputedStyle(e), o = {};
    props.forEach(function(p){ o[p] = c[p]; });
    var r = e.getBoundingClientRect();
    o._rect = [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
    return o; }
  var T = ["fontFamily","fontSize","lineHeight","fontWeight","letterSpacing","color","backgroundColor","marginTop","marginBottom","paddingTop","paddingBottom","borderTopWidth","borderStyle","borderColor","borderRadius","textTransform","gap","maxWidth"];
  var root = getComputedStyle(document.documentElement);
  var sections = Array.from(document.querySelectorAll("main > section, main > div > section, body > main section")).filter(function(s,i,a){ return a.indexOf(s)===i; });
  return {
    tokens: ["--c-accent","--c-accent-hover","--c-accent-quiet","--c-accent-edge","--c-on-accent","--fs-h1","--fs-h2","--fs-h3","--fs-lead","--fs-ui","--fs-small","--f-display","--f-text","--f-mono","--w-prose","--w-wide","--w-meta","--s-1","--s-2","--s-3","--s-4","--s-6","--s-8","--jira-cycle","--jira-pace","--motion","--loop-state"].reduce(function(o,k){ o[k]=root.getPropertyValue(k).trim(); return o; }, {}),
    htmlAttrs: Array.from(document.documentElement.attributes).map(function(a){return a.name+"="+a.value;}).sort(),
    doc: { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h: document.documentElement.scrollHeight },
    sections: sections.map(function(s){ var r = s.getBoundingClientRect(); return { id: s.id, cls: s.className, top: Math.round(r.top+window.scrollY), h: Math.round(r.height), w: Math.round(r.width) }; }),
    h2: Array.from(document.querySelectorAll("h2")).map(function(h){ var c=getComputedStyle(h); return { t: h.textContent.trim().slice(0,40), fs: c.fontSize, ff: c.fontFamily.split(",")[0], fw: c.fontWeight, lh: c.lineHeight, color: c.color }; }),
    hero: {
      title: cs(".jira-hero__title, h1", T),
      lead: cs(".jira-hero__lead", T),
      cta1: cs(".jira-hero__cta .ds-btn, .jira-hero .ds-btn", T),
      win: cs("#jiraHero .win, .jira-hero .win", T),
      chrome: cs("#jiraHero .win__chrome, .jira-hero .win__chrome", T),
      body: cs("#jiraHero .win__body, .jira-hero .win__body", T),
      pause: cs("#jiraHeroPause, .jira-hero__pause, [data-label-pause]", T)
    },
    cards: Array.from(document.querySelectorAll("#jiraHero .win__card, .jira-hero .win__card")).map(function(c){
      var g = getComputedStyle(c), r = c.getBoundingClientRect();
      return { cls: c.className, bt: g.borderTopWidth, bs: g.borderTopStyle, bc: g.borderTopColor, bg: g.backgroundColor, rect: [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)] };
    }),
    cols: Array.from(document.querySelectorAll("#jiraHero .win__col, .jira-hero .win__col")).map(function(c){
      var h = c.querySelector(".win__col-title, .win__col-head");
      return { t: h? h.textContent.trim() : c.textContent.trim().slice(0,20), w: Math.round(c.getBoundingClientRect().width) };
    }),
    anims: document.getAnimations().map(function(a){ return { name: (a.animationName||(a.effect&&a.effect.getKeyframes&&"css")||"?"), st: a.playState, dur: a.effect? Math.round(a.effect.getTiming().duration||0):0, it: a.effect? String(a.effect.getTiming().iterations):"?" }; }),
    nav: Array.from(document.querySelectorAll("#jiraNav a, .ds-hdr nav a")).map(function(a){ return a.textContent.trim()+"→"+a.getAttribute("href"); }),
    pageIn: document.querySelectorAll("[data-page-in]").length,
    gsap: Array.from(document.scripts).filter(function(s){return /gsap/i.test(s.src);}).length,
    configReady: document.documentElement.hasAttribute("data-config-ready") || !!document.querySelector("[data-config-ready]")
  };
})()`;

const b = await browser(9334);
const out = {};
for (const [name, url] of [["prev", PREV], ["mock", MOCK]]) {
  const P = await b.page();
  out[name] = {};
  for (const w of W) {
    await P.viewport(w, 900, w < 700);
    await P.goto(url, 0);
    await P.eval("document.fonts.ready"); await sleep(1200);
    out[name][w] = await P.eval(PROBE);
  }
  await P.close();
  process.stderr.write(name + " ok\n");
}
b.close();
fs.writeFileSync("cmp-landing.out.json", JSON.stringify(out, null, 1));
// diff токенів
console.log("=== ТОКЕНИ (1280) ===");
const a = out.prev[1280].tokens, c = out.mock[1280].tokens;
for (const k of Object.keys(a)) if (a[k] !== c[k]) console.log(`  ${k}: прев'ю="${a[k]}"  макет="${c[k]}"`);
console.log("  (решта збігається)");
console.log("\n=== <html> атрибути ===");
console.log("  прев'ю:", out.prev[1280].htmlAttrs.join(" "));
console.log("  макет :", out.mock[1280].htmlAttrs.join(" "));
console.log("\n=== СЕКЦІЇ (1280) ===");
console.log("  прев'ю:", out.prev[1280].sections.map(s=>`${s.id||s.cls.split(" ")[0]}(${s.h})`).join(" → "));
console.log("  макет :", out.mock[1280].sections.map(s=>`${s.id||s.cls.split(" ")[0]}(${s.h})`).join(" → "));
console.log("\n=== H2 ===");
out.prev[1280].h2.forEach((h,i)=>{ const m = out.mock[1280].h2[i]; console.log(`  "${h.t}" ${h.fs}/${h.ff}/${h.fw}  ||  "${m?m.t:"—"}" ${m?m.fs+"/"+m.ff+"/"+m.fw:""}`); });
console.log("\n=== HERO ===");
for (const k of Object.keys(out.prev[1280].hero)) {
  const p = out.prev[1280].hero[k], m = out.mock[1280].hero[k];
  if (!p || !m) { console.log(`  ${k}: прев'ю=${p?"є":"НЕМА"} макет=${m?"є":"НЕМА"}`); continue; }
  const d = Object.keys(p).filter(x => JSON.stringify(p[x]) !== JSON.stringify(m[x]));
  console.log(`  ${k}: ${d.length? d.map(x=>`${x}: "${p[x]}" vs "${m[x]}"`).join("; ") : "збіг"}`);
}
console.log("\n=== DOC ===");
for (const w of W) console.log(`  @${w} прев'ю sw=${out.prev[w].doc.sw} cw=${out.prev[w].doc.cw} h=${out.prev[w].doc.h} | макет sw=${out.mock[w].doc.sw} cw=${out.mock[w].doc.cw} h=${out.mock[w].doc.h}`);
console.log("\n=== NAV ===");
console.log("  прев'ю:", out.prev[1280].nav.join(" | "));
console.log("  макет :", out.mock[1280].nav.join(" | "));
console.log("\npageIn prev/mock:", out.prev[1280].pageIn, out.mock[1280].pageIn, " gsap:", out.prev[1280].gsap, out.mock[1280].gsap);
