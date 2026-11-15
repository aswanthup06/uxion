import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const VIEWPORTS = [
  { name: "mobile-320", width: 320, height: 640, isMobile: true },
  { name: "mobile-360", width: 360, height: 740, isMobile: true },
  { name: "mobile-375", width: 375, height: 812, isMobile: true },
  { name: "mobile-390", width: 390, height: 844, isMobile: true },
  { name: "mobile-430", width: 430, height: 932, isMobile: true },
  { name: "tablet-768", width: 768, height: 1024, isMobile: false },
  { name: "tablet-1024", width: 1024, height: 768, isMobile: false },
  { name: "desktop-1280", width: 1280, height: 800, isMobile: false },
  { name: "desktop-1440", width: 1440, height: 900, isMobile: false },
  { name: "desktop-1920", width: 1920, height: 1080, isMobile: false },
];

const screenshotDir = path.resolve("public/audit-screenshots");
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
    this.listeners = new Map();
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
        } else if (msg.method) {
          const handlers = this.listeners.get(msg.method) || [];
          for (const h of handlers) h(msg.params);
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

  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(handler);
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
    "--user-data-dir=C:\\Users\\PAVLION\\AppData\\Local\\Temp\\chrome-audit-profile",
    "about:blank",
  ]);

  const port = await new Promise((resolve, reject) => {
    chrome.stderr.on("data", (data) => {
      const match = data.toString().match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//);
      if (match) resolve(match[1]);
    });
    setTimeout(() => reject(new Error("Timeout waiting for Chrome port")), 7000);
  });

  const res = await fetch(`http://127.0.0.1:${port}/json/list`);
  const pages = await res.json();
  const page = pages.find((p) => p.type === "page");
  if (!page) throw new Error("No page found");

  const cdp = new CDPClient(page.webSocketDebuggerUrl);
  await cdp.connect();
  return { chrome, cdp };
}

const auditPageScript = `
(() => {
  const innerW = window.innerWidth;
  const innerH = window.innerHeight;
  const scrollW = document.documentElement.scrollWidth;
  const scrollH = document.documentElement.scrollHeight;
  const bodyScrollW = document.body ? document.body.scrollWidth : 0;
  const hasHorizontalScroll = scrollW > innerW || bodyScrollW > innerW;

  // Find all overflowing elements
  const overflowingElements = [];
  const allNodes = document.querySelectorAll('*');
  for (const el of allNodes) {
    if (['SCRIPT', 'STYLE', 'HEAD', 'META', 'LINK', 'NOSCRIPT'].includes(el.tagName)) continue;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    
    if (rect.right > innerW + 1.5) {
      overflowingElements.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || undefined,
        className: (el.className && typeof el.className === 'string') ? el.className.split(' ').slice(0, 5).join(' ') : undefined,
        text: el.innerText ? el.innerText.slice(0, 40).replace(/\\n/g, ' ') : undefined,
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        innerW: innerW,
        diff: Math.round(rect.right - innerW)
      });
    }
  }

  // Accessibility checks
  const a11yIssues = [];

  // 1. Missing button labels
  const buttons = document.querySelectorAll('button, [role="button"]');
  for (const btn of buttons) {
    const text = (btn.innerText || '').trim();
    const ariaLabel = btn.getAttribute('aria-label') || btn.getAttribute('aria-labelledby');
    const title = btn.getAttribute('title');
    if (!text && !ariaLabel && !title) {
      a11yIssues.push({
        type: 'button-no-accessible-name',
        tag: btn.tagName.toLowerCase(),
        classes: typeof btn.className === 'string' ? btn.className.split(' ').slice(0, 4).join(' ') : '',
        html: btn.outerHTML.slice(0, 100)
      });
    }
    // Touch target check
    const rect = btn.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0 && (rect.width < 32 || rect.height < 32)) {
      a11yIssues.push({
        type: 'touch-target-too-small',
        tag: btn.tagName.toLowerCase(),
        text: text.slice(0, 20),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      });
    }
  }

  // 2. Images missing alt
  const images = document.querySelectorAll('img');
  for (const img of images) {
    if (!img.hasAttribute('alt')) {
      a11yIssues.push({
        type: 'image-no-alt',
        src: img.src?.slice(0, 60),
      });
    }
  }

  // 3. Form inputs missing labels
  const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
  for (const input of inputs) {
    const id = input.id;
    const hasLabel = id && document.querySelector(\`label[for="\${id}"]\`);
    const parentLabel = input.closest('label');
    const ariaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
    const placeholder = input.getAttribute('placeholder');
    if (!hasLabel && !parentLabel && !ariaLabel) {
      a11yIssues.push({
        type: 'input-no-label',
        id: id || undefined,
        placeholder: placeholder || undefined,
        name: input.getAttribute('name') || undefined,
        tag: input.tagName.toLowerCase(),
      });
    }
  }

  // 4. Headings
  const h1Count = document.querySelectorAll('h1').length;

  return {
    innerW,
    innerH,
    scrollW,
    scrollH,
    hasHorizontalScroll,
    overflowCount: overflowingElements.length,
    topOverflowElements: overflowingElements.sort((a,b) => b.diff - a.diff).slice(0, 6),
    a11yIssues: a11yIssues.slice(0, 15),
    h1Count,
  };
})()
`;

async function main() {
  console.log("Starting Chrome audit runner...");
  const { chrome, cdp } = await startChrome();

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Console.enable");

  const consoleLogs = [];
  cdp.on("Console.messageAdded", (params) => {
    if (params.message.level === "error" || params.message.level === "warning") {
      consoleLogs.push({
        level: params.message.level,
        text: params.message.text,
        url: params.message.url,
      });
    }
  });

  // Get sample job ID
  let sampleJobId = "550e8400-e29b-41d4-a716-446655440000";
  try {
    const jobsRes = await fetch("http://localhost:3000/api/jobs");
    if (jobsRes.ok) {
      const data = await jobsRes.json();
      const list = Array.isArray(data) ? data : data.jobs;
      if (list && list.length > 0 && list[0].id) {
        sampleJobId = list[0].id;
      }
    }
  } catch (e) {
    console.warn("Could not fetch jobs API:", e.message);
  }
  console.log("Using sample job ID:", sampleJobId);

  const routes = [
    { name: "home", path: "/" },
    { name: "jobs", path: "/jobs" },
    { name: "job-detail", path: `/jobs/${sampleJobId}` },
    { name: "job-detail-invalid", path: `/jobs/invalid-job-id-9999` },
    { name: "post-job", path: "/post-job" },
    { name: "login", path: "/login" },
    { name: "admin-login", path: "/admin/login" },
    { name: "admin-dashboard", path: "/admin" },
    { name: "admin-jobs", path: "/admin/jobs" },
    { name: "admin-jobs-add", path: "/admin/jobs/add" },
    { name: "admin-submissions", path: "/admin/submissions" },
    { name: "admin-candidates", path: "/admin/candidates" },
    { name: "profile", path: "/profile" },
    { name: "profile-dummy", path: "/profile/dummy" },
    { name: "candidate-profile", path: "/candidate-profile" },
    { name: "job-posters", path: "/job-posters" },
    { name: "resume-builder", path: "/resume-builder" },
    { name: "about", path: "/about" },
    { name: "contact", path: "/contact" },
    { name: "email", path: "/email" },
    { name: "terms", path: "/terms" },
    { name: "privacy-policy", path: "/privacy-policy" },
    { name: "join", path: "/join" },
  ];

  const auditReport = [];

  for (const route of routes) {
    console.log(`\n========================================\nAuditing route: ${route.path} (${route.name})`);
    const routeResults = {
      name: route.name,
      path: route.path,
      viewports: {},
    };

    // Audit key viewports: 375px (mobile), 768px (tablet), 1440px (desktop)
    for (const vp of VIEWPORTS) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.isMobile,
      });

      consoleLogs.length = 0; // Clear console logs for this run
      await cdp.send("Page.navigate", { url: `http://localhost:3000${route.path}` });

      // Wait for page load and hydration
      await new Promise((r) => setTimeout(r, 1200));

      // Evaluate audit script
      const evalRes = await cdp.send("Runtime.evaluate", {
        expression: auditPageScript,
        returnByValue: true,
      });

      const auditData = evalRes.result?.value || {};
      auditData.consoleLogs = [...consoleLogs];

      // Save screenshot for 375 and 1440
      if (vp.width === 375 || vp.width === 1440) {
        const screenshotRes = await cdp.send("Page.captureScreenshot", {
          format: "png",
        });
        const imgBuffer = Buffer.from(screenshotRes.data, "base64");
        const filename = `${route.name}_${vp.width}.png`;
        fs.writeFileSync(path.join(screenshotDir, filename), imgBuffer);
        auditData.screenshot = filename;
      }

      routeResults.viewports[vp.name] = auditData;
      if (auditData.hasHorizontalScroll) {
        console.warn(`  [!] HORIZONTAL OVERFLOW on ${vp.name} (${vp.width}px): scrollW=${auditData.scrollW}, innerW=${auditData.innerW}`);
        if (auditData.topOverflowElements?.length) {
          for (const el of auditData.topOverflowElements) {
            console.warn(`      -> <${el.tag} class="${el.className}"> width=${el.width}px right=${el.right}px (+${el.diff}px)`);
          }
        }
      }
    }

    auditReport.push(routeResults);
  }

  fs.writeFileSync(
    "scripts/audit_full_results.json",
    JSON.stringify(auditReport, null, 2),
    "utf-8"
  );
  console.log("\nAudit finished! Results written to scripts/audit_full_results.json");

  cdp.close();
  chrome.kill();
}

main().catch((err) => {
  console.error("FATAL AUDIT ERROR:", err);
  process.exit(1);
});
