import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const hash = "$2b$10$Q.rPPNj2TfULuju7ZhQ/r.OikHqPX91by03bPDIf/4ccA6CsTWUdu";

const u = await prisma.usuario.upsert({
  where: { correo: "admin@barrio.com" },
  update: {},
  create: {
    nombre: "Admin Barrio",
    correo: "admin@barrio.com",
    password: hash,
    rol: "TESORERO",
  },
});

console.log("Usuario OK:", u.id);
await prisma.$disconnect();
