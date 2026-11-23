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
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
```

Le backend doit autoriser ce frontend via `CORS_ORIGIN`.

## Export Excel commandes

Dans Admin → Commandes / File Tajir : bouton **Exporter Excel**  
Format aligné sur `orders_template.xlsx` (full_name, phone, address, note, delivery_note, price, sku, qte, date_order).
