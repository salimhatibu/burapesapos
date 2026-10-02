# BuraPesa — Hospital & Clinic POS 🇰🇪

A medical-grade POS for Kenyan clinics & hospitals
**Modules:** Dashboard (live queue + ECG strip) · Till/POS (walk-in + visit billing, split Cash/M-Pesa/SHA/Insurance, eTIMS receipts) · Queue & triage vitals · Patients (OP files, balances) · Pharmacy (batch + expiry **FEFO**, 60-day radar, reorder alerts) · Lab (orders + results) · Expenses · Staff · Suppliers · Reports (revenue, payment mix, debtors, stock valuation) · Settings.

## Run locally

```bash
npm install
npm run dev
```

Demo data lives in `localStorage` — sign in with any PIN.

## Deploy on Netlify

```bash
npx netlify link
npx netlify deploy --build --prod
```

### Database (Postgres + Drizzle)

```bash
netlify database init --yes
npm run db:generate
npm run db:migrate   # local only — deploys apply migrations automatically
```

Schema: `db/schema.ts` → migrations in `netlify/database/migrations/`.
Never run DDL by hand; preview branches fork production data automatically.

### Functions

- `GET /api/health` — service ping
- `GET /api/patients` — Drizzle list (503 until DB provisioned)
- `GET /api/pharmacy-alerts` — expiry radar
- `POST /api/mpesa-stk` — Daraja STK stub (demo mode until `MPESA_*` env vars set)

Set secrets in the Netlify UI, never in `netlify.toml`: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `PAYBILL`, `KRA_PIN`.

## What we learned from dPOS + Kenyan HMIS

- Pharmacy: batch-level **FEFO**, 60-day expiry quarantine, prescription-linked dispensing, reorder triggers
- Billing: consolidated invoice across consult + lab + pharmacy, split payments, till handover, audited reprints
- Compliance: **KRA eTIMS** receipts, **SHA** claims, M-Pesa STK at checkout
- Resilience: works offline-first at the till; syncs when back online
