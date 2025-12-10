# syntax=docker/dockerfile:1
FROM node:25-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:25-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json ./
COPY src ./src
COPY app.ts ./
COPY server.ts ./
COPY config ./config
COPY controllers ./controllers
COPY database ./database
COPY middleware ./middleware
COPY routes ./routes
COPY services ./services
COPY types ./types
COPY utils ./utils
COPY package*.json ./
RUN npm run build

FROM node:25-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:25-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
