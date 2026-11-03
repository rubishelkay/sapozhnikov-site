import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { copyFileSync } from "node:fs";

// We deploy as plain static files to any host (shared hosting / VPS / Pages),
// so output stays static and trailing slashes match the original ReadyMag URLs.
export default defineConfig({
  site: "https://sergeysapozhnikov.ru",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  integrations: [
    mdx(),
    sitemap(),
    {
      name: "historical-sitemap",
      hooks: {
        "astro:build:done": ({ dir }) => {
          // Keep the ReadyMag sitemap URL alongside Astro's generated index.
          copyFileSync(new URL("sitemap-0.xml", dir), new URL("sitemap.xml", dir));
        },
      },
    },
  ],
});
