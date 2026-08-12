# CuentasControl

Sistema genérico de control de cuentas. Permite registrar ingresos y egresos, llevar el saldo automáticamente, gestionar personas asociadas y generar reportes en PDF.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19 + Vite 8 + Tailwind 4 + React Router 7 + PWA |
| Backend | Express 5 + Prisma 7 + PostgreSQL + JWT + PDFKit |
| Deploy | Vercel (backend serverless + frontend estático) |

## Estructura

```
backend/    API REST (Express + Prisma)
frontend/   App web (React + Vite + PWA)
docs/       Documentación técnica
database/   Recursos de base de datos
```

## Roles

- **ADMIN**: acceso total, incluida la administración de usuarios (crear, cambiar rol, eliminar).
- **EDITOR**: gestiona movimientos y personas (crear, editar, eliminar).
- **CONSULTA**: solo lectura (dashboard, movimientos, personas, reportes).

El registro público solo permite crear cuentas EDITOR o CONSULTA; los usuarios ADMIN los crea un administrador existente.

## Inicio rápido

### Backend

```bash
cd backend
cp .env.example .env   # completa DATABASE_URL, JWT_SECRET, etc.
npm install
npm run db:migrate     # aplica migraciones (o npm run db:push)
npm run db:seed        # crea admin@cuentas.com / admin123 y editor@cuentas.com / editor123
npm run dev            # http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

Variables de entorno del frontend (`frontend/.env`):

```
VITE_API_URL=http://localhost:3001/api
```

## Scripts útiles

```bash
# Backend
npm test               # suite de tests (node:test + supertest con Prisma mockeado)
npm run db:migrate     # crear/aplicar migraciones de Prisma
npm run db:push        # sincronizar schema sin migraciones
npm run db:seed        # sembrar usuarios iniciales
npm run db:studio      # abrir Prisma Studio

# Frontend
npm run lint
npm run build
```

## Documentación

- [Arquitectura](docs/arquitectura.md)
- [API REST](docs/api.md)
- [Base de datos](docs/base-de-datos.md)

## Despliegue

Ambos proyectos están vinculados a Vercel. En cada deploy se ejecuta `prisma generate` para el backend y `vite build` para el frontend. Ver `backend/vercel.json` y `frontend/vercel.json`.
