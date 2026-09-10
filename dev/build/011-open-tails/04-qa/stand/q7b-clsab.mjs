// A/B CLS: база b3cb15e (8322) проти дерева (8321) там, де замір дав > 0,02.
import { browser, sleep, waitFor, CLS_PROBE, CONSOLE_PROBE } from "./qcdp.mjs";
const b = await browser();
const out = [];
const CASES = [[768, 1024, "index.html"], [768, 1024, "architect.html"], [768, 1024, "roadmap.html"], [768, 1024, "claude-code.html"], [1440, 900, "modules/module-05.html"], [1440, 900, "claude-code.html"], [390, 844, "claude-code.html"], [390, 844, "modules/claude-code-10.html"]];
for (const [tag, base] of [["БАЗА", "http://127.0.0.1:8322"], ["ПІСЛЯ", "http://127.0.0.1:8321"]]) {
  for (const [w, h, pg] of CASES) {
    for (let run = 0; run < 2; run++) {
      const lesson = pg.startsWith("modules/");
      const P = await b.page(lesson ? { blocked: ["*supabase*"] } : {});
      await P.inject(CLS_PROBE + CONSOLE_PROBE + (lesson ? `try{localStorage.setItem('sb-probe-auth-token','1')}catch(e){}` : `try{localStorage.removeItem('sb-probe-auth-token')}catch(e){}`));
      await P.viewport(w, h, w < 700);
      await P.goto(`${base}/${pg}`);
      await waitFor(P, "document.fonts.status==='loaded'", 12000);
      await sleep(2200);
      out.push({ tag, w, h, pg, run, ...(await P.eval(`({ cls: +window.__cls.value.toFixed(4),
        top: window.__cls.entries.slice().sort(function(a,c){return c.v-a.v;}).slice(0,2).map(function(e){return e.v+' ['+e.src.join(',')+']';}),
        pageX: document.documentElement.scrollWidth-window.innerWidth, errors: window.__log.errors.length })`)) });
      await P.close();
    }
  }
}
console.log(JSON.stringify(out, null, 1));
b.close();
