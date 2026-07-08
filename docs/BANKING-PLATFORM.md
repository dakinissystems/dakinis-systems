# Dakinis Banking Platform — agregación multi-banco

> **Julio 2026** · Diseño estratégico. **No implementado.** Prioridad post-piloto LifeFlow Pro.  
> LifeFlow consume este servicio · Dakinis One podría reutilizarlo para conciliación B2B.

Para que LifeFlow funcione en **cualquier país** con **cientos de bancos**, no se integra cada banco individualmente. La estrategia de Revolut, Monarch, Copilot Money, Emma o YNAB es una **capa de agregación bancaria** con modelo de datos unificado.

---

## Arquitectura

```
                 LifeFlow (y futuro Dakinis One)
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   Open Banking        CSV/Excel         Manual
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
              Banking Integration Layer
                           │
     ┌──────────┬───────────┬─────────────┐
     │          │           │             │
  Plaid    GoCardless    Belvo      Salt Edge
     │          │           │             │
     └──────────┴───────────┴─────────────┘
              Miles de bancos por región
```

**Servicio platform reutilizable** — no lógica embebida solo en LifeFlow.

```
Dakinis Banking Platform
├── Banking Providers (conectores)
├── Normalizer
├── Categorizer
├── FX Engine
├── Account Sync
├── Investment Sync
├── Loan Sync
├── Webhooks
└── AI Insights → AI Platform
```

---

## Interfaz de proveedor (diseño)

Todos los conectores implementan el mismo contrato; LifeFlow nunca sabe si los datos vienen de Plaid o GoCardless.

```typescript
interface BankProvider {
  connect(workspaceId: string, options: ConnectOptions): Promise<Connection>;
  refresh(connectionId: string): Promise<void>;
  accounts(connectionId: string): Promise<Account[]>;
  transactions(connectionId: string, since: Date): Promise<Transaction[]>;
  balances(connectionId: string): Promise<Balance[]>;
  investments?(connectionId: string): Promise<Investment[]>;
  loans?(connectionId: string): Promise<Loan[]>;
  cards?(connectionId: string): Promise<Card[]>;
}
```

### Conectores previstos

| Provider | Región | Estado |
|----------|--------|--------|
| `GoCardlessProvider` | Europa (PSD2) | ⬜ |
| `TrueLayerProvider` | Europa | ⬜ |
| `PlaidProvider` | EE.UU. | ⬜ |
| `BelvoProvider` | LATAM | ⬜ |
| `PrometeoProvider` | Argentina, Chile… | ⬜ |
| `SaltEdgeProvider` | Multi-región | ⬜ |
| `CSVProvider` | Global | ⬜ MVP manual |
| `OFXProvider` | Legacy banks | ⬜ |
| `PDFProvider` | OCR + LLM | ⬜ vía AI Platform |
| `ManualProvider` | Siempre disponible | ✅ hoy (LifeFlow) |

---

## Provider Resolver

```
Usuario elige país
      ↓
Resolver (country + currency + bank hint)
      ↓
Proveedor adecuado
```

| País | Proveedor preferido |
|------|---------------------|
| España / EU | GoCardless Bank Account Data |
| EE.UU. | Plaid |
| Brasil / México | Belvo |
| Argentina | Prometeo |
| Sin Open Banking | CSV → PDF (IA) → Manual |

No depender de **un solo proveedor** — fallback si un aggregator cae o no cubre un banco.

---

## Modelo de datos unificado

### Account

```json
{
  "id": "acc_…",
  "provider": "gocardless",
  "bankName": "Santander",
  "currency": "EUR",
  "type": "checking",
  "balance": 12450.32,
  "availableBalance": 12000.00
}
```

### Transaction

```json
{
  "id": "txn_…",
  "date": "2026-07-01",
  "description": "Mercadona",
  "amount": -43.21,
  "currency": "EUR",
  "merchant": "Mercadona",
  "category": "groceries",
  "accountId": "acc_…"
}
```

### Investment / Loan

Campos normalizados para patrimonio y escenarios LifeFlow — ver engine en [`adr/ADR-006-lifeflow-engine.md`](./adr/ADR-006-lifeflow-engine.md).

---

## Onboarding LifeFlow (UX propuesta)

No obligar a conectar banco en el primer minuto:

```
¿Cómo quieres importar tus datos?

○ Conectar banco (Open Banking)
○ Subir CSV / Excel
○ Subir extracto PDF
○ Introducir manualmente
○ Lo haré después
```

Reduce fricción; el coach IA funciona con cualquier origen una vez normalizado.

---

## Integración con IA

```
Banco / CSV / PDF
      ↓
Transacciones normalizadas
      ↓
Motor LifeFlow (Score · Forecast · Scenarios)
      ↓
AI Platform (coach)
      ↓
"Este mes has gastado un 23% más en restaurantes."
```

Mismo pipeline para datos Plaid o CSV — el diferencial es automatización, no el modelo mental.

---

## Consumidores platform

| Producto | Uso |
|----------|-----|
| **LifeFlow** | Planificación personal, gemelo financiero, coach |
| **Dakinis One** (futuro) | Conciliación bancaria, tesorería PYME |
| **Hub** | Widget saldo / alertas (roadmap) |

---

## Roadmap

| Fase | Entregable | Prioridad |
|------|------------|-----------|
| 0 | Este doc + CSV import robusto | 🟠 |
| 1 | `CSVProvider` + categorizer | Post-piloto |
| 2 | GoCardless EU (ES primero) | LifeFlow Pro |
| 3 | Plaid US si expansión | 🔵 |
| 4 | Belvo/Prometeo LATAM | 🔵 |
| 5 | Dakinis One conciliación | Con cliente B2B |

**Bloqueo comercial LifeFlow hoy:** sin PSD2 el valor es planificación manual — mensaje honesto en [`PRODUCTS.md`](./PRODUCTS.md).

---

## Referencias de mercado

| App | Estrategia |
|-----|------------|
| Monarch Money | Plaid + MX + Finicity |
| Copilot Money | Plaid |
| Emma | TrueLayer + Open Banking |
| Fintonic | Open Banking + acuerdos propios |
| YNAB | Plaid + importación manual |

Ninguna depende de un solo proveedor.

---

*Actualizar al elegir primer aggregator y crear ADR dedicado.*
