# Deploy

## SpaceWeb / Shared Hosting

Build locally:

```sh
cd sapozhnikov-site-2026
npm install
npm run build
```

Upload the contents of `dist/` to the site's web root on the hosting panel, for example `public_html/` or the domain folder.

Upload the contents of `dist/`, not the `dist/` folder itself, unless the hosting panel explicitly asks for a project directory.

No Node.js process, database, PHP, or server adapter is required on the hosting. The output is plain static HTML/CSS/assets.

## Cloudflare Pages

Use this later for a test link or production.

Recommended settings:

```txt
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Root directory: sapozhnikov-site-2026
Node.js version: 20
```

If this folder becomes the repository root later, leave Root directory empty.

## GitHub

Keep optimized site images in Git as normal files while individual files stay below 25 MB and the repo remains manageable.

Do not commit:

- `node_modules/`
- `dist/`
- `.astro/`
- large source videos
- full-quality image originals, unless we explicitly decide to use Git LFS or external storage

## Quick Pre-Deploy Check

```sh
npm run assets:report
npm run check
npm run build
```

Then open the local preview and check at least:

- `/`
- `/retro/`
- `/dance/`
- `/photos-2010/`
- `/contacts/`
