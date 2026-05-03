import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const siteDist = resolve(repoRoot, 'sapozhnikov-site-2026', 'dist');
const rootDist = resolve(repoRoot, 'dist');

if (!existsSync(siteDist)) {
  throw new Error(`Build output not found: ${siteDist}`);
}

rmSync(rootDist, { force: true, recursive: true });
cpSync(siteDist, rootDist, { recursive: true });

console.log(`Copied Cloudflare output to ${rootDist}`);
