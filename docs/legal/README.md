# Legal — fuente de verdad corporativa

Plantillas **bilingües (ES + EN)**. Revisar con asesoría legal antes de producción.  
Datos del titular: [`company.json`](./company.json) · NIF **18513473Z**

| Archivo ES | Archivo EN | Uso |
|------------|------------|-----|
| `legal-notice-base.md` | `legal-notice-base.en.md` | Aviso legal (LSSI) |
| `privacy-base.md` | `privacy-base.en.md` | Privacidad corporativa |
| `cookies-base.md` | `cookies-base.en.md` | Cookies |
| `terms-base.md` | `terms-base.en.md` | Términos sitio |
| `privacy-requests-base.md` | `privacy-requests-base.en.md` | Canal solicitudes RGPD |
| `copyright-complaints-base.md` | `copyright-complaints-base.en.md` | Copyright / DMCA |
| `security-policy-base.md` | `security-policy-base.en.md` | Seguridad (ecosistema) |
| `retention-policy-base.md` | `retention-policy-base.en.md` | Retención de datos |
| `sla-base.md` | `sla-base.en.md` | SLA Dakinis One (B2B) |
| `ai-automation-base.md` | `ai-automation-base.en.md` | IA / automatización |
| `transparency-dsa-base.md` | `transparency-dsa-base.en.md` | Transparencia DSA (AkoeNet) |
| `whatsapp-meta-business-tools-base.md` | *(resumen EN al final)* | Meta / WhatsApp |

**Implementación en apps:**

| Producto | Ruta código |
|----------|-------------|
| Landing | `apps/landing/src/i18n/legal-content.js` |
| Core | `platform/core/web/src/locales/legal-core.js` |
| AkoeNet | `apps/akoenet/docs/legal/*.md` + `/legal/privacy-requests`, `/legal/privacidad-solicitudes` |
| StreamAutomator | `apps/streamautomator/docs/legal/*.md` |

**Emails públicos:** `@dakinis-systems.com` · seguridad: `security@`, `safety@`

**Resend:** dominio `streamautomator.com` → `RESEND_FROM=Dakinis Systems <noreply@streamautomator.com>`

**No usar el término DPO** en textos públicos; usar «canal de solicitudes de privacidad / Privacy Requests channel».
