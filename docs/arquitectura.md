# Arquitectura

## Visión general

CuentasControl es una app web dividida en dos proyectos desplegados por separado en Vercel:

- **`frontend/`**: SPA de React (Vite) que consume la API REST.
- **`backend/`**: API REST Express 5 servida como serverless function de Vercel (`api/index.js`).

```
Navegador (React PWA)
      │  HTTPS + JWT (Bearer)
      ▼
Vercel API (Express 5)
      │  Prisma Client
      ▼
PostgreSQL (Prisma + driver pg)
```

## Backend

### Organización

```
backend/src/
├── config/       Variables de entorno (env.js)
├── controllers/  Handlers HTTP (parsean req y delegan en services)
├── services/     Lógica de negocio (reglas de saldo, ownership, auth)
├── middlewares/  authMiddleware (JWT), authorizeRoles, errorMiddleware
├── routes/       Definición de endpoints y sus validaciones
├── validators/   Validación de inputs con express-validator
└── utils/        Instancia compartida de Prisma
```

### Flujo de una petición

1. `authMiddleware` valida el JWT y deja `req.usuario` (id, nombre, correo, rol, cuenta).
2. Los validators de `express-validator` corrigen y validan el body/query; si fallan responden `400 VALIDATION_ERROR`.
3. `authorizeRoles(...)` restringe por rol (ej. `authorizeRoles("ADMIN", "EDITOR")`).
4. El controller delega en el service, que contiene la lógica de negocio y control de propiedad (`usuarioId`).
5. `errorMiddleware` mapea errores a códigos HTTP (`P2002`→409, `P2025`→404, custom `status`/`code`).

### Saldo corrido

Cada `Movimiento` guarda su `saldo` acumulado. Al crear un movimiento se toma el saldo del último registro y se suma (INGRESO) o resta (EGRESO) el valor. Al editar o eliminar, `recalcularSaldos()` recalcula en cascada los saldos posteriores en orden `fecha`+`id`.

## Frontend

```
frontend/src/
├── context/      AuthContext + AuthProvider (sesión, persistencia en localStorage)
├── hooks/        useAuth
├── layouts/      DashboardLayout (sidebar PWA, logout), AuthLayout
├── pages/        Dashboard, Movimientos, Personas, Reportes, Usuarios, Login, Register
├── routes/       AppRoutes con guards PrivateRoute / AdminRoute / PublicRoute
└── services/     Wrappers de axios (api.js agrega el token y maneja 401)
```

### Rutas protegidas

- `PrivateRoute`: cualquier usuario autenticado.
- `AdminRoute`: solo rol `ADMIN` (módulo de Usuarios).
- El sidebar muestra "Usuarios" únicamente a administradores.

### Roles en el frontend

- Los usuarios `CONSULTA` ven solo lectura: se ocultan los botones de crear/editar/eliminar en Movimientos y Personas. La API además rechaza esas operaciones con `403`.
