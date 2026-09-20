# Runbook — Dominios Cloudflare + Google Workspace (Calle Brava / Ármala)

> Identidad digital del **cliente** · Dakinis sigue en `dakinissystems.com`  
> Modelo datos → [ADR-016](../adr/ADR-016-org-venture-location.md) · SQL → [`058_org_venture_location.sql`](../supabase/migrations/058_org_venture_location.sql)

## Estado real (sep 2026)

| Ítem | Estado |
|------|--------|
| Cloudflare Registrar (compra) | ❌ no hecho |
| Google Workspace | ❌ no contratado |
| Verificación oficial de disponibilidad | ⬜ **obligatoria antes de comprar** |
| Seed Hub org/venture/local | opcional (`provision_la_calle_brava_armala.sql`) — **sin dominios** |
| Filas `organization_domains` | solo tras confirmar libres (`provision_org_domains_candidates.sql`) |

### Sondeo técnico preliminar (no sustituye el registrador)

| Dominio | Señal | Notas |
|---------|-------|-------|
| `lacallebravagroup.com` | RDAP Verisign **404** → parece libre | Confirmar en Cloudflare al comprar |
| `lacallebravagroup.es` | Sin DNS público; RDAP nic.es no consultable aquí | Confirmar en [dominios.es](https://www.dominios.es) / CF |
| `armala.es` | Sin DNS público | Confirmar en dominios.es / CF |
| `armala.com` | RDAP **200** + NS NameBright → **ocupado** | No comprar; buscar variante |

**No gastes dinero** hasta completar §0.

---

## §0 — Gate: verificar nombres (ANTES de todo)

1. Entra en **Cloudflare Registrar** (o [dominios.es](https://www.dominios.es) para `.es`).
2. Busca exactamente:

| Candidato | Rol | ¿Comprar si libre? |
|-----------|-----|-------------------|
| `lacallebravagroup.es` | Empresa | Sí (prioridad) |
| `lacallebravagroup.com` | Redirect / protección | Sí si presupuesto |
| `armala.es` | Marca | Sí (prioridad marca) |
| `armala.com` | — | **No** (ocupado en check) |

3. Si `armala.es` no está libre, **no inventes** `.food`/`.shop` a ciegas: acordar marca + redes (`@armala…`) y **después** dominio coherente.
4. Anota en un checklist quién compró / fecha / registrador.
5. Solo entonces: comprar → Workspace → MX → seed de dominios.

Marca / razón social ≠ dominio libre. También conviene mirar conflictos de marca (OEPM / búsqueda comercial) aparte del DNS.

---

## Qué comprar (solo tras §0)

Registrar en **Cloudflare Registrar** (DNS + renovación automática + 2FA).

Titular: datos reales de los socios (o sociedad cuando exista). Ambos con acceso admin a Cloudflare.

## Correo ≠ dominio

```
Cloudflare (dominio + DNS)
        │
        ▼
Google Workspace (buzones reales)
        │
   ┌────┴────┐
socio1@…  socio2@…
        │
   aliases: hola@, pedidos@, …
```

**Pagar solo usuarios reales** (2 socios). El resto = **alias / grupos** en Workspace.

### Fase inicial — usuarios reales (cuando el dominio exista)

- `christian@lacallebravagroup.es` (o el `.es` definitivo)
- `socio@lacallebravagroup.es`

Hasta entonces el IdP/Hub puede seguir con emails personales; migrar después.

### Alias (sin buzón extra)

Calle Brava: `hola@` · `administracion@` · `finanzas@` · `proveedores@`  
Ármala: `hola@` · `pedidos@` · `reservas@`

## Orden operativo

1. **§0 verificar disponibilidad** (bloqueante).
2. Comprar solo los que salgan libres.
3. Contratar **Google Workspace**.
4. TXT verificación → **MX** de Google → SPF/DKIM/DMARC (`p=none` al inicio).
5. 2 usuarios socios + aliases.
6. Segundo dominio de marca en el mismo Workspace.
7. En Dakinis: `058` → `provision_la_calle_brava_armala.sql` → (opcional) `provision_org_domains_candidates.sql` con `v_confirmed_domains` relleno.
8. Actualizar `dns_status` a `verified` / `mx_ok` cuando el correo funcione.

## Qué NO mezclar

| Sistema | Dominio |
|---------|---------|
| Dakinis plataforma | `dakinissystems.com` |
| Empresa cliente | el `.es` corporativo **confirmado** |
| Marca restaurant | el dominio de marca **confirmado** |

## Checklist

- [ ] Disponibilidad comprobada en registrador (no solo DNS local)
- [ ] `armala.com` descartado o plan B documentado
- [ ] Compra CF + auto-renew + 2FA
- [ ] Workspace + MX/SPF/DKIM/DMARC
- [ ] Sin cuentas compartidas
- [ ] Seed dominios solo con lista confirmada
