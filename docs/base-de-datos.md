# Base de datos

PostgreSQL gestionada con Prisma 7. Schema en `backend/prisma/schema.prisma`, migraciones en `backend/prisma/migrations/`.

## Modelos

### `Usuario` → tabla `usuarios`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | Int | PK autoincrement |
| `nombre` | String | |
| `correo` | String | Único |
| `password` | String | Hash bcrypt |
| `rol` | `Rol` | `ADMIN` / `EDITOR` (default) / `CONSULTA` |
| `cuenta` | String? | Nombre de la cuenta |
| `creadoEn` | DateTime | `creado_en` |

### `Persona` → tabla `personas`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | Int | PK |
| `nombre` | String | |
| `casa` | String? | Dirección / casa |
| `telefono` | String? | |
| `observaciones` | String? | |
| `usuarioId` | Int? | FK → `usuarios` (aislamiento por usuario) |

### `Movimiento` → tabla `movimientos`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | Int | PK |
| `fecha` | DateTime | |
| `hora` | String? | HH:MM |
| `tipo` | `TipoMovimiento` | `INGRESO` / `EGRESO` |
| `concepto` | String | |
| `valor` | Decimal(12,2) | |
| `saldo` | Decimal(12,2)? | Saldo corrido |
| `observaciones` | String? | |
| `personaId` | Int? | FK → `personas` |
| `usuarioId` | Int | FK → `usuarios` (obligatorio) |

## Enums

- `Rol`: `ADMIN`, `EDITOR`, `CONSULTA`
- `TipoMovimiento`: `INGRESO`, `EGRESO`

## Migraciones y seed

```bash
npm run db:migrate   # prisma migrate dev  (crea/aplica migraciones)
npm run db:push      # prisma db push      (sincroniza sin historial)
npm run db:seed      # node seed.mjs       (usuarios iniciales)
npm run db:studio    # prisma studio
```

El seed (`backend/seed.mjs`) crea o actualiza:
- `admin@cuentas.com` → rol `ADMIN`, contraseña `admin123` (configurable con `SEED_ADMIN_PASSWORD`).
- `editor@cuentas.com` → rol `EDITOR`, contraseña `editor123` (configurable con `SEED_EDITOR_PASSWORD`).

## Aislamiento por usuario

`Persona` y `Movimiento` pertenecen a un `usuarioId`. Todos los services verifican la pertenencia del recurso antes de devolver o modificar datos; ante un recurso de otro usuario responden `403`.
