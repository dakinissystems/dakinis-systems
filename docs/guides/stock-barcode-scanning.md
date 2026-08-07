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

No se usa la API nativa `BarcodeDetector` ni `html5-qrcode`. ZXing en vivo queda como mejora futura; ahora se prioriza un flujo Quagga estable.

---

## Normalización y validación

1. **Normalizar:** trim, mayúsculas, quitar espacios (`dakinisNormalizeScanReading` / `dakinisNormalizeStockScanCode`).
2. **Plausibilidad (front):** longitud mínima **8**; numéricos solo 8 / 12 / 13 / 14.
3. **Checksum GTIN:** EAN-8, UPC-A, EAN-13 y GTIN-14 deben pasar dígito de control (`dakinisIsValidGtinChecksum`). Code128 puede omitirlo (códigos internos).
4. **Resolver a insumo:** `dakinisResolveStockItemSlug` busca coincidencia por:
   - slug `bc-{codigo}`
   - barcode guardado en `config.stockBarcodes`
   - aliases: slug, `DK-{slug}`, etc.

Códigos nuevos se persisten en `business.config_json.stockBarcodes` (mapa slug → barcode).  
Los códigos demo por slug son **EAN-13 con checksum válido** (`dakinisStockDemoBarcode`).

---

## 1. Cámara

### Flujo

1. Usuario pulsa **Iniciar cámara**.
2. El navegador pide permiso; se usa cámara trasera si existe (`facingMode: environment`).
3. Se aplican, si el dispositivo lo permite: **autofocus continuo**, **zoom** ligero y **torch** (trasera).
4. Quagga2 analiza ~**10 FPS** solo la **ROI central** (~18–22 % de margen), con `patchSize: large` y readers limitados (`ean`, `ean_8`, `upc`, `code_128`).
5. Cada detección parcial se **ignora en la UI**. Solo se confirma tras:
   - longitud / checksum OK
   - **≥4 votos** del mismo código en ~700 ms (mapa de votos; el líder debe ganar claro)
   - **estabilidad espacial** (el centro del box no salta demasiado)
6. Confirmado → vibración corta → `onScan` → cooldown **~1 s** (no 3,5 s).
7. React **no** hace `setState` con lecturas intermedias: el campo muestra “Buscando…” hasta el código confirmado.

Se puede **voltear** cámara (frontal / trasera) sin salir del flujo. Quagga usa workers (`numOfWorkers`) cuando hay CPU suficiente.

### Por qué no se muestran parciales

Quagga puede devolver `97884` → `9788412` → … → `9788412345678` frame a frame. Eso **no** debe pintar el input: solo el consenso validado.

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
   - Quagga multi-config (y reescalados 1200/800 px), readers algo más amplios
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
- Longitud mínima **8**; cooldown ~800 ms entre lecturas.
- Checksum no es obligatorio (el hardware ya envía el código completo).

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
       │   votos+checksum+ROI               │
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

## Optimizaciones de cámara (checklist)

| Mejora | Estado |
|--------|--------|
| No mostrar lecturas parciales | Sí — solo “Buscando…” / código confirmado |
| Votos (mapa, ≥4) | Sí |
| Longitud ≥ 8 + checksum EAN/UPC | Sí |
| Readers limitados (live) | Sí — ean / ean8 / upc / code128 |
| ROI central + guía UI | Sí |
| ~10 FPS (`frequency`) | Sí |
| `patchSize: large` | Sí |
| Autofocus / zoom / torch | Sí (si el device lo soporta) |
| Estabilidad espacial del box | Sí |
| Cooldown ~1 s + vibración | Sí |
| `setState` solo al confirmar | Sí |
| Workers Quagga | Sí (`numOfWorkers`) |
| ZXing Live (sustituir Quagga) | Pendiente / opcional |

---

## Checklist operativo

- [ ] Core en HTTPS (cámara)
- [ ] Permiso de cámara en el navegador
- [ ] Usuario admin del tenant (API de mutación)
- [ ] Pistola en modo teclado + Enter
- [ ] Probar los tres modos con el mismo EAN-13 válido conocido
- [ ] En cocina con poca luz: comprobar torch (Android suele soportarlo mejor)

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
