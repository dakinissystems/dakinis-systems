# Condición 3 — Sesión revocable

**Fecha:** 2026-11-27  
**Código:** 🟢 main  
**Railway Auth:** 🟢 (confirmado operador) · circuit smoke **10/10** post-merge

## Código

| Pieza | Estado |
|-------|--------|
| Lógica reuse → 401 + family revoke | `src/services/refresh-token.service.js` |
| PR inicial | [#3](https://github.com/dakinissystems/dakinis-auth/pull/3) |
| CI fix (sin `mock.module`) | [#4](https://github.com/dakinissystems/dakinis-auth/pull/4) @ `61a3bd1` · tests **2/2** local |

## Live — ⬜

Ensayo: refresh revocado → 401 en Auth (staging aparcado / sesión piloto).
