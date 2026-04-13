# Orbit Vault

Orbit Vault is a lightweight goal-based savings prototype designed for the Stellar ecosystem.

The project shows how a clean contributor-friendly app can evolve from a simple demo into a real Soroban-powered product. Today it includes a polished frontend, a minimal backend API, and a starter smart contract scaffold.

## What it includes

- `frontend/`
  Product landing page, vault dashboard, local demo interactions, and UI for future wallet and contract flows.
- `backend/`
  Minimal Express server that serves the frontend and exposes a few starter API routes.
- `contracts/goal_vault/`
  Soroban contract scaffold for vault creation, contribution tracking, and future release logic.

## Current scope

Implemented now:
- Create demo vaults
- Seed sample vault data
- Track local contributions and activity
- Serve the app through a minimal backend
- Expose starter API routes for future integration
- Show a clear Stellar and Soroban direction

Intentionally not finished yet:
- Real wallet integration
- Testnet deployment
- Onchain contribution execution
- Production-ready release logic

## Quick start

1. Start the backend:

```bash
cd backend
npm install
npm run start
```

2. Open the app:

```text
http://localhost:3000
```

## API routes

- `GET /api/status`
- `GET /api/vault-templates`
- `POST /api/intents/create-vault`

## Why this repo is open source

Orbit Vault is intentionally structured for incremental contribution. Contributors can improve the UI, integrate a real Stellar wallet flow, extend the backend, add tests, and evolve the Soroban contract without needing to rewrite the project from scratch.

## Repo links

- GitHub repo: `https://github.com/anoncon/Orbit-Vault`
- Frontend entry: `frontend/index.html`
- Backend entry: `backend/server.js`
- Contract entry: `contracts/goal_vault/src/lib.rs`
