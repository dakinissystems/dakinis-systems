# Estrategia y posicionamiento competitivo

> **Julio 2026** · Documentación **estratégica** (CEO, ventas, inversores).  
> Técnico → [`ARCHITECTURE.md`](../ARCHITECTURE.md) · Ops → [`STATUS.md`](../STATUS.md) · Mensaje → [`MESSAGING.md`](./MESSAGING.md)

**Tesis:** La arquitectura ya está varios pasos por delante del producto comercial. El mayor retorno ahora es **cerrar el ciclo completo de un cliente**, no añadir componentes.

---

## Posicionamiento canónico

| Nivel | Mensaje |
|-------|---------|
| **Plataforma** | Sistema operativo para empresas modernas |
| **Experiencia** | Inspirado en Microsoft 365 y Zoho One — un Hub, muchos productos, un login |
| **Comercial honesto** | PYME española en fase piloto; no competimos en escala con suites globales **aún** |

❌ *"Comparable a Microsoft 365"* en ventas  
✅ *"Inspirado en la experiencia de Microsoft 365 y Zoho One"*

---

## Jerarquía mental (vs competencia fragmentada)

```
Competidores típicos          Dakinis
───────────────              ───────
Usuario → App A              Workspace → Hub → Productos
Usuario → App B                    ↓
Usuario → App C              IA + Billing + Knowledge compartidos
```

Eso permite crecer como **SaaS multiempresa** — patrón Zoho One / Atlassian Cloud, orientado a operaciones de negocio y verticales.

---

## Comparativa por producto

### Dakinis One vs Holded / Odoo

| Aspecto | Dakinis One | Holded | Ganador |
|---------|-------------|--------|---------|
| Enfoque | Business OS + IA | ERP PYME | Empate narrativo |
| Vertical restaurante | ✅ Nativa | ❌ | Dakinis |
| Copilot IA | ✅ Nativo | ❌ | Dakinis |
| Antigüedad mercado ES | 2026 | 2017+ | Holded |
| PSD2 / banca | ⬜ | ✅ | Holded |
| Ecosistema | Hub + 4+ productos | Solo ERP | Dakinis |

**Estrategia:** No competir en "ERP tradicional". Nicho: *ERP con IA para restaurantes y PYMEs*.

### LifeFlow vs Fintonic / Finizens / ProjectionLab

| Aspecto | LifeFlow | Fintonic | Finizens | ProjectionLab |
|---------|----------|----------|----------|---------------|
| Enfoque | Planificación de vida | Agregador | Roboadvisor | Financial planning (US) |
| Gemelo 6 escenarios | ✅ | ❌ | ❌ | Parcial |
| Comparador ciudades ES | ✅ | ❌ | ❌ | ❌ |
| Coach IA | ✅ Pro | ❌ | ❌ | ❌ |
| PSD2 | ⬜ | ✅ | ❌ | ❌ |

**Estrategia:** *El ProjectionLab español* — océano azul en planificación, no en agregación. PSD2 → roadmap Q4 [`../ROADMAP.md`](../ROADMAP.md).

### AkoeNet vs Discord

| Aspecto | AkoeNet | Discord |
|---------|---------|---------|
| Automatización | Assistant modular nativo | Bots externos |
| IA | Dakinis AI Platform | Por bot, caro |
| Streaming | StreamAutomator nativo | StreamElements bot |
| Business | CRM, tickets (Core) | Casi nada |
| Efecto red | ⬜ | Masivo |

**Estrategia:** No ser "otro Discord". Ser *comunidades con IA y automatización* — streamers, devs, empresas.

### StreamAutomator vs Buffer / Streamlabs

| Ventaja Dakinis | Riesgo |
|-----------------|--------|
| Multi-plataforma + integración AkoeNet | React Doctor 61/100 |
| Stream mode + overlays | UI menos pulida |

**Estrategia:** Refactor técnico antes de features nuevas.

### Tabletop vs D&D Beyond / Roll20

| Ventaja | Riesgo |
|---------|--------|
| Cuenta opcional + offline | Sin licencia Wizards |
| Onboarding ecosistema | Efecto red competencia |

**Estrategia:** Puerta de entrada casual al ecosistema Dakinis.

---

## Competidores indirectos (peligrosos)

| Competidor | Por qué importa |
|------------|-----------------|
| Slack | Comunidad empresarial + IA |
| Notion | CRM/light database + IA |
| Zapier / Make | Automatización vs módulo Automation |
| HubSpot | CRM + IA vs Dakinis One |

**Respuesta:** Ecosistema integrado + IA cross-product + vertical restaurante — no ganar feature por feature.

---

## Comparativa suites (concepto)

| Plataforma | Similitud | Diferencia Dakinis |
|------------|-----------|-------------------|
| **Microsoft 365** | Hub, workspace, SSO, suite | IA compartida entre productos propios |
| **Zoho One** | CRM + apps conectadas | Más cercana filosóficamente |
| **Atlassian Cloud** | Workspace, marketplace, flags | Orientado dev; nosotros operaciones PYME |
| **Odoo** | Módulos | ERP monolítico; nosotros ERP = un producto |
| **Discord** | Comunidad | Comunicación + negocio + IA nativa |

---

## FODA resumido

### Fortalezas

- Arquitectura 4 capas documentada y escalable
- IA cross-product (Core, LifeFlow, AkoeNet)
- LifeFlow único en España (gemelo financiero)
- AkoeNet Assistant vs bots Discord
- Hub Admin + workspace identity
- Documentación ejecutable

### Debilidades

| # | Debilidad | Impacto |
|---|-----------|---------|
| 1 | Billing E2E ⬜ | No se puede cobrar |
| 2 | Sin cliente piloto | Sin validación mercado |
| 3 | SQLite prod LF/TT | Escala limitada |
| 4 | StreamAutomator 61/100 | Deuda técnica |
| 5 | Assistant sin E2E prod | Diferenciador no operativo |
| 6 | Sin PSD2 LifeFlow | Datos manuales |

### Oportunidades

- Vertical restaurante (Holded débil)
- AkoeNet streamers + StreamAutomator
- Tabletop onboarding → Hub
- Banking platform reutilizable B2B
- Marketplace (post-MRR)

### Amenazas

- Holded + Fintonic ventaja años + PSD2
- Discord efecto red
- Tiempo sin validación comercial
- Slack/Notion agregando IA

---

## Customer journey (priorización desarrollo)

Toda feature nueva debe mejorar:

```
Landing → Registro → Workspace → Hub → Primer producto → Invita equipo → Pago → Uso diario → Marketplace
```

Detalle → [`CUSTOMER-JOURNEY.md`](./CUSTOMER-JOURNEY.md) · Ciclo workspace → [`../HUB-WORKSPACE.md`](../HUB-WORKSPACE.md)

---

## Priorización estratégica

### 🔴 Antes del piloto

1. Billing E2E live  
2. Hub SSO E2E  
3. Primer cliente piloto  

### 🟠 Durante piloto

4. Hub Admin en uso real (miembros + plan)  
5. AkoeNet Assistant E2E (migr. `032`–`033` ✅ · workers)  
6. LifeFlow / Tabletop → Supabase  

### 🟡 Post-piloto (5+ clientes)

7. Super Admin Nivel 1  
8. Integraciones (Slack, Calendar)  
9. GoCardless LifeFlow  

### 🔵 Con ingresos recurrentes

10. Marketplace  
11. Banking en Dakinis One  
12. Multi-región banking  

---

## Mensajes por segmento

| Segmento | Dolor | Producto | Mensaje |
|----------|-------|----------|---------|
| Restaurantes | Pedidos, stock, clientes | Dakinis One | ERP con IA para restaurantes |
| PYME | Facturas, CRM | Dakinis One | Un lugar para operar el negocio |
| Profesional 25–45 | Planificar vida | LifeFlow | Gemelo financiero con IA |
| Streamer | Comunidad + programación | AkoeNet + SA | Todo tu streaming en un lugar |
| Jugador casual | Fricción D&D Beyond | Tabletop | D&D sin cuenta ni instalación |

---

## Pregunta guía

*¿Qué necesita un cliente para pagar por Dakinis este mes?*

1. Ver valor en 5 min → Hub SSO + demo  
2. Poder pagar → Billing E2E  
3. Usar con equipo → Hub Admin  
4. Problema resuelto → Restaurante (Dakinis One) o planificación (LifeFlow)  

**No desarrollar más productos** hasta piloto.

---

## Riesgo de sobreingeniería

| Señal | Mitigación |
|-------|------------|
| Nuevo microservicio sin cliente | Regla consolidar antes de ampliar |
| Compararse comercialmente con M365 | Lenguaje "inspirado en" |
| Docs solo técnicas | Esta carpeta `company/` + [`WHY.md`](../WHY.md) |
| Banking antes de piloto | Diseño doc; implementar post-validación |

---

*Actualizar tras primer cliente piloto o cambio de posicionamiento comercial.*
