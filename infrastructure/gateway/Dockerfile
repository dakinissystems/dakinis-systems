# Borde Dakinis para despliegue en contenedor (Railway Root Directory = `infrastructure/gateway`).
# Compose local puede usar `nginx:alpine` con bind-mount; esta imagen empaqueta la misma config.
FROM nginx:1.27-alpine@sha256:65645c7bb6a0661892a8b03b89d0743208a18dd2f3f17a54ef4b76fb8e2f2a10

RUN mkdir -p /var/cache/nginx/auth \
    && chown -R nginx:nginx /var/cache/nginx/auth

COPY nginx.conf /etc/nginx/nginx.conf
COPY routes/ /etc/nginx/routes/

EXPOSE 80

# Railway / orquestadores: Healthcheck Path recomendado en panel: /health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/health >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
