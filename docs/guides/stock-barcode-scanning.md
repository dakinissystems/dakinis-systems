# Escaneo de códigos — stock restaurante (Dakinis One)

Cómo Dakinis One lee códigos de barras / QR para **inventario y stock de cocina**: cámara, imagen y lector láser USB.

**UI:** módulo Restaurante → Stock (panel de escaneo).  
**Stack compartido:** `StockBarcodeScanner` + `useStockBarcodeScanner` (también reutilizado en lotes/inventory).

---

## Resumen

| Modo | Cómo entra el código | Librería / mecanismo |
|------|----------------------|----------------------|
| **Cámara** | Vídeo en vivo (`getUserMedia`) | Quagga2 LiveStream (1D) |
| **Imagen** | Foto / archivo (`image/*`) | Quagga2 → ZXing (1D + QR) |
| **Láser USB** | Teclado “wedge” (HID) | Buffer de teclas rápidas + Enter |

Los tres modos **normalizan** el código y llaman al mismo `onScan(code)`. En stock, eso dispara alta, entrada o salida.

No se usa la API nativa `BarcodeDetector` ni `html5-qrcode`.

---

## Normalización y resolución

1. **Normalizar:** trim, mayúsculas, quitar espacios (`dakinisNormalizeScanReading` / `dakinisNormalizeStockScanCode`).
2. **Plausibilidad (front):** longitud mínima ~4; patrones numéricos típicos EAN/UPC.
3. **Resolver a insumo:** `dakinisResolveStockItemSlug` busca coincidencia por:
   - slug `bc-{codigo}`
   - barcode guardado en `config.stockBarcodes`
   - aliases: slug, `DK-{slug}`, etc.

Códigos nuevos se persisten en `business.config_json.stockBarcodes` (mapa slug → barcode).

---

## 1. Cámara

### Flujo

1. Usuario pulsa **Iniciar cámara**.
2. El navegador pide permiso; se usa cámara trasera si existe (`facingMode: environment`).
3. Quagga2 analiza el stream 1D (EAN, UPC, Code128, Code39, Codabar, I2of5).
4. Solo se confirma tras lecturas estables (varias detecciones en ~500 ms) y cooldown (~3,5 s) para no duplicar.
5. Código confirmado → `onScan`.

Se puede **voltear** cámara (frontal / trasera) sin salir del flujo.

### Requisitos

- **Contexto seguro:** HTTPS o `localhost` (obligatorio para `getUserMedia`).
- Permiso de cámara concedido.
- Dependencia: `@ericblade/quagga2`.

### Archivos

- `web/src/utils/stockBarcodeDecode.js` → `dakinisStartLiveBarcodeScanner`
- `web/src/hooks/useStockBarcodeScanner.js` → `beginCamera` / `startScanning`
- `web/src/components/StockBarcodeScanner.jsx`

---

## 2. Imagen (foto o archivo)

### Flujo

1. Usuario elige **imagen** (`accept="image/*"`; en móvil puede abrir cámara con `capture`).
2. FileReader → data URL.
3. Decode en cascada:
   - Quagga multi-config (y reescalados 1200/800 px)
   - Si falla → ZXing `BrowserMultiFormatReader` (incluye **QR**)
4. Hit → `onScan`; miss → mensaje de error de imagen.

### Requisitos

- Mismo contexto seguro recomendable.
- Dependencias: `@ericblade/quagga2`, `@zxing/browser`.

### Archivos

- `web/src/utils/stockBarcodeDecode.js` → `dakinisDecodeBarcodeFromImage`
- `useStockBarcodeScanner` → `handleImageChange`

---

## 3. Sensor láser / pistola USB (keyboard wedge)

Los lectores USB suelen comportarse como **teclado**: teclean el código a gran velocidad y terminan con **Enter** (o Tab).

### Dos vías

**A. Campo dedicado** (`data-dakinis-barcode-wedge="1"`)

- Focus automático al montar el panel.
- Enter / debounce (~220 ms) / pegado → confirman el código.

**B. Listener global HID** (`dakinisAttachHidBarcodeWedge`)

- Escucha `keydown` en captura.
- Agrupa pulsaciones rápidas (gap ≤ ~120 ms).
- Termina con Enter/Tab o pausa corta (~180 ms).
- Ignora tecleo normal en inputs (salvo el campo wedge).
- Cooldown ~800 ms entre lecturas.

### Requisitos de hardware / puesto

- Lector en modo **HID keyboard** (no hace falta driver propio).
- Página enfocada (o el campo wedge).
- Sufijo Enter/Tab configurado en el lector (recomendado).

### Archivos

- `web/src/utils/hidBarcodeWedge.js`
- Campo wedge en `StockBarcodeScanner.jsx`

---

## Qué pasa después del escaneo (stock)

`RestaurantStockScanPanel` → `dakinisApplyStockScan(barcode)`:

```
código
  ├─ conocido + sesión JWT
  │     → POST /api/tenant/restaurant/stock/scan
  │         { barcode, quantity, direction: "in" | "out" }
  │         movimientos: entrada-escaneo / salida-escaneo
  │
  └─ desconocido
        → formulario de alta
              → POST /api/tenant/restaurant/stock/items
                  (slug bc-…, barcode en config, opcional caducidad/lote)
              → si direction=out: crea y luego hace salida
```

**Auth:** negocio tipo restaurante + JWT con rol admin (mutaciones sensibles).

UI permite elegir **cantidad** y dirección **entrada / salida** antes de aplicar.

### API

| Método | Ruta | Uso |
|--------|------|-----|
| `POST` | `/api/tenant/restaurant/stock/scan` | Entrada/salida por barcode |
| `POST` | `/api/tenant/restaurant/stock/items` | Alta de insumo desde escaneo |
| `GET` | `/api/tenant/inventory/lots/resolve/:code` | (lotes) etiqueta de lote, otro panel |

Handlers: `api/src/api/tenant-restaurant.js`  
Catálogo: `shared/catalog/stock-barcodes.js`

---

## Lotes / inventory (mismo escáner)

En el panel de lotes, el mismo componente puede:

- Resolver **etiqueta de lote** → `GET .../inventory/lots/resolve/:code`
- O rellenar barcode de producto y pasar a pestaña **recibir**

---

## Diagrama rápido

```
┌─────────────┐  ┌─────────────┐  ┌──────────────────┐
│  Cámara     │  │  Imagen     │  │  Láser USB       │
│  Quagga     │  │  Quagga+ZX  │  │  HID wedge       │
└──────┬──────┘  └──────┬──────┘  └────────┬─────────┘
       │                │                   │
       └────────────────┼───────────────────┘
                        ▼
              normalize + confirmCode
                        ▼
                   onScan(code)
                        ▼
         ┌──────────────┴──────────────┐
         ▼                             ▼
   stock/scan (in/out)          stock/items (alta)
```

---

## Checklist operativo

- [ ] Core en HTTPS (cámara)
- [ ] Permiso de cámara en el navegador
- [ ] Usuario admin del tenant (API de mutación)
- [ ] Pistola en modo teclado + Enter
- [ ] Probar los tres modos con el mismo EAN conocido

---

## Código de referencia

| Pieza | Ruta |
|-------|------|
| UI escáner | `platform/core/web/src/components/StockBarcodeScanner.jsx` |
| Hook | `platform/core/web/src/hooks/useStockBarcodeScanner.js` |
| Decode cámara/imagen | `platform/core/web/src/utils/stockBarcodeDecode.js` |
| HID láser | `platform/core/web/src/utils/hidBarcodeWedge.js` |
| Lógica stock | `platform/core/web/src/hooks/useRestaurantStockSection.js` |
| Panel UI | `platform/core/web/src/components/RestaurantStockBody.jsx` |
| API | `platform/core/api/src/api/tenant-restaurant.js` |
| Normalización | `platform/core/shared/catalog/stock-barcodes.js` |

*Última actualización: 5 agosto 2026*
