#!/usr/bin/env node
// Vérifie que la connexion à WordPress fonctionne.
// Usage : node scripts/check.mjs

const SITE = (process.env.WORDPRESS_SITE_URL || '').replace(/\/$/, '');
const USER = process.env.WORDPRESS_USERNAME || '';
const PASS = (process.env.WORDPRESS_APP_PASSWORD || '').replace(/\s/g, '');

if (!SITE || !USER || !PASS) {
  console.error('Variables manquantes. Il faut :');
  console.error('  WORDPRESS_SITE_URL      ex. https://miamsaveurs.com');
  console.error('  WORDPRESS_USERNAME      ton identifiant WordPress');
  console.error('  WORDPRESS_APP_PASSWORD  le mot de passe d’application');
  process.exit(1);
}

const auth = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');

const res = await fetch(`${SITE}/wp-json/wp/v2/users/me`, {
  headers: { Authorization: auth },
});

if (!res.ok) {
  console.error(`Échec de connexion (HTTP ${res.status})`);
  console.error(await res.text());
  process.exit(1);
}

const me = await res.json();
console.log(`Connecté à ${SITE}`);
console.log(`Utilisateur : ${me.name} (${me.slug})`);
console.log(`Rôles : ${(me.roles || []).join(', ') || 'non exposés'}`);
