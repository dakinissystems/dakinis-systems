# i18n del ecosistema Dakinis

> **Actualizado:** junio 2026  
> Idiomas soportados en UI: **español (es)** y **inglés (en)**.

## Fuente central de catálogo y marca

| Recurso | Ubicación | Formato bilingüe |
|---------|-----------|------------------|
| Productos Hub/Landing | `packages/shared-brand/src/products.json` | `i18n.name`, `i18n.summary` (+ fallback `name` / `summary`) |
| Módulos Hub | `packages/shared-brand/src/hub-modules.json` | `i18n.label`, `i18n.description` |
| Tagline empresa | `packages/shared-brand/src/company.js` | `taglineI18n.es` / `.en` |
| Helpers | `packages/shared-brand/src/i18n.js` | `dakinisPickLocaleString`, `dakinisProductField`, `dakinisHubModuleField` |

Consumo:

```javascript
import { dakinisProductField } from "@dakinis/shared-brand/i18n";
import { dakinisHubModuleToTile } from "@dakinis/shared-brand";

dakinisProductField(product, "name", locale);
dakinisHubModuleToTile(module, locale);
```

**Landing vendoreada:** tras cambiar `packages/shared-brand`, copiar a `apps/landing/packages/shared-brand/`.

## Traducciones por aplicación

| Sistema | Archivos | Claves ES/EN |
|---------|----------|----------------|
| **Core** (`dakinis-core/web`) | `src/locales/es.js`, `en.js` | Paridad verificada (`scripts/check-locale-parity.mjs`) |
| **Landing** | `src/i18n/translations.js` + `legal-content.js` | `es` / `en` en translations; legal `legalEs` / `legalEn` |
| **StreamAutomator Web** | `src/locales/es.json`, `en.json` | Incluido en script de paridad |
| **AkoeNet Client** | `src/locales/es.js`, `en.js` + `*ServerUi.js` | i18next `deepMergeTranslations` |
| **dakinis-auth** | Sin UI pública de marketing | Mensajes API en inglés técnico |

## Almacenamiento de locale (usuario)

| App | localStorage key |
|-----|------------------|
| Core | `dakinis-locale` |
| Landing | `dakinis.locale` |
| AkoeNet (web) | `dakinis.locale` (landing) |
| StreamAutomator | Ver `LanguageContext` en web |

## Catálogo dinámico (admin)

`GET/PUT /api/platform/catalog` puede sobrescribir `products` y `hubModules` en `platform_kv`.  
Al editar en `/admin`, mantener bloques `i18n` con `es` y `en` para no romper el Hub en inglés.

## Verificación

```bash
node scripts/check-locale-parity.mjs
```

## Pendiente (no bloqueante)

- Unificar clave `localStorage` entre apps (`dakinis.locale` vs `dakinis-locale`).
- Mensajes de error API localizados por `Accept-Language`.
- Auth / emails transaccionales bilingües.
