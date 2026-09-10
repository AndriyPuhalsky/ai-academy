// Надбудова над stand/cdp.mjs: збір консолі (page + browser Log) і мережі на кожну вкладку.
import { browser as baseBrowser, sleep, waitFor, CLS_PROBE } from "./cdp.mjs";
export { sleep, waitFor, CLS_PROBE };

// Проба, що ловить помилки самої сторінки (Log.entryAdded не бачить console.* до Log.enable).
export const CONSOLE_PROBE = `
(function(){
  window.__log = { errors: [], warns: [], rejections: [] };
  try {
    var ce = console.error, cw = console.warn;
    console.error = function(){ try{ window.__log.errors.push([].map.call(arguments,String).join(' ').slice(0,300)); }catch(e){} return ce.apply(console, arguments); };
    console.warn  = function(){ try{ window.__log.warns.push([].map.call(arguments,String).join(' ').slice(0,300)); }catch(e){} return cw.apply(console, arguments); };
    window.addEventListener('error', function(e){ try{ window.__log.errors.push('onerror: ' + (e.message||'') + ' @' + (e.filename||'')); }catch(x){} });
    window.addEventListener('unhandledrejection', function(e){ try{ window.__log.rejections.push(String(e.reason).slice(0,300)); }catch(x){} });
  } catch(e){}
})();`;

export async function browser(port = 9333) {
  const b = await baseBrowser(port);
  const origPage = b.page.bind(b);
  b.page = async function (opts = {}) {
    const P = await origPage(opts);
    P.net = [];        // { url, status }
    P.browserLog = []; // Log.entryAdded (мережеві 404, CSP, deprecations)
    b.on((m) => {
      if (m.sessionId !== P.sessionId) return;
      if (m.method === "Network.responseReceived") {
        P.net.push({ url: m.params.response.url, status: m.params.response.status, type: m.params.type });
      } else if (m.method === "Network.loadingFailed") {
        P.net.push({ url: "(failed) " + (m.params.requestId || ""), status: 0, err: m.params.errorText, type: m.params.type });
      } else if (m.method === "Log.entryAdded") {
        const e = m.params.entry;
        P.browserLog.push({ level: e.level, src: e.source, text: String(e.text).slice(0, 250), url: (e.url || "").slice(0, 160) });
      }
    });
    await P.s("Log.enable");
    return P;
  };
  return b;
}

// Контраст WCAG за двома hex.
export function contrast(hexA, hexB) {
  const lum = (h) => {
    const c = h.replace("#", "").match(/../g).map((x) => parseInt(x, 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const a = lum(hexA), b = lum(hexB);
  return +(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05))).toFixed(2);
}
