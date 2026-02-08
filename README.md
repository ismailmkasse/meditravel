<<<<<<< HEAD
# MediTravel Platform (Full Stack)

International **Medical Tourism + Hotels + Tours** platform prototype upgraded to a **realistic, legal, production-style full-stack**:

- Frontend: React + TypeScript + Vite
- Backend: Express + Prisma
- Database: Postgres
- Auth: JWT (User / Provider / Admin) + role-based protection
- Provider onboarding + **Admin verification**
- Provider portal: procedures/listings + pricing
- Health: **Quotation flow** with attachments + chat + SLA due time + notifications
- Payments: **Legal escrow-like ledger** with two modes:
  - `MOCK` (default)
  - `STRIPE` PaymentIntents + webhooks + manual capture + payout scheduling (Stripe Connect optional)

## Why this is realistic (and legal)
- No scraping of third‑party websites.
- “Price Intelligence Engine” is modeled as:
  - **Exact** = provider portal + official APIs + licensed datasets
  - **Estimated** = platform historical / statistical ranges + confidence

## Project structure
- `app/` — frontend (Vite)
- `server/` — API (Express)
- `docker-compose.yml` — local Postgres

## Run locally

### 1) Start Postgres
```bash
docker compose up -d
```

### 2) Start API
```bash
cd server
cp .env.example .env
npm install
npm run generate
npm run migrate
npm run seed
npm run dev
```

API should be on: `http://localhost:8080`

### 3) Start Frontend
```bash
cd app
npm install
npm run dev
```

Frontend should be on: `http://localhost:5173`

## Demo accounts (seed)
- Admin: `admin@meditravel.local` / `admin1234`
- Provider: `provider@meditravel.local` / `provider1234`
- User: `user@meditravel.local` / `user1234`

## Main API endpoints
- `POST /auth/register`
- `POST /auth/login`
- `GET /me`
- `GET /providers/admin/pending` (admin)
- `POST /providers/admin/:providerId/verify` (admin)
- `GET /procedures/me` (provider)
- `POST /procedures/me` (provider upsert)
- `POST /quotations` (user create)
- `GET /quotations/me` (user/provider/admin)
- `POST /quotations/:id/attachments` (multipart upload)
- `GET /quotations/:id/messages` / `POST /quotations/:id/messages`
- `GET /notifications/me`
- Provider verification docs:
  - `POST /providers/verification-docs` (provider multipart)
  - `GET /providers/verification-docs/me` (provider)
  - `GET /providers/admin/verification-docs` (admin)
  - `POST /providers/admin/verification-docs/:docId/review` (admin)
  - `GET /providers/admin/audit-logs` (admin)
- FX & pricing confidence:
  - `GET /fx/rates?base=USD`
  - `GET /fx/convert?amount=100&from=USD&to=EUR`
  - `GET /pricing/procedure/:procedureId?currency=EUR` (confidence score)
- Payments:
  - `POST /payments/deposit` (MOCK or STRIPE PaymentIntent)
  - `POST /payments/stripe/create-payment-intent` (explicit)
  - `POST /payments/stripe/capture` (admin)
  - `POST /payments/release` (admin; schedules payout)
  - `POST /payments/refund` (admin; real Stripe refund when enabled)
  - `POST /payments/admin/payouts/run` (admin)

## Notes for production hardening (next)
- Replace JWT secret handling with proper secret manager
- Add refresh tokens + rotation
- Use object storage (S3/GCS) for attachments
- Configure Stripe Connect onboarding/KYC for providers
- Replace local file uploads with object storage (S3/GCS) for verification docs + attachments
- Add rate-limit and request validation on webhook endpoint
- Add rate-limits + WAF in front of API
=======
# meditravel
>>>>>>> ef13cbef975e94a5aae405bbb404f57510b2d6b1
