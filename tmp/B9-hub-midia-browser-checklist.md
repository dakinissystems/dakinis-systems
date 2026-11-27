# Hub Mi día — residual B9

**Código:** **PASS** — `hub-live-attention.test.js` 5/5 en Hub main (`146d193`)  
**Browser ops:** ⬜ **bloqueado** — 2026-11-27 `https://hub.dakinissystems.com/login` (sin sesión piloto en el agente)

## Cubierto en tests (sin cobro)

| Caso | Test |
|------|------|
| `stock.low` → Ver inventario → `open-core-inventory` | `test/hub-live-attention.test.js` |
| Path seguro `/app/inventario` | `test/hub-core-action-path.test.js` |
| Pedidos → `/app/ventas` | mismos suites |

## Browser (cuando haya sesión)

1. Login Hub IdP piloto (`heladeria-copernico` u operador)  
2. Mi día → stock bajo → **Ver inventario**  
3. Mi día → pedido → **Ver pedidos**  
4. Marcar PASS aquí con fecha  
