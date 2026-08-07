# Flujos legales � referencia r�pida

> C�digo: `apps/akoenet/Server/src/routes/{dpo,dmca}.routes.js`, `lib/legal-mail.js`, UI `Client/src/pages/DpoPage.jsx` (canal �Privacy requests�; la API sigue en `/dpo/*`).

## Solicitudes de privacidad (RGPD) � AkoeNet

```
Usuario ? /legal/privacy-requests | /legal/privacidad-solicitudes
       ? DpoPage (GET /dpo/contact, POST /dpo/message)
       ? INSERT dpo_requests
       ? Resend: copia operador + confirmaci�n usuario
       ? Consulta estado: GET /dpo/request/:id?email=�
```

- **Rutas p�blicas UI:** `/legal/privacy-requests` (EN), `/legal/privacidad-solicitudes` (ES)
- **Legacy:** `/legal/dpo` redirige a `/legal/privacy-requests`
- **API:** `/dpo/*` y alias `/privacy-requests/*` (mismo router)
- **Email operador (privacy):** `LEGAL_INBOX_EMAIL` / `PRIVACY_INBOX_EMAIL` ? default `privacy@dakinissystems.com` (Cloudflare ? Gmail)
- **Email operador (DMCA):** `DMCA_NOTIFY_EMAIL` ? default `legal@dakinissystems.com`
- **Remitente Resend:** `akonet@streamautomator.com`
- **Sin DPO designado:** canal �Privacy Requests� / �Solicitudes de privacidad�; no usar �DPO� en UI p�blica

## Copyright / DMCA � AkoeNet

```
Usuario ? /legal/dmca
       ? POST /dmca/takedown
       ? INSERT dmca_takedowns
       ? Resend: equipo (getDmcaNotifyRecipients) + confirmaci�n reclamante
```

## Documentos est�ticos � AkoeNet

```
/legal/:slug ? LegalDocPage (importa apps/akoenet/Client/docs/legal/*.md)
```

Slugs: `privacidad`, `terminos`, `seguridad`, `transparencia`, `child-safety`, etc.

## Dakinis One (Core)

Textos en `platform/core/web/src/locales/legal-core.js` ? rutas `/privacy`, `/terms`, `/legal`, `/security`, `/sla`.

## StreamAutomator

- Live: `apps/web/src/pages/{Privacy,Terms,Cookies,LegalNotice}.js` (`/privacy`, `/terms`, `/cookies`, `/legal-notice`)
- Markdown de referencia: `apps/streamautomator/docs/legal/` (ES + EN)

## Canales de publicaci�n (sin sync autom�tico)

| Canal | Ubicaci�n |
|-------|-----------|
| Corpus corporativo | `docs/legal/*-base*` + `company.json` |
| Core | `platform/core/web/src/locales/legal-core.js` |
| AkoeNet | `apps/akoenet/Client/docs/legal/*.md` + formularios |
| StreamAutomator | JSX live + `apps/streamautomator/docs/legal/` |

Tras editar pol�ticas, actualizar **los cuatro canales** (o el producto afectado) y la fecha. Identidad de marca: `company.json` ? `packages/shared-brand` v�a `node scripts/sync-shared-brand.mjs` (no copia textos legales completos).

## Fuente de verdad titular

`docs/legal/company.json` ? `packages/shared-brand` ? `node scripts/sync-shared-brand.mjs`
