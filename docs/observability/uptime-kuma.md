# Uptime Kuma — monitoreo mínimo

## Despliegue rápido

```bash
docker run -d --restart=always -p 3001:3001 -v uptime-kuma:/app/data louislam/uptime-kuma:1
```

## Monitores recomendados (60s)

| Nombre | URL |
|--------|-----|
| Gateway | `https://<tu-gateway>/health` |
| Auth | `https://<auth>/auth/health` |
| Core API | `https://core.dakinissystems.com/api/health` |
| AkoeNet API | `https://api.akoenet.dakinissystems.com/health` |
| StreamAutomator | `https://streamautomator.com/api/health/live` |

## Alertas

- Telegram bot o email en el panel de Uptime Kuma.
- Sentry complementa (errores), Uptime complementa (caídas).
