// Мінімальний CDP-клієнт на вбудованому WebSocket Node 25. Один Chrome (порт 9333),
// одна вкладка на виклик. Жодних інсталяцій.
export async function browser(port = 9333) {
  const info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  const ws = new WebSocket(info.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(); const listeners = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
    else if (m.method) listeners.forEach((fn) => fn(m));
  };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
    const mid = ++id; pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
  });
  const on = (fn) => listeners.push(fn);
  async function page(opts = {}) {
    const { targetId } = await send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
    const s = (m, p) => send(m, p, sessionId);
    await s("Page.enable"); await s("Runtime.enable"); await s("Network.enable");
    if (opts.blocked) await s("Network.setBlockedURLs", { urls: opts.blocked });
    /* Кеш ВИМКНЕНО завжди: у 010 і тут Chrome віддавав старі css/js із кеша (пастка №1). */
    await s("Network.setCacheDisabled", { cacheDisabled: opts.cache ? false : true });
    const P = {
      sessionId, targetId, s,
      async viewport(width, height = 900, mobile = width < 700) {
        await s("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height });
      },
      async inject(source) { return s("Page.addScriptToEvaluateOnNewDocument", { source }); },
      async goto(url, waitMs = 0) {
        const loaded = new Promise((r) => { const h = (m) => { if (m.method === "Page.loadEventFired" && m.sessionId === sessionId) { r(); } }; on(h); });
        await s("Page.navigate", { url });
        await loaded;
        if (waitMs) await new Promise((r) => setTimeout(r, waitMs));
      },
      async eval(expr) {
        const r = await s("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
        if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + (r.exceptionDetails.exception && r.exceptionDetails.exception.description));
        return r.result.value;
      },
      async shot(path, full = false) {
        const fs = await import("node:fs");
        const r = await s("Page.captureScreenshot", { format: "png", captureBeyondViewport: full });
        fs.writeFileSync(path, Buffer.from(r.data, "base64"));
      },
      async close() { await send("Target.closeTarget", { targetId }); }
    };
    return P;
  }
  return { send, on, page, close: () => ws.close() };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Чекати умову всередині сторінки (не таймаут).
export async function waitFor(P, expr, timeout = 15000, step = 100) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    if (await P.eval(expr)) return true;
    await sleep(step);
  }
  return false;
}

// Спостерігач CLS, ставиться ДО скриптів сторінки. Пастка методу: documentElement ще null.
export const CLS_PROBE = `
(function(){
  window.__cls = { value: 0, entries: [] };
  try {
    new PerformanceObserver(function(list){
      list.getEntries().forEach(function(e){
        if (e.hadRecentInput) return;
        window.__cls.value += e.value;
        window.__cls.entries.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4),
          src: (e.sources||[]).map(function(s){ var n=s.node; return n ? (n.tagName + (n.id?'#'+n.id:'') + (n.className&&typeof n.className==='string'?'.'+n.className.split(' ').slice(0,2).join('.'):'')) : '?'; }) });
      });
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) {}
})();`;
