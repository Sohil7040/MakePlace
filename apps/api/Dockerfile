FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
RUN npm ci -w apps/api --include-workspace-root=false 2>/dev/null || npm install -w apps/api

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY apps/api ./apps/api
COPY package.json ./
WORKDIR /app/apps/api
RUN npx prisma generate && npm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/api
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./node_modules

COPY apps/api/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
