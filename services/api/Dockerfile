FROM node:20-alpine AS base
RUN npm install -g pnpm@9

WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY services/api/package.json ./services/api/

RUN pnpm install --frozen-lockfile --filter @shtrixcology/api...

COPY packages/shared ./packages/shared
COPY services/api ./services/api

RUN pnpm --filter @shtrixcology/shared build
RUN pnpm --filter @shtrixcology/api prisma:generate
RUN pnpm --filter @shtrixcology/api build

EXPOSE 3000
CMD ["node", "services/api/dist/index.js"]