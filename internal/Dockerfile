FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages ./packages
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev
COPY src ./src
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1 || exit 1
CMD ["node", "src/server.js"]
