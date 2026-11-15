import { spawn } from "child_process";

async function run() {
  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=0",
    "--user-data-dir=C:\\Users\\PAVLION\\AppData\\Local\\Temp\\chrome-audit-profile",
    "about:blank"
  ]);

  const port = await new Promise((resolve, reject) => {
    chrome.stderr.on("data", (data) => {
      const msg = data.toString();
      const match = msg.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//);
      if (match) resolve(match[1]);
    });
    setTimeout(() => reject(new Error("Timeout")), 5000);
  });

  console.log("Port:", port);
  const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
  const pages = await listRes.json();
  console.log("Pages:", pages);

  chrome.kill();
}

run().catch(console.error);
