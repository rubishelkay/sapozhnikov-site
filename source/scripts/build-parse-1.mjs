import fs from "node:fs";
import path from "node:path";

// Resolve paths relative to this script, not the cwd, so the parser keeps
// working after scripts/ and parse-1/ moved into source/.
const HERE = path.dirname(new URL(import.meta.url).pathname);
const SOURCE_ROOT = path.resolve(HERE, "..");
const OUT = path.join(SOURCE_ROOT, "parse-1");
const SOURCE = path.join(OUT, "source");
const CONTENT = path.join(OUT, "content");
const ASSETS = path.join(OUT, "assets");
const SITE = path.join(OUT, "site");

const pages = [
  {
    slug: "index",
    title: "Sergey Sapozhnikov",
    sourceUrl: "https://sergeysapozhnikov.ru/",
    file: "index.html",
    bodyClass: "page-index",
  },
  {
    slug: "retro",
    title: "Retrospective 2003-2018",
    sourceUrl: "https://sergeysapozhnikov.ru/retro/",
    file: "retro.html",
    bodyClass: "page-retro",
  },
];

for (const dir of [CONTENT, ASSETS, SITE]) {
  fs.mkdirSync(dir, { recursive: true });
}

function decodeEntities(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function stripTags(html) {
  return decodeEntities(html)
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h1|h2|h3|h4|li|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function unique(values) {
  return [...new Set(values)];
}

function getImageUrls(html) {
  const decoded = decodeEntities(html);
  const matches = [...decoded.matchAll(/https:\/\/i-p\.rmcdn\.net\/[^"'<>\s),]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"'<>\s),]+)?/gi)];
  return unique(matches.map((match) => match[0].split("?")[0]));
}

function getVideoIds(html) {
  const decoded = decodeEntities(html);
  const matches = [...decoded.matchAll(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/|i\.ytimg\.com\/vi\/)([A-Za-z0-9_-]{6,})/g)];
  return unique(matches.map((match) => match[1]));
}

function getLinks(html) {
  const decoded = decodeEntities(html);
  const matches = [...decoded.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  return matches.map((match) => ({
    href: match[1],
    label: stripTags(match[2]),
  }));
}

function fileNameForUrl(url) {
  return path.basename(new URL(url).pathname);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rewriteSnippetForLocalSite(html, page, images) {
  let rewritten = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/ target="_blank"/g, "");

  for (const imageUrl of images) {
    const localUrl = `../assets/${page.slug}/${fileNameForUrl(imageUrl)}`;
    const pattern = new RegExp(`${escapeRegExp(imageUrl)}(?:\\?[^"'<>\\s),]+)?`, "g");
    rewritten = rewritten.replace(pattern, localUrl);
  }

  const internalTargets = {
    "/1407828/retro/": "retro.html",
    "/retro/": "retro.html",
    "https://sergeysapozhnikov.ru/retro/": "retro.html",
  };

  rewritten = rewritten.replace(/href="([^"]+)"/g, (full, href) => {
    if (internalTargets[href]) return `href="${internalTargets[href]}"`;
    if (href.startsWith("/1407828/")) return `href="#" data-source-href="${href}"`;
    return full;
  });

  return rewritten;
}

function pageHtml(page, snippet, images, videos) {
  const localSnippet = rewriteSnippetForLocalSite(snippet, page, images);
  const videoLinks = videos
    .map((id) => `<a href="https://www.youtube.com/watch?v=${id}" rel="noopener">YouTube ${id}</a>`)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,300,300italic,400italic&subset=latin,cyrillic" rel="stylesheet">
  <link rel="stylesheet" href="./styles.css">
</head>
<body class="${page.bodyClass}">
  <a class="source-link" href="${page.sourceUrl}">source</a>
  ${videoLinks ? `<div class="video-links">${videoLinks}</div>` : ""}
  ${localSnippet}
  <script src="./site.js"></script>
</body>
</html>
`;
}

const manifest = {
  createdAt: new Date().toISOString(),
  pages: [],
  assets: [],
};
const curlConfig = [];

for (const page of pages) {
  const snippetPath = path.join(SOURCE, `${page.slug}.snippet.html`);
  const snippet = fs.readFileSync(snippetPath, "utf8");
  const images = getImageUrls(snippet);
  const videos = getVideoIds(snippet);
  const links = getLinks(snippet);
  const text = stripTags(snippet);
  const assetDir = path.join(ASSETS, page.slug);
  fs.mkdirSync(assetDir, { recursive: true });

  const pageAssets = images.map((url) => {
    const filename = fileNameForUrl(url);
    const localPath = path.join("source", "parse-1", "assets", page.slug, filename);
    curlConfig.push(`url = "${url}"`);
    curlConfig.push(`output = "${localPath}"`);
    return {
      url,
      filename,
      localPath: path.join("assets", page.slug, filename),
    };
  });

  fs.writeFileSync(path.join(CONTENT, `${page.slug}.txt`), `${text}\n`);
  fs.writeFileSync(
    path.join(CONTENT, `${page.slug}.json`),
    `${JSON.stringify(
      {
        slug: page.slug,
        title: page.title,
        sourceUrl: page.sourceUrl,
        images: pageAssets,
        videos: videos.map((id) => ({
          id,
          url: `https://www.youtube.com/watch?v=${id}`,
        })),
        links,
      },
      null,
      2,
    )}\n`,
  );
  fs.writeFileSync(path.join(SITE, page.file), pageHtml(page, snippet, images, videos));

  manifest.pages.push({
    slug: page.slug,
    title: page.title,
    sourceUrl: page.sourceUrl,
    textFile: `content/${page.slug}.txt`,
    jsonFile: `content/${page.slug}.json`,
    siteFile: `site/${page.file}`,
    imageCount: pageAssets.length,
    videoCount: videos.length,
    linkCount: links.length,
  });
  manifest.assets.push(...pageAssets.map((asset) => ({ ...asset, page: page.slug })));
}

fs.writeFileSync(path.join(OUT, "assets-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(OUT, "download-assets.curl"), `${curlConfig.join("\n")}\n`);

fs.writeFileSync(
  path.join(SITE, "styles.css"),
  `html,
body {
  margin: 0;
  min-height: 100%;
  background: #fff;
  color: #222;
  font-family: Roboto, Arial, sans-serif;
}

body {
  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  background: linear-gradient(to right, rgba(34, 34, 34, 1) 0%, rgba(34, 34, 34, 1) 50%, transparent 50%, transparent 100%) 0 100%/2px 1px repeat-x;
}

.text-viewer p,
.text-viewer h1,
.text-viewer h2,
.text-viewer h3,
.text-viewer h4 {
  margin: 0;
}

.source-link,
.video-links {
  position: fixed;
  right: 18px;
  z-index: 5000;
  font-size: 12px;
  line-height: 18px;
  opacity: 0.28;
}

.source-link {
  top: 14px;
}

.video-links {
  bottom: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

#mags {
  position: relative;
}

article.page {
  margin: 0;
  background: #fff;
}

.page-fixed-bg-container {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.fixed-position-container,
.fixed-position-container-top {
  position: fixed;
  top: 0;
  left: 0;
  width: 1024px;
  z-index: 3000;
  pointer-events: none;
}

.fixed-position-container a,
.fixed-position-container .rmwidget {
  pointer-events: auto;
}

.content-scroll-wrapper {
  position: relative;
  z-index: 1;
  overflow: visible !important;
}

.content-bounds,
.page-content-container {
  position: relative;
}

.rmwidget,
.animation-container {
  position: absolute;
  box-sizing: border-box;
}

.widget-picture img,
.video img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-index .animation-container.invisible {
  opacity: 1 !important;
  transition: opacity 900ms ease;
}

.page-index .fixed-position-container > .animation-container:not(.invisible) {
  opacity: 0 !important;
  transition: opacity 700ms linear 300ms;
}

.page-index.ready .animation-container.invisible {
  opacity: 0 !important;
}

.page-index.ready .fixed-position-container > .animation-container:not(.invisible) {
  opacity: 1 !important;
}

@media (max-width: 700px) {
  body {
    width: 100vw;
  }

  #mags {
    position: relative;
    width: 100vw;
    overflow: hidden;
  }

  .page-index #mags {
    min-height: 844px;
  }

  .page-retro #mags {
    height: 5208px;
  }

  #mags article.page {
    position: absolute !important;
    left: 0;
    top: 0;
    margin: 0;
    transform: scale(0.37109375);
    transform-origin: top left;
  }

  .fixed-position-container,
  .fixed-position-container-top {
    left: 0;
    transform: scale(0.37109375);
    transform-origin: top left;
  }

  .source-link,
  .video-links {
    display: none;
  }
}
`,
);

fs.writeFileSync(
  path.join(SITE, "site.js"),
  `window.addEventListener("load", () => {
  window.setTimeout(() => {
    document.body.classList.add("ready");
  }, 3200);
});
`,
);

console.log(`Built parse-1 with ${manifest.pages.length} pages and ${manifest.assets.length} image assets.`);
