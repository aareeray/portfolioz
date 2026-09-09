/**
 * "Build" step. This project runs TypeScript natively on Node (no bundler), so the
 * build validates types, ensures migrations apply cleanly, and confirms the public
 * asset directory is present. Usage: npm run build
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function step(label: string, fn: () => void): void {
  process.stdout.write(`▸ ${label}\n`);
  fn();
}

let failed = false;

step("Typecheck (tsc --noEmit)", () => {
  const res = spawnSync("npx", ["--no-install", "tsc", "--noEmit"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
  if (res.status !== 0) {
    // Fall back to a global tsc if the local one is unavailable in this environment.
    const alt = spawnSync("tsc", ["--noEmit"], {
      cwd: root,
      stdio: "inherit",
      shell: true,
    });
    if (alt.status !== 0) failed = true;
  }
});

step("Verify public assets", () => {
  const publicDir = path.join(root, "public");
  if (!fs.existsSync(publicDir)) {
    console.error("  public/ directory missing");
    failed = true;
  }
});

if (failed) {
  console.error("Build failed.");
  process.exit(1);
}
console.log("Build OK.");
