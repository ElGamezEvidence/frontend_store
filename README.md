# frontend_store

Storefront + Admin UI pour Ghazala Store (COD Maroc / Tajir manuel).

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn-style UI
- next-intl (fr / ar RTL / en)
- Zustand cart
- Consomme `backend_store` via REST API

## Setup

```bash
cp .env.example .env
# NEXT_PUBLIC_API_URL / API_URL = URL du backend déployé
# NEXT_PUBLIC_APP_URL = URL publique de ce frontend
npm install
npm run dev
```

- Store: http://localhost:3000/fr
- Admin: http://localhost:3000/admin/login

## Environment (déploiement séparé)

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL publique du backend (browser) |
| `API_URL` | URL backend côté serveur Next (souvent la même) |
| `NEXT_PUBLIC_APP_URL` | URL de ce frontend |

Exemple prod:

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
API_URL=https://your-backend.up.railway.app
NEXT_PUBLIC_APP_URL=https://your-frontend.netlify.app
```

Le backend doit autoriser ce frontend via `CORS_ORIGIN`.

## Déploiement (recommandé : Vercel)

Next.js est mieux supporté sur Vercel. Si Netlify renvoie des HTTP 500 au deploy (`___netlify-server-handler`), utilise Vercel :

1. Importer le repo `frontend_store` sur [vercel.com](https://vercel.com).
2. Framework preset : **Next.js**.
3. Variables d’environnement :
   ```env
   NEXT_PUBLIC_API_URL=https://TON-BACKEND.railway.app
   API_URL=https://TON-BACKEND.railway.app
   NEXT_PUBLIC_APP_URL=https://TON-PROJET.vercel.app
   ```
4. Deploy.

N’oublie pas d’ajouter l’URL Vercel dans `CORS_ORIGIN` du backend Railway.

## Déploiement Netlify (alternatif)

1. Connecter le repo `frontend_store`.
2. **Ne pas** mettre Publish directory = `.next` dans l’UI (laisser vide / géré par le plugin).
3. Build command : `npm run build` (déjà dans `netlify.toml`).
4. Ajouter les 3 variables d’environnement ci-dessus.
5. Si HTTP 500 sur upload de functions : **Clear cache and deploy site**, puis réessayer.
   Ce type d’erreur vient de Netlify (infra), pas du code.

## Export Excel commandes

Dans Admin → Commandes / File Tajir : bouton **Exporter Excel**  
Format aligné sur `orders_template.xlsx` (full_name, phone, address, note, delivery_note, price, sku, qte, date_order).
