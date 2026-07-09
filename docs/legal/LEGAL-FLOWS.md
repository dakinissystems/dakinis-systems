# Flujos legales — referencia rápida

> Comentarios en código: `apps/akoenet/Server/src/routes/{dpo,dmca}.routes.js`, `lib/legal-mail.js`, `Client/src/pages/PrivacyRequestsPage.jsx`

## Solicitudes de privacidad (RGPD) — AkoeNet

```
Usuario ? /legal/privacy-requests | /legal/privacidad-solicitudes
       ? PrivacyRequestsPage (GET /dpo/contact, POST /dpo/message)
       ? INSERT dpo_requests
       ? Resend: copia operador + confirmación usuario
       ? Consulta estado: GET /dpo/request/:id?email=…
```

- **Rutas públicas UI:** `/legal/privacy-requests` (EN), `/legal/privacidad-solicitudes` (ES)
- **Legacy:** `/legal/dpo` redirige según idioma
- **API:** `/dpo/*` y alias `/privacy-requests/*` (mismo router)
- **Email operador (privacy):** `LEGAL_INBOX_EMAIL` / `PRIVACY_INBOX_EMAIL` ? default `privacy@dakinissystems.com` (Cloudflare ? Gmail)
- **Email operador (DMCA):** `DMCA_NOTIFY_EMAIL` ? default `legal@dakinissystems.com`
- **Remitente Resend:** `akonet@streamautomator.com`
- **Sin DPO designado:** canal «Privacy Requests», no usar ese término en UI pública

## Copyright / DMCA — AkoeNet

```
Usuario ? /legal/dmca
       ? POST /dmca/takedown
       ? INSERT dmca_takedowns
       ? Resend: equipo (getDmcaNotifyRecipients) + confirmación reclamante
```

## Documentos estáticos — AkoeNet

```
/legal/:slug ? LegalDocPage (importa apps/akoenet/Client/docs/legal/*.md)
```

Slugs: `privacidad`, `terminos`, `seguridad`, `transparencia`, `child-safety`, etc.

## Dakinis One (Core)

Textos en `platform/core/web/src/locales/legal-core.js` ? rutas `/privacy`, `/terms`, `/legal`, `/security`, `/sla`.

## Fuente de verdad titular

`docs/legal/company.json` ? `packages/shared-brand` ? `node scripts/sync-shared-brand.mjs`
