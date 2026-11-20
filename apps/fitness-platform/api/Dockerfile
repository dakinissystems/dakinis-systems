# Build context: desde `apps/fitness-platform/api` en el checkout completo.
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./
RUN npm install
RUN npx prisma generate && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl curl libc6-compat
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package*.json ./
ENV DATABASE_URL=file:/app/data/dev.db
RUN mkdir -p /app/data
EXPOSE 4010
CMD ["sh", "-c", "npx prisma db push && exec node dist/index.js"]
