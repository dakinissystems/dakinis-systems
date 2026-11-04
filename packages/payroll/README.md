# @dakinis/payroll

Motor de nómina sin país fijo. Cada mercado es un paquete de datos: moneda, redondeo, conceptos y tramos.

Los importes son enteros en la unidad mínima de la moneda. Un 10 % es `rateBps: 1000`. Una hora es `hoursMilli: 1000`.

No trae tablas de IRPF, Seguridad Social ni equivalentes. Esas cifras las carga el tenant o un adaptador de mercado. `sampleFlatLevyPack` solo enseña la forma; no es una tarifa legal.

```js
import { calculatePay, genericEngagementPack } from "@dakinis/payroll";

const pack = genericEngagementPack({ currency: "EUR", amountMinor: 300000 });
const slip = calculatePay({
  engagement: pack.engagement,
  components: pack.components,
});
```

Bases de un concepto: `gross`, `taxable` (devengos imponibles menos deducciones con `reducesTaxable`) o el `code` de una línea ya calculada. El orden lo marca `sequence`.

Un recibo `approved`, `paid` o `void` no se recalcula (`slipIsLocked`).

Contrato HTTP y tablas: [`docs/contracts/payroll.json`](../../docs/contracts/payroll.json) · runbook [`docs/RUNBOOKS/payroll.md`](../../docs/RUNBOOKS/payroll.md).
