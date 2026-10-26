#!/usr/bin/env node
// Publie un article vers WordPress via l'API REST.
// Par défaut en brouillon ; --publish met en ligne directement.
// Usage : node scripts/publish.mjs articles/<fichier>.html [--publish]

import { readFile } from 'node:fs/promises';

const file = process.argv[2];
const live = process.argv.includes('--publish');

if (!file) {
  console.error('Usage : node scripts/publish.mjs articles/<fichier>.html [--publish]');
  process.exit(1);
}

const SITE = (process.env.WORDPRESS_SITE_URL || '').replace(/\/$/, '');
const USER = process.env.WORDPRESS_USERNAME || '';
const PASS = (process.env.WORDPRESS_APP_PASSWORD || '').replace(/\s/g, '');

if (!SITE || !USER || !PASS) {
  console.error('Variables manquantes : WORDPRESS_SITE_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD');
  process.exit(1);
}

function parseFrontMatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return { meta, body: m[2] };
}

const { meta, body } = parseFrontMatter(await readFile(file, 'utf8'));

if (!meta.title) {
  console.error(`Le fichier ${file} n'a pas de « title » dans son front matter.`);
  process.exit(1);
}

const payload = {
  title: meta.title,
  content: body.trim(),
  status: live ? 'publish' : 'draft',
};
if (meta.slug) payload.slug = meta.slug;
if (meta.excerpt) payload.excerpt = meta.excerpt;
if (meta.categories) payload.categories = meta.categories.split(',').map((n) => Number(n.trim()));
if (meta.tags) payload.tags = meta.tags.split(',').map((n) => Number(n.trim()));

const auth = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');

const res = await fetch(`${SITE}/wp-json/wp/v2/posts`, {
  method: 'POST',
  headers: { Authorization: auth, 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  console.error(`Échec (HTTP ${res.status}) : ${await res.text()}`);
  process.exit(1);
}

const post = await res.json();
console.log(live ? 'Publié' : 'Brouillon créé');
console.log(`Voir   : ${post.link}`);
console.log(`Éditer : ${SITE}/wp-admin/post.php?post=${post.id}&action=edit`);
