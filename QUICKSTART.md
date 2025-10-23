# Quick Start Guide

## 🚀 Démarrage Rapide (5 minutes)

### 1. Installation

```bash
# Clone le projet
git clone <repo-url> epitrello
cd epitrello

# Installer pnpm si nécessaire
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.config/fish/config.fish  # ou ~/.bashrc pour bash

# Installer les dépendances
pnpm install
```

### 2. Base de données

```bash
# Démarrer PostgreSQL avec Docker
docker compose up -d

# Créer les tables
cd packages/db
DATABASE_URL="postgresql://epitrello:epitrello@localhost:5434/epitrello" npx prisma migrate dev --name init

# Peupler avec des données de test
DATABASE_URL="postgresql://epitrello:epitrello@localhost:5434/epitrello" pnpm seed
cd ../..
```

### 3. Lancer l'application

**Terminal 1 - API:**
```bash
./scripts/dev-api.fish
```

**Terminal 2 - Web:**
```bash
cd apps/web && pnpm dev
```

### 4. Accéder à l'application

- 🌐 **Frontend**: http://localhost:5173
- 🔌 **API**: http://localhost:3001
- 🗄️ **Prisma Studio**: `pnpm db:studio`

### 5. Se connecter

Utilisez l'un des comptes de test :

```
Email: alice@epitrello.com
Password: password123
```

Ou créez un nouveau compte via la page d'inscription !

---

## ✅ Vérification

Si tout fonctionne, vous devriez voir :
- ✓ API démarrée avec message "🚀 Server listening on http://localhost:3001"
- ✓ Web démarré avec "VITE ready"
- ✓ Possibilité de se connecter et voir les boards de test

## 🐛 Troubleshooting

### Port 5432 déjà utilisé
Le docker-compose.yml utilise le port 5434. Si vous avez déjà PostgreSQL sur 5432, c'est normal.

### Erreurs de dépendances
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erreurs TypeScript
Les erreurs dans l'éditeur sont normales avant l'installation des dépendances.

### Problème de connexion DB
Vérifiez que PostgreSQL est bien démarré :
```bash
docker ps | grep postgres
```

---

**Bon développement ! 🎉**
