# API REST

Base URL: `http://localhost:3001/api` (o la URL del deploy en Vercel).

Autenticación: header `Authorization: Bearer <token>`.

## Códigos de error

| HTTP | `error` | Descripción |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Input inválido; `details` lista los campos fallidos. |
| 401 | `UNAUTHORIZED` | Token faltante o inválido. |
| 403 | `FORBIDDEN` | Rol sin permisos, o recurso de otro usuario. |
| 404 | `NOT_FOUND` | Recurso inexistente. |
| 409 | `DUPLICATE` / `EMAIL_EXISTS` | Valor duplicado (correo). |

## Autenticación

### POST `/auth/register`
Registro público. El rol solo puede ser `EDITOR` o `CONSULTA` (se ignora `ADMIN`). Por defecto `EDITOR`.
```json
{ "nombre": "Ana", "correo": "ana@correo.com", "password": "123456", "cuenta": "Cuenta general" }
```
Respuesta: `{ "usuario": {...}, "token": "..." }`

### POST `/auth/login`
```json
{ "correo": "ana@correo.com", "password": "123456" }
```
Respuesta: `{ "usuario": {...}, "token": "..." }`

### GET `/auth/me`
Devuelve el usuario del token.

## Personas  (auth)

| Método | Ruta | Rol | Descripción |
| --- | --- | --- | --- |
| GET | `/personas` | todos | Lista personas del usuario; `?search=` filtra por nombre/casa. |
| GET | `/personas/:id` | todos | Detalle de persona (incluye movimientos). |
| POST | `/personas` | ADMIN, EDITOR | Crea persona (`nombre` obligatorio). |
| PUT | `/personas/:id` | ADMIN, EDITOR | Actualiza persona. |
| DELETE | `/personas/:id` | ADMIN, EDITOR | Elimina persona. |

## Movimientos  (auth)

| Método | Ruta | Rol | Descripción |
| --- | --- | --- | --- |
| GET | `/movimientos` | todos | Lista paginada (`page`, `limit`) con filtros `tipo`, `fechaDesde`, `fechaHasta`, `search`. |
| GET | `/movimientos/saldo` | todos | `{ "saldo": 1234 }` (saldo actual). |
| GET | `/movimientos/resumen` | todos | Resumen mensual (saldo, ingresos, egresos, cantidad). |
| GET | `/movimientos/:id` | todos | Detalle de movimiento. |
| POST | `/movimientos` | ADMIN, EDITOR | Crea movimiento y actualiza saldo. |
| PUT | `/movimientos/:id` | ADMIN, EDITOR | Actualiza y recalcula saldos en cadena. |
| DELETE | `/movimientos/:id` | ADMIN, EDITOR | Elimina y recalcula saldos restantes. |

Body de creación:
```json
{
  "fecha": "2026-08-01",
  "hora": "14:30",
  "tipo": "INGRESO",
  "concepto": "Cuota mensual",
  "valor": 50000,
  "observaciones": "",
  "personaId": null
}
```

## Reportes  (auth)

| Método | Ruta | Rol | Descripción |
| --- | --- | --- | --- |
| GET | `/reportes/pdf` | todos | Genera PDF. Filtros opcionales `fechaDesde` / `fechaHasta`. Nombre del archivo usa la `cuenta` del usuario. |

## Usuarios  (auth, solo ADMIN)

| Método | Ruta | Rol | Descripción |
| --- | --- | --- | --- |
| GET | `/usuarios` | ADMIN | Lista todos los usuarios (sin contraseñas). |
| POST | `/usuarios` | ADMIN | Crea usuario con cualquier rol (`ADMIN`, `EDITOR`, `CONSULTA`). |
| PUT | `/usuarios/:id/rol` | ADMIN | Cambia el rol de un usuario. |
| DELETE | `/usuarios/:id` | ADMIN | Elimina un usuario (no a sí mismo). |

## Salud

### GET `/health`
```json
{ "ok": true, "service": "cuentas-control-backend" }
```
