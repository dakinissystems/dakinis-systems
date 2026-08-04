# WhatsApp and Meta Business Tools Terms (base)

**Last updated:** 4 August 2026  
**UI implementation:** `platform/core/web/src/locales/legal-core.js` (Dakinis One) · privacy summary on Landing.

> This document **does not replace** Meta's terms. It is an operational summary for Dakinis One customers. The binding legal text is the one published by Meta (which may change without notice).

## Official links (check the current version)

| Document | URL |
|----------|-----|
| Meta Business Tools Terms | https://www.facebook.com/legal/terms/businesstools |
| Meta Data Processing Terms (DPA) | https://www.facebook.com/legal/terms/dataprocessing |
| WhatsApp Business Terms | https://www.whatsapp.com/legal/business-terms |
| Meta Privacy Policy | https://www.facebook.com/privacy/policy/ |
| Consent resource (Meta cookies) | https://www.facebook.com/business/gdpr/consent |

## When this applies

- The **customer (tenant)** enables commercial messaging via the **WhatsApp Business API** or other **Meta Business Tools** from Dakinis One (Communications module).
- Dakinis Systems provides the technical integration; **Meta** processes data under its own terms.
- In the EU/EEA, **processor** clauses (Meta Ireland) and, in some cases, **joint controllership** (GDPR art. 26) may apply to event data on the customer's web/apps.

## Meta concepts (summary)

| Meta term | Short meaning |
|-----------|---------------|
| **Business Tool Data** | Data the customer sends to Meta via pixel, Conversions API, SDK, WhatsApp API, etc. |
| **Contact information** | Data that identifies people (email, phone, name) for **matching**; must be **hashed** per Meta docs. |
| **Event data** | Actions on web/app/store (visits, purchases, commercial messages, etc.) used for measurement, audiences, and ads. |

## Key tenant obligations

The customer represents and warrants, among other things (per Meta):

1. **Lawful basis and permissions** to share data with Meta (GDPR / Spanish LOPDGDD and applicable law).
2. **No** data of persons under **14** or prohibited categories (health, financial, SSN, cards, etc.).
3. **Transparent notice** on web/app: use of third-party technologies (incl. Meta) for measurement and advertising; how to opt out (e.g. https://www.aboutads.info/choices , https://www.youronlinechoices.eu/ ).
4. **Consent** where required (e.g. cookies in the EU) before storing Meta cookies on end-user devices.
5. **Notify** Dakinis and cooperate on claims related to Meta tools.
6. Place **pixels** only on sites **owned by the customer** (not on third-party sites without authorization).

## How Meta may use data (summary of section 2)

- Matching (contact information).
- Audience exclusion, measurement, campaign reports, analytics.
- Custom audiences and **commercial messages** (e.g. transactional on Messenger/WhatsApp).
- Improving ad delivery and security on Meta products.
- Retention of **event data for up to 2 years** (unless the customer deletes audiences).

## Role of Dakinis Systems

| Party | Typical role |
|-------|----------------|
| End customer of the business | Data subject |
| Customer (tenant) | **Controller** toward its customers; must comply with Meta Business Tools Terms when enabling WhatsApp |
| Dakinis Systems | Platform provider; processing per contract and Dakinis One privacy policy |
| Meta | **Processor** / **joint controller** depending on data type and tool (see Meta terms and DPA) |

**Dakinis Systems does not control Meta's independent processing.** Customers must review Meta's legal documentation before enabling integrations.

## Dakinis One product status

- **Communications** module (`/app/messages`): channels, rules, and previews.
- Live sending via **WhatsApp Business API** requires commercial activation and compliance with Meta/WhatsApp terms.

Spanish version: `whatsapp-meta-business-tools-base.md`
