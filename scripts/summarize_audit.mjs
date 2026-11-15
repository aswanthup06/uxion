import fs from "fs";

const data = JSON.parse(fs.readFileSync("scripts/audit_full_results.json", "utf8"));

console.log("=== 1. OVERFLOW & RESPONSIVE ISSUES ===");
for (const r of data) {
  const overVps = [];
  for (const [vp, res] of Object.entries(r.viewports)) {
    if (res.hasHorizontalScroll) {
      overVps.push({
        vp,
        scrollW: res.scrollW,
        innerW: res.innerW,
        diff: res.scrollW - res.innerW,
        top: res.topOverflowElements?.[0],
      });
    }
  }
  if (overVps.length > 0) {
    console.log(`\nRoute: ${r.path} (${r.name}) has overflow on ${overVps.length} viewports:`);
    for (const ov of overVps) {
      console.log(`  - ${ov.vp}: inner=${ov.innerW}px scroll=${ov.scrollW}px (+${ov.diff}px)`);
      if (ov.top) {
        console.log(`      Culprit: <${ov.top.tag} class="${ov.top.className}"> right=${ov.top.right}px (+${ov.top.diff}px) text="${ov.top.text}"`);
      }
    }
  }
}

console.log("\n=== 2. CONSOLE WARNINGS & ERRORS ===");
for (const r of data) {
  const allLogs = [];
  for (const [vp, res] of Object.entries(r.viewports)) {
    if (res.consoleLogs && res.consoleLogs.length > 0) {
      allLogs.push(...res.consoleLogs);
    }
  }
  const unique = [...new Set(allLogs.map((l) => `[${l.level}] ${l.text}`))];
  if (unique.length > 0) {
    console.log(`\nRoute: ${r.path} (${r.name}):`);
    unique.forEach((u) => console.log(`  ${u}`));
  }
}

console.log("\n=== 3. ACCESSIBILITY ISSUES ===");
for (const r of data) {
  const desktopVp = r.viewports["desktop-1440"] || r.viewports["mobile-375"];
  if (desktopVp && desktopVp.a11yIssues && desktopVp.a11yIssues.length > 0) {
    console.log(`\nRoute: ${r.path} (${r.name}) - ${desktopVp.a11yIssues.length} issues:`);
    desktopVp.a11yIssues.forEach((i) => {
      console.log(`  - [${i.type}] tag=<${i.tag}> text="${i.text || ""}" name="${i.name || ""}" classes="${i.classes || ""}" html="${i.html || ""}"`);
    });
  }
}

console.log("\n=== 4. HEADING HIERARCHY ISSUES (H1 COUNT != 1) ===");
for (const r of data) {
  const vp = r.viewports["desktop-1440"];
  if (vp && vp.h1Count !== 1) {
    console.log(`Route: ${r.path} (${r.name}) has ${vp.h1Count} <h1> elements (expected 1).`);
  }
}
