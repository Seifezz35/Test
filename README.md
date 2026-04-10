# CaptainProfit

CaptainProfit is a mobile-first earnings tracker for ride-hailing drivers with an Arabic-first RTL interface, JWT auth, trip analytics, and smart advice cards.

## Stack

- Frontend: React 18 + TypeScript + Vite + Tailwind CSS + Recharts + Zustand
- Backend: Node.js + Express + TypeScript + Prisma
- Database: PostgreSQL
- Auth: JWT access/refresh tokens + bcrypt + OTP verification

## Project Structure

```text
captainprofit/
├── client/
├── server/
├── .env.example
└── package.json
```

## Setup

1. Install Node.js 20+ and npm.
2. Copy `.env.example` to `.env` and update values.
3. Install dependencies:

```bash
npm install
```

4. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start the client and server:

```bash
npm run dev
```

## Main Features

- Email or phone registration with OTP verification
- JWT login with refresh flow and remember me
- Trip CRUD with automatic net profit calculation
- Daily, monthly, and cumulative analytics
- Smart Arabic advice engine
- Profile settings, export CSV, and account deletion
- PWA manifest and service worker

## Notes

- OTP mail/SMS services are placeholder console implementations for now.
- The initial Prisma migration is included at `server/prisma/migrations/20260410000000_init/migration.sql`.
- API base URL defaults to `http://localhost:4000/api`.
