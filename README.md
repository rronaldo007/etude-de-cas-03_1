# API des articles — Étude de cas Bloc 3 (Bachelor CDA)

API REST Node.js/Express complétant une application existante de gestion d'utilisateurs par une
**API des articles** postés par les utilisateurs, avec authentification JWT, autorisation par rôle
et temps réel via socket.io.

> Dépôt public : https://github.com/rronaldo007/etude-de-cas-03_1

## Stack

- **Node.js** / **Express 4**
- **MongoDB** / **Mongoose 6**
- **socket.io** (temps réel)
- **jsonwebtoken** (authentification) + **bcrypt** (hash des mots de passe)
- **Jest** + **supertest** + **mockingoose** (tests)
- **PM2** (déploiement)

## Installation

```bash
npm install

# MongoDB doit tourner sur localhost:27017. Le plus simple, via Docker :
docker run -d --name mongo-edc01 -p 27017:27017 mongo:8

# Démarrer l'application (port 3000)
npm run serve      # ⚠️ le script s'appelle "serve" (nodemon), pas "dev"
```

L'application écoute sur http://localhost:3000.

## Fonctionnalités

| # | Fonctionnalité | Emplacement |
|---|---|---|
| 1 | Diagramme UML de la base | [`docs/DATABASE_UML.md`](docs/DATABASE_UML.md) |
| 2 | Statut d'article `draft` / `published` (enum Mongoose) | `api/articles/articles.schema.js` |
| 3 | Endpoints création / MAJ / suppression + temps réel | `api/articles/*`, `server.js`, `middlewares/auth.js` |
| 4 | Endpoint public des articles d'un utilisateur | `server.js`, `api/users/users.controller.js` |
| 5 | Tests unitaires des endpoints d'articles | `tests/articles.spec.js` |
| 6 | Configuration de déploiement PM2 | `ecosystem.config.js` |

### Endpoints

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/login` | — | Connexion, renvoie un token JWT |
| `POST` | `/api/articles` | connecté | Créer un article (rattaché à l'utilisateur connecté) |
| `PUT` | `/api/articles/:id` | **admin** | Modifier n'importe quel article |
| `DELETE` | `/api/articles/:id` | **admin** | Supprimer n'importe quel article |
| `GET` | `/api/users/:userId/articles` | **public** | Articles d'un utilisateur (auteur peuplé, sans mot de passe) |

Le token se transmet dans l'en-tête `x-access-token`. La création, la mise à jour et la suppression
émettent respectivement les événements socket.io `article:create`, `article:update`,
`article:delete`.

## Tests

```bash
npm test     # Jest — tests mockés (mockingoose), aucune base réelle requise
```

## Déploiement (PM2)

La configuration (`ecosystem.config.js`) déclare **3 instances en mode cluster**, une limite mémoire
de **200 Mo** et un log d'erreur. Lancement :

```bash
pm2 start ecosystem.config.js --env production
```

> Remarque : les instances sont déclarées dans le fichier (`instances: 3`, `exec_mode: "cluster"`).
> Le drapeau `-i 3` en ligne de commande est ignoré lorsqu'on démarre depuis un fichier de config.

## Structure

```
api/
  articles/   articles.schema.js · articles.service.js · articles.controller.js · articles.router.js
  users/      users.model.js · users.service.js · users.controller.js · users.router.js
middlewares/  auth.js          (charge l'utilisateur complet en base, rôle inclus)
errors/       not-found.js · unauthorized.js
tests/        users.spec.js · articles.spec.js
docs/         DATABASE_UML.md
server.js · www/app.js · config/index.js · ecosystem.config.js
```
