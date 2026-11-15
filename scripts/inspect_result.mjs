import fs from "fs";

const data = JSON.parse(fs.readFileSync("scripts/audit_full_results.json", "utf8"));
const jd = data.find((r) => r.name === "job-detail");
console.log(JSON.stringify(jd.viewports["mobile-320"].topOverflowElements, null, 2));
