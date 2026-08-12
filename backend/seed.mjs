import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin123";
const hashedAdmin = await bcrypt.hash(ADMIN_PASSWORD, 10);

const admin = await prisma.usuario.upsert({
  where: { correo: "admin@cuentas.com" },
  update: { rol: "ADMIN", password: hashedAdmin },
  create: {
    nombre: "Administrador",
    correo: "admin@cuentas.com",
    password: hashedAdmin,
    rol: "ADMIN",
    cuenta: "Cuenta general",
  },
});

const hashedEditor = await bcrypt.hash(process.env.SEED_EDITOR_PASSWORD || "editor123", 10);
const editor = await prisma.usuario.upsert({
  where: { correo: "editor@cuentas.com" },
  update: {},
  create: {
    nombre: "Editor",
    correo: "editor@cuentas.com",
    password: hashedEditor,
    rol: "EDITOR",
    cuenta: "Cuenta general",
  },
});

console.log("Seed OK - Admin:", admin.id, "| Editor:", editor.id);
await prisma.$disconnect();
