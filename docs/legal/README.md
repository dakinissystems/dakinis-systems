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

Flujos implementados: [`LEGAL-FLOWS.md`](./LEGAL-FLOWS.md)

**Implementación en apps:**

| Producto | Ruta código |
|----------|-------------|
| Landing | `apps/landing/src/i18n/legal-content.js` |
| Core | `platform/core/web/src/locales/legal-core.js` |
| AkoeNet | `apps/akoenet/Client/docs/legal/*.md` + `/legal/privacy-requests`, `/legal/privacidad-solicitudes` |
| StreamAutomator | `apps/streamautomator/docs/legal/*.md` |

**Emails públicos:** Cloudflare Email Routing → `@dakinissystems.com` reenvía a Gmail. **Catch-all desactivado.** StreamAutomator: `@streamautomator.com`.

| Uso | Email | `company.json` |
|-----|-------|----------------|
| Contacto general | hello@dakinissystems.com | `contactEmail` / `contacts.general` |
| Ayuda / soporte | help@dakinissystems.com | `supportEmail` / `contacts.support` |
| Facturación / Stripe | billing@dakinissystems.com | `billingEmail` / `contacts.billing` |
| Privacidad RGPD | privacy@dakinissystems.com | `privacyEmail` / `contacts.privacy` |
| Legal | legal@dakinissystems.com | `legalEmail` / `contacts.legal` |
| Administración interna | admin@dakinissystems.com | `adminEmail` / `contacts.admin` |

**Resend (no cambiar):** dominio `streamautomator.com` → `RESEND_FROM=Dakinis Systems <noreply@streamautomator.com>` (Core), `akonet@` (AkoeNet), `no-reply@` (StreamAutomator API).

**No usar el término DPO** en textos públicos; usar «canal de solicitudes de privacidad / Privacy Requests channel».
