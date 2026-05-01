#!/usr/bin/env node
// Pulls images from the ReadyMag CDN at the highest practical quality and saves
// them under site/public/images/{slug}/ with sequential, LLM-friendly filenames.
//
// Reads source/parse-1/content/{slug}.json (already produced by build-parse-1.mjs).
// Writes site/public/images/{slug}/01.jpg ... NN.jpg + manifest.json.
//
// Usage:
//   node source/scripts/download-images.mjs              # all known slugs
//   node source/scripts/download-images.mjs index retro  # subset

import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const SOURCE_ROOT = path.resolve(HERE, "..");
const REPO_ROOT = path.resolve(SOURCE_ROOT, "..");
const PARSE_CONTENT = path.join(SOURCE_ROOT, "parse-1", "content");
const PUBLIC_IMAGES = path.join(REPO_ROOT, "site", "public", "images");

// Width param hints how big a JPEG ReadyMag CDN should return. 4096 is close
// to original for most images we tested without exploding the repo size.
const TARGET_WIDTH = 4096;

const requested = process.argv.slice(2);

function listAvailableSlugs() {
  return fs
    .readdirSync(PARSE_CONTENT)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

const slugs = requested.length ? requested : listAvailableSlugs();

function pad(n, width = 2) {
  return String(n).padStart(width, "0");
}

function extFromUrl(url) {
  const clean = url.split("?")[0];
  const ext = path.extname(clean).toLowerCase() || ".jpg";
  return ext;
}

async function downloadOne(srcUrl, destPath) {
  const url = new URL(srcUrl);
  url.searchParams.set("w", String(TARGET_WIDTH));
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  await pipeline(res.body, fs.createWriteStream(destPath));
  return Number(res.headers.get("content-length") || 0);
}

async function processSlug(slug) {
  const jsonPath = path.join(PARSE_CONTENT, `${slug}.json`);
  if (!fs.existsSync(jsonPath)) {
    console.log(`skip ${slug}: no ${jsonPath}`);
    return;
  }
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  if (!Array.isArray(data.images) || data.images.length === 0) {
    console.log(`skip ${slug}: no images in JSON`);
    return;
  }

  const outDir = path.join(PUBLIC_IMAGES, slug);
  fs.mkdirSync(outDir, { recursive: true });

  const manifest = [];
  let i = 0;
  for (const img of data.images) {
    i += 1;
    const ext = extFromUrl(img.url);
    const filename = `${pad(i)}${ext}`;
    const destPath = path.join(outDir, filename);
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      console.log(`= ${slug}/${filename} (cached)`);
    } else {
      process.stdout.write(`+ ${slug}/${filename} ... `);
      try {
        const bytes = await downloadOne(img.url, destPath);
        console.log(`${(bytes / 1024).toFixed(0)} KB`);
      } catch (err) {
        console.log(`FAIL ${err.message}`);
        continue;
      }
    }
    manifest.push({
      index: i,
      filename,
      readymagUrl: img.url,
      readymagFilename: img.filename,
    });
  }

  fs.writeFileSync(path.join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`-> ${slug}: ${manifest.length} files in ${path.relative(REPO_ROOT, outDir)}`);
}

for (const slug of slugs) {
  await processSlug(slug);
}
