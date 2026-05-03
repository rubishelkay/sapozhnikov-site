import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourceRoot = path.join(root, "public", "images");
const targetRoot = path.join(root, "public", "assets", "images");
const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

function isImage(filename) {
  return imageExts.has(path.extname(filename).toLowerCase());
}

function naturalSort(a, b) {
  return a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
}

function remapJson(value, fileMap) {
  if (Array.isArray(value)) {
    return value.map((item) => remapJson(item, fileMap));
  }
  if (value && typeof value === "object") {
    const output = {};
    for (const [key, inner] of Object.entries(value)) {
      if ((key === "filename" || key === "file") && typeof inner === "string" && fileMap.has(inner)) {
        output[key] = fileMap.get(inner);
      } else {
        output[key] = remapJson(inner, fileMap);
      }
    }
    return output;
  }
  return value;
}

try {
  await stat(sourceRoot);
} catch {
  console.log("public/images not found; assets may already be migrated.");
  process.exit(0);
}

await mkdir(targetRoot, { recursive: true });

const dirs = (await readdir(sourceRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort(naturalSort);

const summary = [];

for (const slug of dirs) {
  const sourceDir = path.join(sourceRoot, slug);
  const targetDir = path.join(targetRoot, slug);
  await mkdir(targetDir, { recursive: true });

  const entries = (await readdir(sourceDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort(naturalSort);

  const images = entries.filter(isImage);
  const fileMap = new Map();

  images.forEach((filename, index) => {
    const ext = path.extname(filename).toLowerCase();
    fileMap.set(filename, `${slug}-${String(index + 1).padStart(3, "0")}${ext}`);
  });

  for (const filename of images) {
    await rename(path.join(sourceDir, filename), path.join(targetDir, fileMap.get(filename)));
  }

  for (const filename of entries.filter((entry) => !isImage(entry))) {
    const sourcePath = path.join(sourceDir, filename);
    const targetPath = path.join(targetDir, filename);

    if (filename.endsWith(".json")) {
      const data = JSON.parse(await readFile(sourcePath, "utf8"));
      await writeFile(targetPath, `${JSON.stringify(remapJson(data, fileMap), null, 2)}\n`);
    } else {
      await rename(sourcePath, targetPath);
    }
  }

  await rm(sourceDir, { recursive: true, force: true });
  summary.push({ slug, images: images.length });
}

await rm(sourceRoot, { recursive: true, force: true });

console.table(summary);
