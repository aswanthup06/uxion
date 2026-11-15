import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function checkUrl(url, width = 375, height = 812) {
  // We can use chrome's --dump-dom with script injection or evaluate via node
  // But chrome --dump-dom runs JS after page load!
  // Let's create an HTML file or run a script that injects an audit script into the page.
}
