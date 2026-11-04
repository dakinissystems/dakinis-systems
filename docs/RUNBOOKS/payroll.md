# Runbook — Nómina (Dakinis One)

Módulo de pago de sueldos **sin mercado cerrado**. El cálculo está en [`packages/payroll`](../../packages/payroll). Las tablas son la migración [`061_payroll.sql`](../supabase/migrations/061_payroll.sql).

No calcula el impuesto de un país. No genera ficheros bancarios. No presenta modelos a una administración.

## Qué es genérico

| Pieza | Cómo se adapta |
|-------|----------------|
| Moneda | ISO en el contrato y en la jurisdicción. Yen usa exponente 0 |
| Redondeo | `half_up` o `half_even` |
| Relación | `employee`, `contractor`, `casual`, `director` |
| Base de pago | `salary`, `hourly`, `daily`, `piece` |
| Calendario | semanal, quincenal, bisemanal, mensual, cada cuatro semanas, o `custom` |
| Conceptos | devengo, deducción, aportación de empresa, informativo |
| Tramos | marginales, en puntos básicos, con techo y suelo |
| Identificadores | `external_ids_json`. Las etiquetas (NIF, RFC, SSN) van en `identifier_labels_json` |
| Cobro | `bank_transfer`, `cash`, `check`, `wallet`, `other`. El destino es `instrument_ref`, no el número de cuenta |

Un concepto con `jurisdiction_code` vacío aplica a todos los mercados de esa empresa. Uno con código `ES` o `MX` solo a ese. `selectComponents` filtra por fecha de vigencia.

## Provisioning

1. Aplicar [`061`](../supabase/migrations/061_payroll.sql) en los schemas Core que ya tengan `business`.
2. El API de Core (`api/src/modules/payroll`) todavía no está en este repo. El contrato de rutas es [`payroll.json`](../contracts/payroll.json).
3. Activar el módulo en ajustes (`enabled`) y en los módulos del plan (`payroll`). No entra solo por ser hospitality.

## Cálculo de un periodo

1. Crear jurisdicciones y conceptos vigentes.
2. Crear el contrato de cada persona (`amount_minor` es la tarifa: mes, hora, día o pieza).
3. Abrir el periodo (`start_on`, `end_on`, `pay_on`).
4. Para salario con prorrateo, mandar `dayCount` y `nominalDayCount`. Para horas, `hoursMilli` y horas extra con `multiplierBps` (15000 = 1,5×).
5. `calculatePay` devuelve bruto, deducciones, neto y coste de empresa.
6. Guardar el recibo. Si está `approved`, `paid` o `void`, no se vuelve a calcular.
7. El pago registra el método y el importe. Liquidar el banco es otro sistema.

## Permisos

| Clave | Quién |
|-------|--------|
| `payroll.view` | Ver recibos |
| `payroll.manage` | Contratos y conceptos |
| `payroll.run` | Calcular |
| `payroll.approve` | Cerrar la corrida |
| `payroll.pay` | Registrar el pago |

No están en el preset de manager ni de camarero. Hay que concederlos. El owner ya tiene comodín.

## Fuera de este módulo

- Tarifas oficiales de un país
- SEPA, ACH, SPEI u otro fichero de transferencias
- Modelos fiscales de nómina
- El espejo SQLite de Core, si el API local no usa Postgres
