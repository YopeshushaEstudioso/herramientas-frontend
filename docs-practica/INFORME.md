# Informe — Práctica Frontend + Google Stitch + Coolify

**Nombre:**
**Fecha:**
**Repositorio:** <URL del repositorio público>

---

## 1. Diseño con Google Stitch

### 1.1 Landing Page

**Prompt usado:**
```
Design a modern industrial tools ecommerce landing page.

Include:
- Hero section with title "Herramientas Industriales"
- Subtitle promoting quality tools
- CTA button "Comprar ahora"
- Features section with icons
- Categories section
- Footer with contact information

Use blue, orange and white colors.
Responsive modern UI.
```

**Captura:**
`![Landing - Stitch](./capturas-stitch/landing.png)`

| Pantalla | Prompt usado | Captura |
|---|---|---|
| Login | `Design a clean admin login page. Include: Email field, Password field, Login button, Company logo, Minimal industrial style. Responsive.` | `capturas-stitch/login.png` |
| Dashboard | `Design an admin dashboard for an industrial tools store. Include: Sidebar (Dashboard, Products, Categories, Clients, Sales), Main area with cards with statistics and recent sales table. Modern responsive design.` | `capturas-stitch/dashboard.png` |
| Productos (tabla CRUD) | `Design an admin products page. Include: Products table with columns Name, Category, Price, Stock, Actions. Buttons: New Product, Edit, Delete. Search bar. Responsive.` | `capturas-stitch/productsmanagement.png` |
| Categorías | `Design an admin categories management page. Include: Categories table, New Category button, Edit/Delete actions. Responsive design.` | `capturas-stitch/categoriesmanagement.png` |
| Clientes | `Design an admin clients page. Include: Clients table with Name, Email, Phone, Status. Search. Responsive.` | `capturas-stitch/clientdirectory.png` |
| Ventas | `Design an admin sales page. Include: Sales table with Customer, Date, Amount, Status. Filters. Responsive.` | `capturas-stitch/salesrecord.png` |
### 1.3 Código exportado

El HTML/CSS exportado de Stitch para cada pantalla se guardó en
`docs-practica/stitch-export/` (opcional, solo como referencia — la
implementación final vive en `frontend-app/src`).

---

## 2. Integración en React

Resumen de decisiones tomadas al pasar de Stitch a `frontend-app/`:

- Rutas con `react-router-dom`: `/`, `/login`, `/admin`, `/admin/productos`,
  `/admin/categorias`, `/admin/clientes`, `/admin/ventas`.
- Cliente HTTP en `src/services/api.ts` con `baseURL: "/api"`.
- Autenticación JWT vía `POST /api/auth/login`, token en `localStorage`,
  header `Authorization: Bearer <token>` en cada request.
- `ProtectedRoute` redirige a `/login` si no hay token.
- CRUD completo de Productos y Categorías; listados de Clientes y Ventas.
- Estados de `loading` / `error` / vacío en cada pantalla.

**Verificación local:**
```
cd frontend-app
bun install
bun run dev      # OK
bun run build    # sin errores ✅ (adjuntar captura de la terminal)
```

`![Build local sin errores](./capturas-deploy/build-local.png)`

---

## 3. Despliegue con Coolify

- **URL pública:** `<pega aquí la URL final de Coolify>`
- Recurso: Docker Compose apuntando al repositorio.
- Variables de entorno configuradas: `DB_PASSWORD`, `JWT_SECRET`
  (no se suben al repo, solo se documenta que existen).
- Dominio público asignado únicamente al servicio `frontend` (puerto 80).

**Capturas:**

| Verificación                          | Captura                                    |
|-----------------------------------------|-----------------------------------------------|
| Landing cargando en la URL pública       | `capturas-deploy/landing-prod.png`            |
| `/login` autenticando (token recibido)   | `capturas-deploy/login-prod.png`              |
| Admin modificando datos vía `/api/*`     | `capturas-deploy/admin-crud-prod.png`         |
| `/docs` (Swagger) accesible               | `capturas-deploy/docs-swagger-prod.png`       |
| Configuración del recurso en Coolify      | `capturas-deploy/coolify-config.png`          |

---

## 4. Notas finales

<Cualquier decisión, problema encontrado o pendiente que quieras dejar registrado.>
