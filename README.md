# frontend_store (Soukly)

Storefront + Admin UI — COD Maroc / Tajir manuel.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- next-intl (fr / ar RTL / en)
- Zustand cart
- API : `backend_store` (Railway)

## Setup local

```bash
cp .env.example .env
npm install
npm run dev
```

- Store: http://localhost:3000/fr
- Admin: http://localhost:3000/admin/login

## Variables d’environnement

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL publique du backend Railway |
| `API_URL` | URL backend côté serveur (souvent la même) |
| `NEXT_PUBLIC_APP_URL` | URL publique de ce frontend |

Exemple :

```env
NEXT_PUBLIC_API_URL=https://sunny-enchantment-production-df870c45.up.railway.app
API_URL=https://sunny-enchantment-production-df870c45.up.railway.app
NEXT_PUBLIC_APP_URL=https://soukly-frontend.pages.dev
```

## Déploiement Cloudflare (recommandé)

Le projet utilise **OpenNext** (`@opennextjs/cloudflare`) pour Next.js 15 sur **Cloudflare Workers**.

### Réglages Cloudflare (Workers / Pages + Git)

1. Connecter le repo `ElGamezEvidence/frontend_store`, branche `main`.
2. **Build command :**
   ```bash
   npx opennextjs-cloudflare build
   ```
3. **Deploy command :**
   ```bash
   npx wrangler deploy
   ```
4. Le Worker Cloudflare doit s’appeler **`yoursouk`** (déjà aligné dans `wrangler.jsonc`).
5. Variables (avec `https://`) :
   ```env
   NEXT_PUBLIC_API_URL=https://sunny-enchantment-production-df870c45.up.railway.app
   API_URL=https://sunny-enchantment-production-df870c45.up.railway.app
   NEXT_PUBLIC_APP_URL=https://yoursouk.<ton-sous-domaine>.workers.dev
   ```
4. **Root directory :** `/` (racine du repo)
5. **Node version :** `22` (fichier `.nvmrc` déjà présent — ou variable Build `NODE_VERSION=22`)
6. Variables d’environnement (Production) :
   ```env
   NEXT_PUBLIC_API_URL=https://sunny-enchantment-production-df870c45.up.railway.app
   API_URL=https://sunny-enchantment-production-df870c45.up.railway.app
   NEXT_PUBLIC_APP_URL=https://TON-WORKER.workers.dev
   ```

### Deploy CLI

```bash
npm run deploy
```

### Erreur `npm ci` / lockfile

Si Cloudflare échoue avec `package.json and package-lock.json are not in sync` :

```bash
npm install
git add package-lock.json
git commit -m "Sync package-lock for Cloudflare"
git push
```

## Export Excel commandes

Admin → Commandes / File Tajir : **Exporter Excel**  
Colonnes Tajir : full_name, phone, address, note, delivery_note, price, sku, qte, date_order.
