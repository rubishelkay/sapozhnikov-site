import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(root, 'dist');
const base = new URL(process.argv[2] ?? 'http://127.0.0.1:4193');
const seo = JSON.parse(readFileSync(resolve(root, 'src/data/seo.json'), 'utf8'));
const aliases = {
  '/a-wonderful-day/': '/a_wonderful_day/',
  '/senza-titolo/': '/senza_titolo/',
  '/the-city/': '/the_city/',
  '/the-drama-machine/': '/the_drama_machine/',
  '/total-picture/': '/total_picture/',
  '/photos-2010/': '/2010_photos/',
  '/photos-2003-2011/': '/2003-2011/',
  '/index/': '/',
};
const production = 'https://sergeysapozhnikov.ru';
const walk = (node) => [node, ...(node.childNodes ?? []).flatMap(walk)];
const attr = (node, key) => node?.attrs?.find((a) => a.name === key)?.value;
const text = (node) => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
const meta = (nodes, name) => nodes.filter((n) => n.tagName === 'meta' && (attr(n, 'name') === name || attr(n, 'property') === name));

function request(path, host) {
  const url = new URL(path, base);
  const client = url.protocol === 'https:' ? https : http;
  return new Promise((resolveResponse, reject) => {
    const req = client.get(url, { headers: host ? { Host: host } : {} }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('error', reject);
      res.on('end', () => resolveResponse({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.setTimeout(15000, () => req.destroy(new Error(`Timeout: ${url}`)));
    req.on('error', reject);
  });
}

const images = new Set();
for (const [path, expected] of Object.entries(seo)) {
  const response = await request(path);
  assert.equal(response.status, 200, path);
  const nodes = walk(parse(response.body.toString()));
  assert.equal(text(nodes.find((n) => n.tagName === 'title')), expected.title, path);
  for (const name of ['description', 'og:description']) {
    assert.equal(meta(nodes, name).length, 1, `${path}: one ${name}`);
    assert.equal(attr(meta(nodes, name)[0], 'content'), expected.description, path);
  }
  const canonical = nodes.filter((n) => n.tagName === 'link' && attr(n, 'rel') === 'canonical');
  assert.equal(canonical.length, 1, `${path}: one canonical`);
  assert.equal(attr(canonical[0], 'href'), production + path, path);
  assert.equal(attr(meta(nodes, 'og:url')[0], 'content'), production + path, path);
  assert(!meta(nodes, 'robots').some((n) => /noindex/i.test(attr(n, 'content'))), path);
  assert(nodes.some((n) => n.tagName === 'h1' && text(n).trim()), `${path}: heading in initial HTML`);
  for (const node of nodes) {
    const href = attr(node, 'href');
    // Cloudflare injects its email-protection link and decoder in live responses.
    const protectedEmail = href?.startsWith('/cdn-cgi/l/email-protection#');
    if (node.tagName === 'a' && href?.startsWith('/') && !protectedEmail) {
      assert(Object.hasOwn(seo, new URL(href, production).pathname), `${path}: invalid internal link ${href}`);
    }
    const src = attr(node, 'src');
    const emailDecoder = /^\/cdn-cgi\/scripts\/[a-z0-9]+\/cloudflare-static\/email-decode\.min\.js$/.test(src ?? '');
    if (src?.startsWith('/') && !emailDecoder) {
      const file = resolve(dist, '.' + new URL(src, production).pathname);
      assert(existsSync(file), `${path}: missing asset ${src}`);
      if (node.tagName === 'img') {
        images.add(src);
        assert(statSync(file).size < 2 * 1024 * 1024, `${src}: image exceeds 2 MiB`);
      }
    }
  }
  if (path === '/about/') {
    const body = text(nodes.find((n) => n.tagName === 'body'));
    assert(body.includes('Сергей Сапожников') && body.includes('Born 1984'), 'Both biographies in initial HTML');
  }
}
assert.equal(new Set(Object.values(seo).map((m) => m.description)).size, Object.keys(seo).length);
console.log(`PASS: ${Object.keys(seo).length} pages, metadata, canonical URLs, internal links; ${images.size} local images.`);

const query = '?utm_source=seo-check&item=a%2Fb';
for (const [alias, target] of Object.entries(aliases)) {
  for (const source of [alias, alias.slice(0, -1)]) {
    const response = await request(source + query);
    assert.equal(response.status, 301, source);
    const destination = new URL(response.headers.location, base);
    assert.equal(destination.origin, base.origin, `${source}: stay on the current host`);
    assert.equal(destination.pathname, target, source);
    assert.equal(destination.search, query, `${source}: preserve query`);
    assert.equal((await request(destination.pathname + destination.search)).status, 200, `${source}: one hop`);
  }
}
console.log('PASS: 7 aliases and /index/, with and without slash; one 301, query strings preserved.');

const robots = await request('/robots.txt');
assert.equal(robots.status, 200);
assert.match(robots.headers['content-type'], /text\/plain/);
assert.match(robots.body.toString(), /Sitemap: https:\/\/sergeysapozhnikov\.ru\/sitemap\.xml/);
assert(!robots.body.toString().includes('<html'), 'robots must not contain HTML');
for (const path of ['/sitemap.xml', '/sitemap-0.xml', '/sitemap-index.xml']) {
  const response = await request(path);
  assert.equal(response.status, 200, path);
  assert.match(response.headers['content-type'], /xml/, path);
  assert(response.body.toString().startsWith('<?xml'), path);
  const locations = walk(parse(response.body.toString())).filter((n) => n.tagName === 'loc').map(text).sort();
  assert.deepEqual(locations, path === '/sitemap-index.xml'
    ? [production + '/sitemap-0.xml']
    : Object.keys(seo).map((p) => production + p).sort(), path);
}
for (const path of ['/seo-check-missing-page/', '/the_city/seo-check-missing/']) {
  const response = await request(path);
  assert.equal(response.status, 404, path);
  assert.match(response.body.toString(), /Page not found/);
  const nodes = walk(parse(response.body.toString()));
  assert.match(attr(meta(nodes, 'robots')[0], 'content'), /noindex/);
  assert(!nodes.some((n) => n.tagName === 'link' && attr(n, 'rel') === 'canonical'));
}
console.log('PASS: robots, XML sitemaps, and genuine 404 responses.');

// Host overrides exercise the same built files under preview and production names.
const hosts = base.hostname === '127.0.0.1' || base.hostname === 'localhost'
  ? ['sap.shmol.cc', 'sergeysapozhnikov.ru', 'www.sergeysapozhnikov.ru',
    ...(process.argv.includes('--apache') ? [] : ['test.pages.dev', 'branch.test.pages.dev'])]
  : [base.hostname];
for (const host of hosts) {
  const preview = host === 'sap.shmol.cc' || host.endsWith('.pages.dev');
  for (const path of ['/', '/about/', '/the_city/']) {
    const response = await request(path, host);
    assert.equal(response.status, 200, `${host}${path}`);
    assert.equal(/noindex/i.test(response.headers['x-robots-tag'] ?? ''), preview, `${host}${path}: indexing policy`);
  }
}
console.log(`PASS: indexing policy for ${hosts.join(', ')}.`);

for (const src of [...images].filter((_, i) => i % 80 === 0)) {
  const response = await request(src);
  assert.equal(response.status, 200, src);
  assert.match(response.headers['content-type'], /^image\//, src);
  assert(response.body.equals(readFileSync(resolve(dist, '.' + src))), `${src}: original image bytes`);
}
console.log('PASS: sample image HTTP responses match the local JPEG files.');
