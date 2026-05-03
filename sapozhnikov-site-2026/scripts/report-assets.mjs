import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const assetsRoot = path.join(root, "public", "assets");
const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile() && imageExts.has(path.extname(entry.name).toLowerCase())) {
      const info = await stat(fullPath);
      files.push({ path: path.relative(root, fullPath), bytes: info.size });
    }
  }

  return files;
}

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

const files = await walk(assetsRoot);
const total = files.reduce((sum, file) => sum + file.bytes, 0);
const largest = [...files].sort((a, b) => b.bytes - a.bytes).slice(0, 20);
const over2Mb = files.filter((file) => file.bytes > 2 * 1024 * 1024);

console.log(`Images: ${files.length}`);
console.log(`Total: ${formatBytes(total)}`);
console.log(`Over 2 MB: ${over2Mb.length}`);
console.log("");
console.table(largest.map((file) => ({
  size: formatBytes(file.bytes),
  path: file.path,
})));
