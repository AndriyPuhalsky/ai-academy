// Рішення 4, критерій 9 без акаунта: офлайн-проба бекендера (Supabase заглушений, мережі немає).
import { browser, sleep, waitFor, CONSOLE_PROBE } from "./qcdp.mjs";
const LOCAL = "http://127.0.0.1:8321/dev/build/011-open-tails/02-backend/probe-cert-empty.html";
const b = await browser();
const out = {};
for (const m of ["none", "terminal", "architect", "xss"]) {
  const P = await b.page({ blocked: ["*supabase*", "*hpcyrnxschpxlrxudmqk*"] });
  await P.inject(CONSOLE_PROBE);
  await P.viewport(1280, 900);
  await P.goto(`${LOCAL}?m=${m}`);
  await waitFor(P, "document.body.textContent.indexOf('До програми') >= 0", 8000);
  await sleep(400);
  out[m] = await P.eval(`(function(){
    var a=[].filter.call(document.querySelectorAll('a'), function(e){return /До програми/.test(e.textContent);})[0];
    return { href: a ? a.getAttribute('href') : null, attrs: a ? [].map.call(a.attributes,function(x){return x.name;}) : null,
      AIA_CERT: window.AIA_CERT ? window.AIA_CERT.program : null,
      net: 'див. P.net' };
  })()`);
  out[m].requests = P.net.filter((x) => !x.url.startsWith("http://127.0.0.1")).map((x) => x.status + " " + x.url.slice(0, 60));
  out[m].log = await P.eval(`({errors: window.__log.errors, rej: window.__log.rejections})`);
  await P.close();
}
console.log(JSON.stringify(out, null, 1));
b.close();
