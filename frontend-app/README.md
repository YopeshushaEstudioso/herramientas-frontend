# ToolHub — Frontend

Frontend en React + TypeScript + Vite para **herramientas-node-api**.
Incluye landing pública y panel de administración (login, productos,
categorías, clientes, ventas) consumiendo la API existente bajo `/api`.

## Stack

- React 18 + TypeScript
- react-router-dom (rutas y protección de `/admin`)
- axios (cliente HTTP centralizado, `baseURL: "/api"`)
- Vite (dev server / build)

## Estructura

```
frontend-app/
├─ src/
│  ├─ services/
│  │  ├─ api.ts          # cliente axios, baseURL "/api", interceptores JWT
│  │  ├─ auth.ts          # login/logout
│  │  └─ resource.ts       # fábrica de CRUD genérico (productos, categorías, ...)
│  ├─ context/AuthContext.tsx
│  ├─ components/          # ProtectedRoute, AdminLayout, StatusBlock
│  └─ pages/
│     ├─ Landing.tsx
│     ├─ Login.tsx
│     └─ admin/ (Dashboard, Productos, Categorias, Clientes, Ventas)
├─ Dockerfile               # build + nginx para producción
├─ nginx.conf                # SPA fallback + proxy /api y /docs al backend
└─ docker-compose.frontend.example.yml
```

## Correr en local

Requiere Node 20+ (o Bun). El backend (`herramientas-node-api`) debe estar
corriendo aparte, por defecto en `http://localhost:3000` (ver su
`.env.example`: `PORT=3000`).

```bash
cd frontend-app
bun install        # o: npm install
bun run dev         # o: npm run dev  -> http://localhost:5173
```

En desarrollo, Vite redirige las peticiones a `/api` hacia el backend local
(ver `vite.config.ts`). Si tu backend corre en otro puerto:

```bash
VITE_API_PROXY_TARGET=http://localhost:XXXX bun run dev
```

Para verificar el build de producción:

```bash
bun run build       # o: npm run build   -> debe pasar sin errores
bun run preview      # sirve dist/ localmente
```

> El código nunca apunta a `localhost:4005` ni a IPs directamente: todas
> las llamadas usan la ruta relativa `/api`, tanto en desarrollo (proxy de
> Vite) como en producción (proxy de nginx dentro del contenedor).

## Rutas

| Ruta                  | Descripción                          | Protegida |
|------------------------|---------------------------------------|-----------|
| `/`                     | Landing pública                        | No        |
| `/login`                | Login (POST `/api/auth/login`)         | No        |
| `/admin`                | Dashboard                              | Sí        |
| `/admin/productos`      | CRUD de productos                      | Sí        |
| `/admin/categorias`     | CRUD de categorías                     | Sí        |
| `/admin/clientes`       | Listado de clientes                    | Sí        |
| `/admin/ventas`         | Listado de ventas                      | Sí        |

Sin token JWT guardado, cualquier ruta `/admin/*` redirige a `/login`.

## Backend: endpoints y contrato real

Verificado directamente contra el código fuente de
[`herramientas-node-api`](https://github.com/yanditv/herramientas-node-api)
(`controllers/`, `models/`, `routes/`, `config/swagger.js`):

| Recurso    | Endpoints                                                         | Protegido |
|-------------|---------------------------------------------------------------------|-----------|
| Auth        | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh` | No |
| Auth        | `GET /api/auth/me`                                                    | Sí |
| Productos   | `GET/POST /api/productos`, `GET/PUT/DELETE /api/productos/:id`       | Sí |
| Categorías  | `GET/POST /api/categorias`, `GET/PUT/DELETE /api/categorias/:id`     | Sí |
| Clientes    | `GET/POST /api/clientes`, `GET/PUT/DELETE /api/clientes/:id`         | Sí |
| Ventas      | `GET/POST /api/ventas`, `GET/DELETE /api/ventas/:id` (sin PUT)       | Sí |

Campos reales de cada modelo (Sequelize):

- **Producto**: `id, nombre (único), descripcion, precio, stock, categoriaId, categoria` (objeto anidado vía `include`)
- **Categoria**: `id, nombre (único), descripcion`
- **Cliente**: `id, identificacion (único), nombres, apellidos, email (único), telefono, direccion`
- **Venta**: `id, fecha, total, clienteId, cliente` (anidado), `detalles: [{ productoId, cantidad, precioUnitario, subtotal, producto }]`.
  Se crea con `POST /api/ventas` enviando `{ clienteId, detalles: [{ productoId, cantidad }] }`;
  el backend calcula precios y descuenta stock en una transacción. No existe endpoint de edición, solo alta y baja.

Errores del backend siempre tienen la forma `{ status: "error", message, errors? }`.

## Autenticación

- El login hace `POST /api/auth/login` con `{ email, password }` y el backend
  responde `{ user: { id, email, rol }, accessToken, refreshToken }`
  (`controllers/auth.controller.js`).
- `accessToken` expira en **15 minutos**, `refreshToken` en 7 días
  (`middleware/auth.middleware.js`). Ambos se guardan en `localStorage` y el
  `accessToken` se envía como `Authorization: Bearer <accessToken>` en cada
  request (`src/services/api.ts`).
- Si una request responde `401`, el cliente intenta renovar automáticamente
  el `accessToken` con `POST /api/auth/refresh` antes de cerrar sesión; si
  la renovación falla, limpia la sesión y redirige a `/login`.

## Despliegue con Coolify

1. En Coolify, crea un recurso **Docker Compose** apuntando a este
   repositorio.
2. Agrega el servicio `frontend` (ver `docker-compose.frontend.example.yml`)
   a tu `docker-compose.yml` existente, junto a `backend` y `db`.
3. Ajusta en `frontend-app/nginx.conf` el nombre del servicio backend en
   `proxy_pass` para que coincida con el de tu compose.
4. Define las variables de entorno obligatorias del backend
   (`DB_PASSWORD`, `JWT_SECRET`, ver `.env.example` del backend).
5. Asigna el **dominio público solo al servicio `frontend`** (puerto 80).
   No publiques `backend`/`db` con dominio propio.
6. Deploy. Verifica:
   - La landing (`/`) carga.
   - `/login` autentica y devuelve token.
   - El panel `/admin/*` lee y modifica datos vía `/api/*`.
   - `/docs` muestra el Swagger del backend.

## Notas de implementación

- CRUD genérico: `services/resource.ts` expone `list/getOne/create/update/remove`
  para cualquier recurso REST (`productos`, `categorias`, `clientes`, `ventas`),
  evitando repetir rutas en cada pantalla.
- Cada pantalla maneja explícitamente estados de `loading`, `error` (con
  botón de reintento) y vacío (`EmptyBlock`).
- Los formularios de Productos y Categorías corren en un modal reutilizable
  con validación básica de campos requeridos y muestra de errores del API.
