# Evidencias

Un control no pasa a verificado porque el runbook lo describa. El artefacto se guarda aquí, con fecha en el nombre, cuando la prueba se ha ejecutado.

Ejemplos de nombre, todavía sin archivo porque la prueba no se ha hecho:

- `auth-no-jwt-YYYYMMDD.txt` — arranque sin `JWT_SECRET`
- `auth-iss-aud-YYYYMMDD.txt` — token sin `aud` recibe 401
- `billing-webhook-unique-YYYYMMDD.txt` — `\d billing.stripe_webhook_events`
- `auth-rate-limit-YYYYMMDD.txt` — salida de `scripts/verify-auth-rate-limit.ps1`
- `isolation-export-YYYYMMDD.txt` — exportación del tenant A sin filas del tenant B
- `restore-YYYYMMDD.md` — ficha de restauración

No se copia un secreto, un token ni una fila de un cliente.
