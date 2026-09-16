/**
 * Renders assets/og-image.html -> public/og-image.png at exactly 1200x630.
 *
 * Uses the local Chrome in headless mode. Chrome on macOS often refuses to
 * exit after --screenshot (it loops on CVDisplayLink errors), so the child is
 * killed once the file appears rather than waited on.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

const chrome = CANDIDATES.find((p) => existsSync(p));
if (!chrome) {
  console.error("No Chrome/Chromium found. Set one of:\n  " + CANDIDATES.join("\n  "));
  process.exit(1);
}

const out = resolve("public/og-image.png");
const src = resolve("assets/og-image.html");
const profile = mkdtempSync(join(tmpdir(), "og-"));

// Remove any previous render first: the poll below waits for the file to
// appear, so a stale one would satisfy it immediately and kill Chrome
// before it had drawn anything.
rmSync(out, { force: true });

const child = spawn(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--user-data-dir=${profile}`,
  "--force-device-scale-factor=1",
  "--window-size=1200,630",
  "--default-background-color=FFFFFFFF",
  "--virtual-time-budget=4000",
  `--screenshot=${out}`,
  `file://${src}`,
], { stdio: "ignore" });

const started = Date.now();
const poll = setInterval(() => {
  const done = existsSync(out) && statSync(out).size > 4096;
  const timedOut = Date.now() - started > 30_000;

  if (done || timedOut) {
    clearInterval(poll);
    child.kill("SIGKILL");

    // Chrome may still be flushing its profile as we kill it, which makes a
    // plain rmSync throw ENOTEMPTY. The screenshot is already written by this
    // point, so a failed temp-dir cleanup must not fail the command.
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 120 });
    } catch {
      /* leave it to the OS temp sweeper */
    }

    if (!done) {
      console.error("Timed out before og-image.png was written.");
      process.exit(1);
    }
    console.log(`Wrote ${out} (${Math.round(statSync(out).size / 1024)} KB)`);
    process.exit(0);
  }
}, 400);
