# Fitness Platform (demo SaaS multi-tenant)

Base funcional pensada como **demo/mockup**: entrenadores gestionan fichas (`ClientProfile`), frecuencia de control (**DAILY / WEEKLY / MONTHLY**), rutinas y solicitudes del cliente; los clientes registran métricas corporales, ven la rutina activa y abren hilos (`FeedbackRequest`) para pedir cambios.

En el sistema de repos de Dakinis esta carpeta vive como **product repo** fuera del control repo (véase `.gitignore` en la raíz `dakinis-systems`).

## Arranque local (solo API + SPA)

Desde esta carpeta:

**PowerShell 5 (Windows):** no uses `&&`; encadena con `;` o ejecuta línea a línea.

```powershell
# Desde apps/fitness-platform
Copy-Item api\.env.example api\.env -Force
npm install
npm run db:push -w api; npm run db:seed -w api
npm run dev
```

Equivalente en bash / PowerShell 7+

```bash
cd apps/fitness-platform
cp api/.env.example api/.env    # o: Copy-Item en Windows
npm install
npm run db:push -w api && npm run db:seed -w api
npm run dev
```

Por defecto: API `http://127.0.0.1:4010`, cliente Vite `:5174`, admin `:5175`.

Credenciales seed:

- Entrenador: `trainer@demo.fit` / `demo123`
- Cliente: `cliente@demo.fit` / `demo123`

Los **ejercicios** pueden tener `videoUrl`: enlace público (**YouTube, Vimeo**, URL directa a `.mp4`/`.webm`/`.mov`) o vídeo subido por el entrenador (**MP4/MOV/WebM**) servido desde `GET /api/media/...` (requiere Bearer de cliente u entrenador del mismo tenant).

## Gateway (stack Docker root)

Si usas [`docker/compose.full.yml`](../../docker/compose.full.yml) en el checkout completo:

- Rutas públicas health: **`/fitness/api/health/*`**
- Resto de API tras prefijo **`/fitness/`** (JWT Bearer propio).

Para las SPAs, define si hace falta `VITE_API_BASE=http://localhost/fitness`.

Datos demo en contenedor (una vez arrancado el servicio):

```bash
docker compose -f docker/compose.full.yml exec fitness-platform-api npx prisma db seed
```

Contrato rápido: [`docs/contracts/fitness-platform-api.json`](../../docs/contracts/fitness-platform-api.json).
