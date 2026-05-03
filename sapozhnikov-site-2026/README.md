# Sergey Sapozhnikov Site 2026

Static Astro copy of Sergey Sapozhnikov's ReadyMag portfolio.

The project is prepared for simple shared hosting first: build locally, then upload the generated `dist/` contents to the hosting document root. It can also be deployed later to Cloudflare Pages from GitHub.

## Structure

- `src/pages/` - one Astro page per site route.
- `src/components/IndexMenu.astro` - ReadyMag-style fixed menu.
- `public/assets/images/<project>/` - renamed local images, grouped by project.
- `public/data/` - extracted text/data for info pages.
- `scripts/rename-assets.mjs` - one-time image migration helper.
- `scripts/report-assets.mjs` - image size report.

## Commands

```sh
npm install
npm run build
npm run preview
npm run check
npm run assets:report
```

## Asset Rules

Images are intentionally stored in the repo as normal files, not Git LFS, while they stay small enough for GitHub and static hosting.

Current naming pattern:

```txt
public/assets/images/retro/retro-001.jpg
public/assets/images/dance/dance-001.jpg
public/assets/images/photos-2010/photos-2010-001.jpg
```

Large original images and downloaded video files should stay outside this repo until we decide on separate storage.
