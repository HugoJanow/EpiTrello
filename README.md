# EpiTrello

**EpiTrello** est une alternative légère à Trello, construite avec une stack moderne et performante. Application full-stack TypeScript avec drag-and-drop, authentification JWT, et architecture monorepo.

## 🎯 Fonctionnalités

✅ **Boards, Lists & Cards** - Organisation hiérarchique complète  
✅ **Drag & Drop** - Réorganisation intuitive avec @dnd-kit (souris + clavier)  
✅ **Authentification JWT** - Inscription/connexion sécurisée avec refresh tokens  
✅ **Attribution de membres** - Gestion collaborative avec avatars  
✅ **Priorités & Labels** - Organisation visuelle des cartes  
✅ **Due Dates** - Suivi des échéances  
✅ **Activity Logs** - Historique des actions  
✅ **Optimistic Updates** - UI réactive avec TanStack Query  
✅ **Accessibilité** - ARIA, navigation clavier, focus management

## 🏗️ Architecture

### Monorepo PNPM

```
├── apps/
│   ├── api/          # Backend Fastify + TypeScript
│   └── web/          # Frontend React + Vite + Tailwind
├── packages/
│   └── db/           # Prisma (PostgreSQL) + seeds
└── configs/          # Configs partagées (ESLint, TypeScript)
```

### Stack Technique

#### Backend (`apps/api`)

- **Fastify** - Serveur HTTP performant
- **TypeScript** strict mode
- **Prisma** - ORM type-safe
- **Zod** - Validation des schémas
- **argon2** - Hashing sécurisé des mots de passe
- **@fastify/jwt** - Authentification JWT
- **Pino** - Logger structuré
- **Vitest** - Tests unitaires & E2E

#### Frontend (`apps/web`)

- **React 18** + **TypeScript**
- **Vite** - Build ultra-rapide
- **Tailwind CSS** - Styling utility-first
- **TanStack Query** - State serveur & cache
- **Zustand** - State local (auth)
- **@dnd-kit** - Drag & drop accessible
- **react-hook-form** + **Zod** - Formulaires validés
- **React Router** - Navigation
- **Playwright** - Tests E2E

#### Database (`packages/db`)

- **PostgreSQL 16**
- **Prisma** - Migrations + client typé
- Modèle complet avec relations :
  - `User` ← `Board` ← `List` ← `Card`
  - `CardMember`, `CardLabel`, `ActivityLog`
  - Champs `order` (float) pour le réordonnancement

## 🚀 Installation & Setup

### Prérequis

- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 9.0.0
- **Docker** (pour PostgreSQL)

### 1. Clone & Install

```bash
git clone <repo-url> epitrello
cd epitrello
pnpm install
```

### 2. Démarrer la base de données

```bash
docker-compose up -d
```

Cela démarre PostgreSQL sur `localhost:5434` (le port 5432 par défaut peut être déjà utilisé).

### 3. Configuration environnement

Le fichier `.env` est déjà créé avec des valeurs de développement. Pour la production, **changez impérativement** :

```bash
# Générer des secrets sécurisés
openssl rand -base64 32  # Pour JWT_SECRET
openssl rand -base64 32  # Pour JWT_REFRESH_SECRET
```

### 4. Migrations & Seed

```bash
# Générer le client Prisma
pnpm db:generate

# Exécuter les migrations
pnpm db:migrate:dev

# Peupler la base de données avec des données de test
pnpm db:seed
```

### 5. Lancer l'application

```bash
# Démarrer API + Web en parallèle
pnpm dev
```

- **API** : http://localhost:8001
- **Web** : http://localhost:8000

## 👤 Comptes de test

Après le seed, vous pouvez vous connecter avec :

```
alice@epitrello.com / password123
bob@epitrello.com / password123
charlie@epitrello.com / password123
```

## 📜 Scripts disponibles

### Racine

```bash
pnpm dev              # Démarre API + Web en parallèle
pnpm build            # Build tous les packages
pnpm test             # Exécute tous les tests
pnpm lint             # Lint tous les packages
pnpm format           # Formatte le code avec Prettier
pnpm typecheck        # Vérifie les types TypeScript

pnpm db:generate      # Génère le client Prisma
pnpm db:migrate:dev   # Exécute les migrations (dev)
pnpm db:migrate       # Exécute les migrations (prod)
pnpm db:seed          # Peuple la base de données
pnpm db:studio        # Ouvre Prisma Studio
```

### API uniquement

```bash
pnpm dev:api          # Démarre le serveur API
pnpm test:api         # Tests API
```

### Web uniquement

```bash
pnpm dev:web          # Démarre le dev server Vite
pnpm test:web         # Tests web
```

## 📡 API REST

### Authentication

| Méthode | Endpoint         | Description          |
| ------- | ---------------- | -------------------- |
| POST    | `/auth/register` | Inscription          |
| POST    | `/auth/login`    | Connexion            |
| POST    | `/auth/refresh`  | Refresh access token |
| GET     | `/auth/me`       | User actuel          |

### Boards

| Méthode | Endpoint      | Description        |
| ------- | ------------- | ------------------ |
| GET     | `/boards`     | Liste des boards   |
| GET     | `/boards/:id` | Détails d'un board |
| POST    | `/boards`     | Créer un board     |
| PATCH   | `/boards/:id` | Modifier un board  |
| DELETE  | `/boards/:id` | Supprimer un board |

### Lists

| Méthode | Endpoint             | Description          |
| ------- | -------------------- | -------------------- |
| GET     | `/lists?boardId=xxx` | Listes d'un board    |
| GET     | `/lists/:id`         | Détails d'une liste  |
| POST    | `/lists`             | Créer une liste      |
| PATCH   | `/lists/:id`         | Modifier une liste   |
| DELETE  | `/lists/:id`         | Supprimer une liste  |
| POST    | `/lists/reorder`     | Réordonner une liste |

### Cards

| Méthode | Endpoint                     | Description               |
| ------- | ---------------------------- | ------------------------- |
| GET     | `/cards?listId=xxx`          | Cartes d'une liste        |
| GET     | `/cards/:id`                 | Détails d'une carte       |
| POST    | `/cards`                     | Créer une carte           |
| PATCH   | `/cards/:id`                 | Modifier une carte        |
| DELETE  | `/cards/:id`                 | Supprimer une carte       |
| POST    | `/cards/reorder`             | Réordonner/déplacer carte |
| POST    | `/cards/:id/members`         | Ajouter un membre         |
| DELETE  | `/cards/:id/members/:userId` | Retirer un membre         |
| POST    | `/cards/:id/labels`          | Ajouter un label          |
| DELETE  | `/cards/:id/labels/:labelId` | Retirer un label          |

Toutes les routes (sauf `/auth/*`) nécessitent un header :

```
Authorization: Bearer <accessToken>
```

## 🗄️ Modèle de données

```
User
├── id, email, passwordHash, displayName, avatarUrl
├── boards[]
├── cardMembers[]
└── activityLogs[]

Board
├── id, title, description, ownerId
├── owner (User)
├── lists[]
└── activityLogs[]

List
├── id, title, boardId, order
├── board (Board)
└── cards[]

Card
├── id, title, description, listId, order
├── priority (LOW | MEDIUM | HIGH)
├── dueDate
├── list (List)
├── members[] (CardMember)
├── labels[] (CardLabel)
└── activityLogs[]

CardMember (many-to-many)
├── id, cardId, userId
├── card (Card)
└── user (User)

CardLabel
├── id, cardId, name, color
└── card (Card)

ActivityLog
├── id, boardId?, cardId?, userId, action, metadata
├── action: BOARD_CREATED | CARD_MOVED | MEMBER_ADDED | ...
├── board (Board?)
├── card (Card?)
└── user (User)
```

## 🎨 Stratégie d'ordre (Order Strategy)

Les `List` et `Card` utilisent un champ `order: Float` pour le réordonnancement :

- **Insertion** : `order = max(order) + 1000`
- **Déplacement entre A (order=1.0) et B (order=2.0)** : `order = 1.5`
- **Compaction** (si saturation) : réinitialiser avec des gaps de 1000

Avantages :

- Pas de renumérotation en cascade
- Performances optimales
- Simple à implémenter

## 🧪 Tests

```bash
# Tous les tests
pnpm test

# Tests API E2E uniquement
pnpm test:api

# Tests web E2E (Playwright)
pnpm test:e2e
```

### Couverture

Objectif : **80%+** sur modules critiques (auth, reorder).

## ♿ Accessibilité

- ✅ Navigation clavier complète (Tab, Enter, Escape, Arrow keys)
- ✅ Drag & drop accessible (@dnd-kit supporte les annonces screen reader)
- ✅ Roles ARIA (`role="img"`, `aria-label`)
- ✅ Focus visible sur tous les éléments interactifs
- ✅ Contraste de couleurs WCAG AA

## 🔒 Sécurité

- ✅ Mots de passe hashés avec **argon2**
- ✅ JWT avec expiration (15min access, 7j refresh)
- ✅ Refresh tokens stockés en base (révocables)
- ✅ Validation stricte des entrées (Zod)
- ✅ CORS configuré
- ✅ SQL injection impossible (Prisma)
- ✅ httpOnly cookies (recommandé en production)

## 📦 Build Production

```bash
# Build
pnpm build

# API
cd apps/api
pnpm start

# Web (servir via Nginx/CDN)
cd apps/web
# Servir le dossier dist/
```

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing`)
3. Commit (`git commit -m 'feat(web): add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Ouvrir une Pull Request

### Convention de commits

```
feat(api|web|db): nouvelle fonctionnalité
fix(api|web): correction de bug
refactor(api|web): refactoring
test(api|web): ajout de tests
chore: maintenance, config
docs: documentation
```

## 📄 License

MIT - voir [LICENSE](LICENSE)

## 🙏 Crédits

Construit avec ❤️ en utilisant :

- [Fastify](https://fastify.dev)
- [React](https://react.dev)
- [Prisma](https://prisma.io)
- [dnd-kit](https://dndkit.com)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com)

---

**EpiTrello** - Alternative légère à Trello pour une productivité maximale 🚀
