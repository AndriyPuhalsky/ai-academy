// КОЛО 2 · CLS сторінки /claude-code-ref-settings @390 і @1280.
// A/B на ОДНОМУ хості (localhost): 8332 = дерево ДО фікса (d7ec232~1), 8331 = дерево ПІСЛЯ (d7ec232).
// Плюс контрольний прогін на самому превʼю. По 3 прогони на комбінацію.
import { browser, sleep, waitFor, CLS_PROBE, CONSOLE_PROBE } from "./qcdp.mjs";
import fs from "node:fs";
const b = await browser();
const out = [];
const TARGETS = [["ДО", "http://127.0.0.1:8332"], ["ПІСЛЯ", "http://127.0.0.1:8331"], ["превʼю", "https://dev-ai-academy.andriy-puhalsky.workers.dev"]];
for (const [tag, base] of TARGETS) {
  for (const [w, h] of [[390, 844], [1280, 900]]) {
    for (let run = 0; run < 3; run++) {
      const P = await b.page({ blocked: ["*supabase*"] });
      await P.inject(CLS_PROBE + CONSOLE_PROBE);
      await P.viewport(w, h, w < 700);
      await P.goto(`${base}/claude-code-ref-settings${base.startsWith("http://127") ? ".html" : ""}`);
      await waitFor(P, "document.fonts.status==='loaded'", 15000);
      await sleep(2500);
      out.push({ tag, w, run, ...(await P.eval(`({ cls: +window.__cls.value.toFixed(4),
        n: window.__cls.entries.length,
        top: window.__cls.entries.slice().sort(function(a,c){return c.v-a.v;}).slice(0,2).map(function(e){return e.v+' ['+e.src.join(',')+']';}),
        pageX: document.documentElement.scrollWidth - window.innerWidth,
        errors: window.__log.errors.length, rej: window.__log.rejections.length })`)) });
      await P.close();
    }
  }
}
fs.writeFileSync("/Users/ander1.sage/Downloads/AIA/dev/build/011-open-tails/04-qa/stand/r2f.out.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
b.close();
