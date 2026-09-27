/**
 * Prints /resume to public/zakariya-raji-resume.pdf with headless Chrome.
 * Usage: build, start the server (`npm start`), then `npm run resume:pdf`.
 * Env: BASE_URL (default http://localhost:3000), CHROME_PATH (default: macOS Chrome).
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const chrome =
  process.env.CHROME_PATH ??
  [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].find(existsSync);

if (!chrome) {
  console.error("Chrome not found. Set CHROME_PATH.");
  process.exit(1);
}

const out = fileURLToPath(new URL("../public/zakariya-raji-resume.pdf", import.meta.url));
execFileSync(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  `--print-to-pdf=${out}`,
  `${base}/resume`,
]);
console.log(`Wrote ${out}`);
