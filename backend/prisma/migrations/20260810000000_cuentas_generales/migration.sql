-- Renombrar la columna "barrio" a "cuenta" en usuarios
ALTER TABLE "usuarios" RENAME COLUMN "barrio" TO "cuenta";

-- Renombrar el valor del enum "Rol": TESORERO -> EDITOR
ALTER TYPE "Rol" RENAME VALUE 'TESORERO' TO 'EDITOR';