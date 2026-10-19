import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9334);
const LAND = [["/", "academy"], ["/architect","architect"], ["/claude-code","terminal"], ["/jira","jira"]];
console.log("=== К6/К1/К42/К43: акцент і дропдаун «Курси» ===");
for (const [u, course] of LAND) {
  const P = await b.page();
  await P.viewport(1280, 900, false);
  await P.goto(`${D}${u}`, 0); await P.eval("document.fonts.ready"); await sleep(1800);
  console.log(u, await P.eval(`(function(){
    var r = getComputedStyle(document.documentElement);
    function items(sel){ return Array.from(document.querySelectorAll(sel)).map(function(a){ return a.textContent.trim()+(a.getAttribute("aria-current")?"[current]":"")+"→"+a.getAttribute("href"); }); }
    var all = Array.from(document.querySelectorAll(".ds-nav__menu a, .ds-sheet a, [class*='courses'] a"));
    return JSON.stringify({
      accent: r.getPropertyValue("--c-accent").trim(),
      course: document.documentElement.getAttribute("data-course"),
      scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      coursesLinks: all.filter(function(a){ return /index\\.html|architect\\.html|claude-code\\.html|jira\\.html/.test(a.getAttribute("href")||""); }).map(function(a){ return a.textContent.trim()+(a.getAttribute("aria-current")?"[cur]":"")+"→"+a.getAttribute("href"); })
    });
  })()`));
  await P.close();
}
console.log("\n=== блок «Підтримка» на 4 лендінгах ===");
for (const [u] of LAND) {
  const P = await b.page();
  await P.viewport(1280, 900, false);
  await P.goto(`${D}${u}`, 0); await P.eval("document.fonts.ready"); await sleep(1800);
  console.log(u, await P.eval(`(function(){
    var s = document.getElementById("donate") || document.querySelector("[id*='donate'],[class*='donate']");
    if (!s) return JSON.stringify({ex:false});
    var copy = s.querySelectorAll("button, [data-copy], .ds-btn");
    return JSON.stringify({ ex:true, id: s.id, cls: s.className.split(" ").slice(0,3).join(" "),
      h2: (s.querySelector("h2")||{}).textContent, btns: Array.from(copy).map(function(bn){return bn.textContent.trim().slice(0,24)+"|"+(bn.getAttribute("data-copy")||bn.getAttribute("data-copy-value")||"");}).slice(0,8),
      iban: (s.textContent.match(/UA[0-9]{10,}/)||[null])[0] ? "є" : "нема" });
  })()`));
  await P.close();
}
console.log("\n=== К54/55/56/57: роадмап ===");
{
  const P = await b.page();
  await P.viewport(1280, 900, false);
  await P.goto(`${D}/roadmap`, 0); await P.eval("document.fonts.ready"); await sleep(2000);
  console.log(await P.eval(`(function(){
    var items = Array.from(document.querySelectorAll(".rm-row"));
    var jira = items.filter(function(x){ return /Jira/.test(x.textContent); });
    return JSON.stringify({
      title: document.title,
      og: (document.querySelector("meta[property='og:title']")||{}).content,
      ogd: (document.querySelector("meta[property='og:description']")||{}).content,
      eyebrow: (document.querySelector("[data-rm='eyebrow'], .rm-hero__eyebrow, .ds-eyebrow")||{}).textContent,
      lead: (document.querySelector(".rm-hero__lead, .ds-lead")||{}).textContent.slice(0,120),
      jiraItems: jira.map(function(x){ return x.textContent.replace(/\\s+/g," ").trim().slice(0,110); }),
      undef: /undefined/.test(document.body.textContent),
      groups: Array.from(document.querySelectorAll("details, .rm-group")).map(function(g){ return (g.querySelector("summary,.rm-group__head")||{}).textContent; })
    });
  })()`));
  await P.close();
}
console.log("\n=== К57: ?from=jira ===");
for (const q of ["jira","claude-code"]) {
  const P = await b.page(); await P.viewport(1280,900,false);
  await P.goto(`${D}/roadmap?from=${q}`,0); await P.eval("document.fonts.ready"); await sleep(1800);
  console.log(q, await P.eval(`(function(){ var a=document.querySelector(".rm-back, [class*='back'] a, a[class*='back']");
    return JSON.stringify({ back: a? a.textContent.trim()+"→"+a.getAttribute("href") : null }); })()`));
  await P.close();
}
console.log("\n=== К50: /certificate?from=jira (гість) ===");
for (const q of ["jira","claude-code","architect"]) {
  const P = await b.page(); await P.viewport(1280,900,false);
  await P.goto(`${D}/certificate?from=${q}`,0); await P.eval("document.fonts.ready"); await sleep(1800);
  console.log(q, await P.eval(`(function(){ var r=getComputedStyle(document.documentElement);
    return JSON.stringify({ course: document.documentElement.getAttribute("data-course"), accent: r.getPropertyValue("--c-accent").trim(),
      mono: (document.querySelector(".ds-hdr__mono, [class*='mono']")||{}).textContent,
      brand: (document.querySelector(".ds-hdr__brand")||{}).textContent.replace(/\\s+/g," ").trim().slice(0,40) }); })()`));
  await P.close();
}
b.close();
