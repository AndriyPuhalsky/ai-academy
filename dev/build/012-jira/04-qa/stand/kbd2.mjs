import { browser, sleep } from "./cdp.mjs";
const D = "https://dev-ai-academy.andriy-puhalsky.workers.dev";
const b = await browser(9334);
async function key(P, k, code, vk, text) {
  await P.s("Input.dispatchKeyEvent", { type: "rawKeyDown", key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, text: text||"" });
  if (text) await P.s("Input.dispatchKeyEvent", { type: "char", key: k, text });
  await P.s("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
  await sleep(180);
}
console.log("=== К44: випадайка «Курси» з клавіатури ===");
{
  const P = await b.page(); await P.viewport(1280,900,false);
  await P.goto(`${D}/jira`,0); await P.eval("document.fonts.ready"); await sleep(1800);
  const st = () => P.eval(`(function(){var b=Array.from(document.querySelectorAll("button")).filter(function(x){return /Курси/.test(x.textContent.trim());})[0];
    var m=b.closest(".ds-nav__group")||b.parentElement; var menu=m.querySelector(".ds-nav__menu, ul, div");
    return JSON.stringify({expanded:b.getAttribute("aria-expanded"), vis: menu? getComputedStyle(menu).visibility : null, focus: document.activeElement.textContent.trim().slice(0,22), isBtn: document.activeElement===b});})()`);
  await P.eval(`Array.from(document.querySelectorAll("button")).filter(function(x){return /Курси/.test(x.textContent.trim());})[0].focus(),1`);
  console.log("  фокус на кнопці:", await st());
  await key(P, "Enter", "Enter", 13, "\r");
  console.log("  після Enter:", await st());
  await key(P, "ArrowDown", "ArrowDown", 40);
  console.log("  після ↓:", await st());
  await key(P, "ArrowDown", "ArrowDown", 40); await key(P, "ArrowDown", "ArrowDown", 40); await key(P, "ArrowDown", "ArrowDown", 40);
  console.log("  після ↓×4:", await st());
  await key(P, "Escape", "Escape", 27);
  console.log("  після Esc:", await st());
  await P.close();
}
console.log("\n=== К40: скролер вікна jira-15 @390 з клавіатури ===");
{
  const P = await b.page();
  await P.inject(`(function add(){var r=document.documentElement; if(!r){setTimeout(add,0);return;} setInterval(function(){var g=document.getElementById('aiaGate'); if(g)g.remove(); var m=document.getElementById('main'); if(m)Array.prototype.forEach.call(m.children,function(c){if(c.hasAttribute&&c.hasAttribute('hidden'))c.removeAttribute('hidden');}); r.removeAttribute('data-aia-gate');},40);})();`);
  await P.viewport(390, 844, true);
  await P.goto(`${D}/modules/jira-15`,0); await P.eval("document.fonts.ready"); await sleep(1500);
  await P.eval(`window.AIA&&window.AIA.winScrollers&&window.AIA.winScrollers.sync(),1`); await sleep(400);
  console.log("  " + await P.eval(`(function(){ var sc=Array.from(document.querySelectorAll(".win__main,.win__cols,.win__tabs"));
    var ov=sc.filter(function(e){return e.scrollWidth-e.clientWidth>1;});
    window.__sc = ov[0];
    return JSON.stringify({скролерів:sc.length, переповнених:ov.length, зTabindex:sc.filter(function(e){return e.hasAttribute("tabindex");}).length,
      зайвіTabindex: sc.filter(function(e){return e.hasAttribute("tabindex") && e.scrollWidth-e.clientWidth<=1;}).length,
      label: ov[0]? ov[0].getAttribute("aria-label"):null, role: ov[0]? ov[0].getAttribute("role"):null, fade: ov[0]? ov[0].getAttribute("data-scroll-fade"):null}); })()`));
  // сфокусувати попередній елемент і натиснути Tab — щоб був справжній :focus-visible
  await P.eval(`(function(){ window.__sc.focus(); return 1; })()`);
  await key(P, "ArrowRight", "ArrowRight", 39); await key(P, "ArrowRight", "ArrowRight", 39); await key(P, "ArrowRight", "ArrowRight", 39);
  console.log("  після ArrowRight×3: scrollLeft=" + await P.eval(`window.__sc.scrollLeft`) + " fade=" + await P.eval(`window.__sc.getAttribute("data-scroll-fade")`));
  await P.close();
}
console.log("\n=== К40: 1440 — атрибутів бути не має ===");
{
  const P = await b.page();
  await P.inject(`(function add(){var r=document.documentElement; if(!r){setTimeout(add,0);return;} setInterval(function(){var g=document.getElementById('aiaGate'); if(g)g.remove(); var m=document.getElementById('main'); if(m)Array.prototype.forEach.call(m.children,function(c){if(c.hasAttribute&&c.hasAttribute('hidden'))c.removeAttribute('hidden');}); r.removeAttribute('data-aia-gate');},40);})();`);
  await P.viewport(1440, 900, false);
  await P.goto(`${D}/modules/jira-15`,0); await P.eval("document.fonts.ready"); await sleep(1500);
  await P.eval(`window.AIA&&window.AIA.winScrollers&&window.AIA.winScrollers.sync(),1`); await sleep(400);
  console.log("  " + await P.eval(`(function(){ var sc=Array.from(document.querySelectorAll(".win__main,.win__cols,.win__tabs"));
    return JSON.stringify({скролерів:sc.length, переповнених:sc.filter(function(e){return e.scrollWidth-e.clientWidth>1;}).length, зTabindex:sc.filter(function(e){return e.hasAttribute("tabindex");}).length}); })()`));
  await P.close();
}
console.log("\n=== К51: бренд /certificate за referrer ===");
for (const from of ["modules/jira-10", "modules/claude-code-10"]) {
  const P = await b.page(); await P.viewport(1280,900,false);
  await P.goto(`${D}/${from}`,0); await sleep(1500);
  await P.eval(`(function(){ var a=document.createElement("a"); a.href="../certificate.html"; document.body.appendChild(a); a.click(); return 1; })()`);
  await sleep(2500);
  console.log(`  з /${from}: ` + await P.eval(`(function(){ return JSON.stringify({path: location.pathname, course: document.documentElement.getAttribute("data-course"), brand: (document.querySelector(".ds-hdr__brand")||{}).textContent.replace(/\\s+/g," ").trim().slice(0,40)}); })()`));
  await P.close();
}
b.close();
