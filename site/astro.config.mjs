import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// We deploy as plain static files to any host (VPS / shared / Yandex.Disk),
// so output stays static and trailing slashes match the original ReadyMag URLs.
// Replace `site` with the production URL once we move from localhost to prod.
export default defineConfig({
  site: "http://localhost:4321",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  integrations: [mdx(), sitemap()],
});
