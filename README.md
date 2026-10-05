# SHTRIXCOLOGY

AI-powered circular-economy platform for packaging.

## Stack

- **Mobile:** React Native + Expo SDK 52
- **Backend:** Node + Express + Prisma
- **DB:** PostgreSQL 18
- **AI:** Gemini 2.5 Flash
- **Monorepo:** pnpm workspaces

## Struktura

shtrixcology/
├── apps/mobile/         React Native + Expo
├── packages/shared/     TypeScript types + Zod
├── packages/api-client/ API client
├── packages/ui/         Design tokens
└── services/api/        Express + Prisma backend

## Setup

### 1. Talablar
- Node.js 20+
- pnpm 9+
- PostgreSQL 18+

### 2. O'rnatish

```bash
git clone <repo>
cd shtrixcology
pnpm install