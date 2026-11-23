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
# NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev
```

- Store: http://localhost:3000/fr
- Admin: http://localhost:3000/admin/login

Le backend doit tourner sur le port 4000.
