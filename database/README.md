# Base de datos

Este directorio contiene recursos relacionados con la base de datos de CuentasControl.

- El **schema** oficial vive en `../backend/prisma/schema.prisma`.
- Las **migraciones** están en `../backend/prisma/migrations/`.
- Para la documentación de modelos, enums y comandos, ver [`../docs/base-de-datos.md`](../docs/base-de-datos.md).

## Comandos

```bash
cd ../backend
npm run db:migrate   # aplicar/crear migraciones
npm run db:seed      # sembrar usuarios iniciales
npm run db:studio    # explorar la base con Prisma Studio
```
