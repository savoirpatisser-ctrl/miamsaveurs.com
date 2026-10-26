# miamsaveurs.com — articles

Archive des articles du site et outils de publication vers WordPress.

## Fonctionnement

1. L'article est rédigé ici, dans `articles/`, au format HTML avec un en-tête.
2. Il est archivé dans Git (historique de tout ce qui a été écrit).
3. Il est envoyé sur WordPress via l'API REST.

## Configuration

Trois variables d'environnement sont nécessaires :

| Variable | Valeur |
|---|---|
| `WORDPRESS_SITE_URL` | `https://miamsaveurs.com` |
| `WORDPRESS_USERNAME` | identifiant WordPress |
| `WORDPRESS_APP_PASSWORD` | mot de passe d'application (WordPress → Outils) |

Le domaine `miamsaveurs.com` doit aussi être autorisé dans les réglages réseau de
l'environnement Claude, sinon les requêtes sont bloquées avant même d'atteindre le site.

## Commandes

```bash
# Vérifier que la connexion fonctionne
node scripts/check.mjs

# Récupérer les articles déjà en ligne (pour en copier la structure)
node scripts/fetch-existing.mjs 5

# Envoyer un article en brouillon
node scripts/publish.mjs articles/mon-article.html

# Envoyer un article directement en ligne
node scripts/publish.mjs articles/mon-article.html --publish
```

## Format d'un article

```html
---
title: Titre de l'article
slug: titre-de-l-article
excerpt: Résumé affiché dans les listes.
---

<p>Le contenu, en HTML, reprenant la structure des articles existants.</p>
```

Seul `title` est obligatoire.
