// cdp-text.mjs — текст ПУБЛІЧНОЇ сторінки, яку малює браузер (задача 012).
//
// Навіщо: частина сторінок Atlassian рендериться клієнтом — `curl` віддає 30 символів
// («Learning - Atlassian Community»), і хвіст висить з приміткою «закривається лише знімком у
// браузері». Розширення Chrome для цього НЕ потрібне: власний headless Chrome з тимчасовим
// профілем (нуль доступу до живої сесії власника) + CDP через вбудований WebSocket Node 22+.
// Так 2026-09-20 знято сторінку сертифікацій для уроку 22, разом із відповіддю згорнутого FAQ.
//
//   node cdp-text.mjs <url> <out.txt>
//   node cdp-text.mjs <url> <out.txt> --click "How much does it cost to earn a credential?"
//        (--click можна повторювати: клік по найближчому справжньому перемикачу над елементом
//         з таким текстом — button / [role=button] / [aria-expanded] / summary)
//   TMPBASE=/шлях/до/скретчпада node cdp-text.mjs …      де створити тимчасовий профіль
//
// Три граблі, які коштували спроб:
//   1. чекати не таймаут, а СТАБІЛІЗАЦІЮ довжини innerText (4 однакові заміри по 500 мс);
//   2. акордеон розгортати ОДНИМ кліком по справжньому перемикачу — клік «по елементу й усіх
//      предках» перемикає двічі й лишає закритим; загальний `button[aria-expanded=false]`
//      влучає в меню сайту, а не у FAQ;
//   3. відповіді згорнутого акордеона немає в DOM до кліку — `--dump-dom` її не побачить.
//
// Межа методу: лише публічні сторінки. Входити кудись, вводити паролі, відправляти форми — ні.
// Sandbox Jira і все за входом лишається за власником (агенти паролів не вводять).

import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const clicks = [];
const rest = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--click') clicks.push(argv[++i]);
  else rest.push(argv[i]);
}
const [url, out] = rest;
if (!url || !out) {
  console.error('usage: node cdp-text.mjs <url> <out.txt> [--click "текст питання"]…');
  process.exit(2);
}

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9400 + Math.floor(Math.random() * 300);
const prof = mkdtempSync(join(process.env.TMPBASE || '/tmp', 'cdp-prof-'));
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--window-size=1400,2000', 'about:blank',
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function pageSocketUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find(t => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* Chrome ще стартує */ }
    await sleep(250);
  }
  throw new Error('Chrome не відкрив порт налагодження');
}

let seq = 0;
const pending = new Map();
function send(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

try {
  const ws = new WebSocket(await pageSocketUrl());
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', e => {
    const msg = JSON.parse(e.data);
    if (!msg.id || !pending.has(msg.id)) return;
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
  });
  const evaluate = async expression =>
    (await send(ws, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;

  await send(ws, 'Page.enable');
  await send(ws, 'Runtime.enable');
  await send(ws, 'Page.navigate', { url });

  // граблі 1: умова, а не таймаут
  let prev = -1, stable = 0;
  for (let i = 0; i < 80 && stable < 4; i++) {
    await sleep(500);
    const n = await evaluate('document.body ? document.body.innerText.length : 0');
    stable = (n === prev && n > 200) ? stable + 1 : 0;
    prev = n;
  }

  // граблі 2: один клік по справжньому перемикачу
  const clicked = [];
  for (const text of clicks) {
    const res = await evaluate(`(async () => {
      const want = ${JSON.stringify(text)};
      const leaf = [...document.querySelectorAll('*')]
        .find(e => e.children.length === 0 && (e.textContent || '').trim() === want);
      if (!leaf) return 'не знайдено';
      let t = leaf;
      for (let k = 0; k < 6 && t; k++) {
        if (t.tagName === 'BUTTON' || t.tagName === 'SUMMARY' ||
            t.getAttribute('role') === 'button' || t.hasAttribute('aria-expanded')) {
          t.click();
          await new Promise(r => setTimeout(r, 800));
          return 'клік: <' + t.tagName.toLowerCase() + '> на рівні ' + k;
        }
        t = t.parentElement;
      }
      leaf.click();
      await new Promise(r => setTimeout(r, 800));
      return 'клік по самому тексту (перемикача не знайдено)';
    })()`);
    clicked.push(`${text} → ${res}`);
  }
  await sleep(1200);

  const text = await evaluate('document.body.innerText');
  const finalUrl = await evaluate('location.href');
  writeFileSync(out, [
    `URL: ${finalUrl}`,
    `Знято: ${new Date().toISOString()}`,
    ...clicked.map(c => `Розгорнуто: ${c}`),
    '', text, '',
  ].join('\n'));
  console.log(`ok · ${finalUrl} · ${text.length} знаків · кліків ${clicked.length}`);
  ws.close();
} catch (e) {
  console.error('ERR', e.message);
  process.exitCode = 1;
} finally {
  chrome.kill('SIGKILL');
  try { rmSync(prof, { recursive: true, force: true }); } catch { /* профіль тимчасовий */ }
}
