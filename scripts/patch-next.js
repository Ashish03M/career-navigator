/**
 * Patches a known Next.js 16.1.6 bug on Windows where
 * `normalizePathOnWindows` is called on `distDirRoot` which can be undefined.
 * See: node_modules/next/dist/build/swc/index.js
 *
 * Remove this script once Next.js ships a fix.
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "node_modules", "next", "dist", "build", "swc", "index.js");

if (!fs.existsSync(file)) {
  console.log("[patch-next] next/dist/build/swc/index.js not found, skipping.");
  process.exit(0);
}

let content = fs.readFileSync(file, "utf8");

const buggy = "nextConfigSerializable.distDirRoot = normalizePathOnWindows(nextConfigSerializable.distDirRoot);";
const fixed = "if (nextConfigSerializable.distDirRoot) nextConfigSerializable.distDirRoot = normalizePathOnWindows(nextConfigSerializable.distDirRoot);";

if (content.includes(fixed)) {
  console.log("[patch-next] Already patched.");
  process.exit(0);
}

if (!content.includes(buggy)) {
  console.log("[patch-next] Target code not found — Next.js may have been updated. Skipping.");
  process.exit(0);
}

content = content.replace(buggy, fixed);
fs.writeFileSync(file, content, "utf8");
console.log("[patch-next] Successfully patched distDirRoot bug.");
