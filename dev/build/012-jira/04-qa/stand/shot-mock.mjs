import { browser, sleep } from "./cdp.mjs";
const MOCK = "http://127.0.0.1:8304/dev/design/012-jira/04-variants/_base/jira.html";
const b = await browser(9334);
for (const [w,h,name] of [[1280,653,"mock-hero-1280x653.png"],[390,844,"mock-hero-390.png"],[768,900,"mock-hero-768.png"]]) {
  const P = await b.page();
  await P.viewport(w,h,w<700);
  await P.goto(MOCK,0); await P.eval("document.fonts.ready"); await sleep(2000);
  await P.shot(new URL("../shots/"+name, import.meta.url).pathname, false);
  await P.close();
}
b.close(); console.log("ok");
