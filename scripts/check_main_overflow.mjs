import fs from "fs";
import { spawn } from "child_process";

const VIEWPORTS = [
  { name: "320px", width: 320, height: 640 },
  { name: "375px", width: 375, height: 812 },
  { name: "390px", width: 390, height: 844 },
  { name: "768px", width: 768, height: 1024 },
  { name: "1440px", width: 1440, height: 900 },
];

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function startChrome() {
  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=0",
    "--no-first-run",
    "--user-data-dir=C:\\Users\\PAVLION\\AppData\\Local\\Temp\\chrome-main-overflow",
    "about:blank",
  ]);

  const port = await new Promise((resolve, reject) => {
    chrome.stderr.on("data", (data) => {
      const match = data.toString().match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//);
      if (match) resolve(match[1]);
    });
    setTimeout(() => reject(new Error("Timeout")), 7000);
  });

  const res = await fetch(`http://127.0.0.1:${port}/json/list`);
  const pages = await res.json();
  const page = pages.find((p) => p.type === "page");
  const cdp = new CDPClient(page.webSocketDebuggerUrl);
  await cdp.connect();
  return { chrome, cdp };
}

const checkInnerOverflowScript = `
(() => {
  const results = [];
  const main = document.querySelector('main');
  const mainScrollW = main ? main.scrollWidth : 0;
  const mainClientW = main ? main.clientWidth : 0;
  const mainOverflow = mainScrollW > mainClientW + 1;

  function getClippingAncestor(el) {
    let p = el.parentElement;
    while (p && p !== document.body && p !== document.documentElement) {
      const ps = window.getComputedStyle(p);
      if (ps.overflowX === 'hidden' || ps.overflowX === 'auto' || ps.overflowX === 'scroll' || ps.overflow === 'hidden') {
        return { el: p, overflowX: ps.overflowX };
      }
      if (ps.position === 'fixed' && (p.offsetWidth === 0 || p.offsetHeight === 0)) {
        return { el: p, overflowX: 'fixed-hidden' };
      }
      p = p.parentElement;
    }
    return null;
  }

  // Scan all container elements in the DOM
  const overflowingElements = [];
  const all = document.querySelectorAll('*');
  for (const el of all) {
    if (['SCRIPT', 'STYLE', 'HEAD', 'META', 'LINK', 'NOSCRIPT'].includes(el.tagName)) continue;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    
    // Check if element extends past window.innerWidth without an overflow-clipping or scrolling ancestor
    const rect = el.getBoundingClientRect();
    if (rect.right > window.innerWidth + 2) {
      const clipping = getClippingAncestor(el);
      if (!clipping) {
        overflowingElements.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || undefined,
          className: (el.className && typeof el.className === 'string') ? el.className.split(' ').slice(0, 5).join(' ') : undefined,
          rectRight: Math.round(rect.right),
          windowInnerW: window.innerWidth,
          diff: Math.round(rect.right - window.innerWidth),
          type: 'unclipped-extends-beyond-viewport',
          text: el.innerText ? el.innerText.slice(0, 30).replace(/\\n/g, ' ') : undefined
        });
      }
    }
  }

  return {
    mainScrollW,
    mainClientW,
    mainOverflow,
    overflowingElements: overflowingElements.sort((a,b) => (b.diff || 0) - (a.diff || 0)).slice(0, 8)
  };
})()
`;

async function main() {
  const { chrome, cdp } = await startChrome();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  const routes = [
    "/",
    "/jobs",
    "/jobs/JOB1076",
    "/post-job",
    "/login",
    "/admin/login",
    "/admin",
    "/admin/jobs",
    "/admin/jobs/add",
    "/profile",
    "/profile/dummy",
    "/candidate-profile",
    "/job-posters",
    "/resume-builder",
    "/about",
    "/contact",
    "/email",
    "/terms",
    "/privacy-policy",
    "/join",
  ];

  console.log("=== CHECKING MAIN & INNER OVERFLOW ACROSS ROUTES ===");

  for (const route of routes) {
    console.log(`\nRoute: ${route}`);
    for (const vp of VIEWPORTS) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768,
      });

      await cdp.send("Page.navigate", { url: `http://localhost:3000${route}` });
      await new Promise((r) => setTimeout(r, 1000));

      const evalRes = await cdp.send("Runtime.evaluate", {
        expression: checkInnerOverflowScript,
        returnByValue: true,
      });

      const res = evalRes.result?.value;
      if (res) {
        if (res.mainOverflow) {
          console.warn(`  [!] MAIN OVERFLOW at ${vp.name} (${vp.width}px): clientW=${res.mainClientW}px, scrollW=${res.mainScrollW}px (+${res.mainScrollW - res.mainClientW}px)`);
        }
        const beyond = (res.overflowingElements || []).filter((e) => e.type === "extends-beyond-viewport");
        if (beyond.length > 0) {
          console.warn(`  [!] ELEMENTS EXTENDING BEYOND VIEWPORT at ${vp.name} (${vp.width}px):`);
          for (const b of beyond.slice(0, 3)) {
            console.warn(`      <${b.tag} class="${b.className}"> right=${b.rectRight}px diff=+${b.diff}px text="${b.text}"`);
          }
        }
      }
    }
  }

  cdp.close();
  chrome.kill();
}

main().catch(console.error);
