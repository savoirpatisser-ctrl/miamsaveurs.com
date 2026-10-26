#!/usr/bin/env node
// Récupère les articles déjà en ligne pour analyser leur structure HTML.
// Aucune authentification nécessaire : l'API REST expose les articles publics en lecture.
// Usage : node scripts/fetch-existing.mjs [nombre]

import { mkdir, writeFile } from 'node:fs/promises';

const SITE = (process.env.WORDPRESS_SITE_URL || 'https://miamsaveurs.com').replace(/\/$/, '');
const count = Number(process.argv[2]) || 5;
const outDir = 'existants';

const res = await fetch(`${SITE}/wp-json/wp/v2/posts?per_page=${count}&orderby=date&order=desc`);

if (!res.ok) {
  console.error(`Échec (HTTP ${res.status}) : ${await res.text()}`);
  process.exit(1);
}

const posts = await res.json();
await mkdir(outDir, { recursive: true });

for (const p of posts) {
  const name = `${p.date.slice(0, 10)}-${p.slug}.html`;
  const header = [
    '---',
    `id: ${p.id}`,
    `title: ${p.title.rendered}`,
    `slug: ${p.slug}`,
    `date: ${p.date}`,
    `link: ${p.link}`,
    '---',
    '',
  ].join('\n');
  await writeFile(`${outDir}/${name}`, header + p.content.rendered, 'utf8');
  console.log(`${outDir}/${name}`);
}

console.log(`\n${posts.length} article(s) récupéré(s) dans ${outDir}/`);
