# Deploy

## SpaceWeb / Shared Hosting

Build locally:

```sh
cd sapozhnikov-site-2026
npm ci
npm run build
```

Upload the contents of `dist/` to the site's web root on the hosting panel, for example `public_html/` or the domain folder.

Upload the contents of `dist/`, not the `dist/` folder itself, unless the hosting panel explicitly asks for a project directory.

No Node.js process, database, PHP, or server adapter is required on the hosting. The output is plain static HTML/CSS/assets.

Include the hidden `dist/.htaccess` when uploading. It provides the historical-URL
redirects and the real 404 response. Use the domain's document root (not a
subdirectory), and check that Apache `mod_rewrite` and `.htaccess` are enabled.
`_headers` and `_redirects` are Cloudflare-only files; Apache denies public access
to them and uses `.htaccess` instead.

Enable HTTPS in the hosting panel and verify the final domain before changing DNS.
Do not overwrite another site's existing `.htaccess` in a shared document root.

## Cloudflare Pages

The existing GitHub-linked deployment publishes `sap.shmol.cc`. A push to its
production branch can publish immediately: review locally before pushing.

Recommended settings:

```txt
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Root directory: (empty, repository root)
Node.js version: 22
```

The root build runs `npm ci` and `astro build` in `sapozhnikov-site-2026`, then
copies the result to the root `dist/`. A configuration with Root directory
`sapozhnikov-site-2026` also works: build command `npm run build`, output `dist`.

`public/_headers` sets `X-Robots-Tag: noindex` only on `sap.shmol.cc` and the
`*.pages.dev` / `*.*.pages.dev` hosts. The same build remains indexable on
`sergeysapozhnikov.ru`. Do not add a global `/*` noindex rule.

`public/_redirects` defines real HTTP 301 redirects. Do not replace these with
Astro-generated HTML redirects or a catch-all rewrite to the home page.

Cloudflare may prepend its managed crawler rules to `robots.txt`. After deployment,
verify that the final response contains only robot rules and no HTML.

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
npm run preview:pages
```

From another terminal, in this directory:

```sh
npm run check:seo
```

The Pages preview is at `http://127.0.0.1:4193`. It uses a pinned Wrangler version
via `npx` (downloaded on first run); it does not publish or require a Cloudflare login.
Plain `astro preview` is useful for layout, but does not reproduce `_headers`
and `_redirects`. Use the Pages preview for routing and indexing checks.

The SEO check covers all 15 canonical pages, redirects with and without trailing
slashes and with query strings, metadata, internal links, image files, robots,
sitemaps, 404 responses, and preview versus production Host headers.
To test a local Apache serving the same build, use:

```sh
npm run check:seo -- http://127.0.0.1:4191 --apache
```

Also inspect at least:

- `/`
- `/retro/`
- `/dance/`
- `/2010_photos/`
- `/contacts/`

After the owner approves deployment, run the HTTP check against `https://sap.shmol.cc`.
After connecting the production domain, run it against `https://sergeysapozhnikov.ru`.
Verify the hosting-panel HTTPS/www rules, ownership verification files/tags, and
absence of production `noindex` before submitting `/sitemap.xml` in Search Console
and Yandex Webmaster. Keep the previous release available until the move is verified.
