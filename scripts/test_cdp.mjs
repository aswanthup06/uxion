import { spawn } from "child_process";

const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new",
  "--remote-debugging-port=0",
  "--user-data-dir=C:\\Users\\PAVLION\\AppData\\Local\\Temp\\chrome-auto-port",
  "about:blank"
]);

chrome.stderr.on("data", (data) => {
  const msg = data.toString();
  console.log("STDERR:", msg);
  const match = msg.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/[^\s]+)/);
  if (match) {
    console.log("FOUND WS URL:", match[1]);
    chrome.kill();
    process.exit(0);
  }
});

chrome.stdout.on("data", (data) => {
  console.log("STDOUT:", data.toString());
});

setTimeout(() => {
  console.log("Timeout waiting for DevTools");
  chrome.kill();
  process.exit(1);
}, 6000);
