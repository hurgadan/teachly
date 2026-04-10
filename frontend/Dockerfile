# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:22-alpine AS builder
WORKDIR /monorepo

# Copy backend contracts needed for @contracts alias in nuxt.config.ts
COPY backend/src/_contracts ./backend/src/_contracts

# Copy frontend source
COPY frontend/ ./frontend/

WORKDIR /monorepo/frontend

# npm install (not npm ci) to handle platform-specific packages missing from macOS-generated lock file
RUN --mount=type=secret,id=npm_token \
    GITHUB_PAT=$(cat /run/secrets/npm_token) npm install --prefer-offline

RUN npm run build

# ---- Production stage ----
FROM node:22-alpine
WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

COPY --from=builder /monorepo/frontend/.output ./

EXPOSE 3000
CMD ["node", "server/index.mjs"]
