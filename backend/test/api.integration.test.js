import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import request from "supertest";
import { createPrismaMock } from "./helpers/prismaMock.js";

const mocks = createPrismaMock();

process.env.VERCEL = "1";

const { default: app } = await import("../src/server.js");
const { JWT_SECRET } = await import("../src/config/env.js");

function tokenFor(rol) {
  return jwt.sign({ id: 1, nombre: "Test", correo: "test@x.com", rol, cuenta: "Mi Cuenta" }, JWT_SECRET);
}

beforeEach(() => {
  for (const model of Object.values(mocks)) {
    for (const fn of Object.values(model)) fn.mock.resetCalls();
  }
});

test("GET /api/usuarios exige autenticación", async () => {
  const res = await request(app).get("/api/usuarios");
  assert.equal(res.status, 401);
});

test("GET /api/usuarios bloquea a CONSULTA con 403", async () => {
  const res = await request(app).get("/api/usuarios").set("Authorization", `Bearer ${tokenFor("CONSULTA")}`);
  assert.equal(res.status, 403);
});

test("GET /api/usuarios permite ADMIN", async () => {
  mocks.usuario.findMany.mock.mockImplementation(() => [
    { id: 1, nombre: "Admin", correo: "admin@x.com", rol: "ADMIN", cuenta: null, creadoEn: new Date() },
  ]);

  const res = await request(app).get("/api/usuarios").set("Authorization", `Bearer ${tokenFor("ADMIN")}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.length, 1);
  assert.equal(mocks.usuario.findMany.mock.callCount(), 1);
});

test("POST /api/usuarios permite ADMIN crear con rol", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => null);
  mocks.usuario.create.mock.mockImplementation(({ data }) => ({
    id: 2,
    nombre: data.nombre,
    correo: data.correo,
    rol: data.rol,
    cuenta: data.cuenta,
    creadoEn: new Date(),
  }));

  const res = await request(app)
    .post("/api/usuarios")
    .set("Authorization", `Bearer ${tokenFor("ADMIN")}`)
    .send({ nombre: "Nuevo", correo: "nuevo@x.com", password: "123456", rol: "CONSULTA" });

  assert.equal(res.status, 201);
  assert.equal(res.body.rol, "CONSULTA");
});

test("PUT /api/usuarios/:id/rol cambia el rol (ADMIN)", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => ({ id: 2 }));
  mocks.usuario.update.mock.mockImplementation(({ data }) => ({ id: 2, rol: data.rol }));

  const res = await request(app)
    .put("/api/usuarios/2/rol")
    .set("Authorization", `Bearer ${tokenFor("ADMIN")}`)
    .send({ rol: "EDITOR" });

  assert.equal(res.status, 200);
  assert.equal(res.body.rol, "EDITOR");
});

test("POST /api/personas bloquea a CONSULTA", async () => {
  const res = await request(app)
    .post("/api/personas")
    .set("Authorization", `Bearer ${tokenFor("CONSULTA")}`)
    .send({ nombre: "Juan" });

  assert.equal(res.status, 403);
});

test("POST /api/personas permite EDITOR y valida nombre", async () => {
  mocks.persona.create.mock.mockImplementation(({ data }) => ({ id: 1, ...data }));

  const ok = await request(app)
    .post("/api/personas")
    .set("Authorization", `Bearer ${tokenFor("EDITOR")}`)
    .send({ nombre: "Juan" });
  assert.equal(ok.status, 201);

  const bad = await request(app)
    .post("/api/personas")
    .set("Authorization", `Bearer ${tokenFor("EDITOR")}`)
    .send({ nombre: "" });
  assert.equal(bad.status, 400);
  assert.equal(bad.body.error, "VALIDATION_ERROR");
});

test("GET /api/personas/:id existe para usuario autenticado", async () => {
  mocks.persona.findUnique.mock.mockImplementation(() => ({ id: 1, usuarioId: 1, movimientos: [] }));

  const res = await request(app).get("/api/personas/1").set("Authorization", `Bearer ${tokenFor("EDITOR")}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.id, 1);
});

test("POST /api/movimientos valida valor y tipo", async () => {
  const res = await request(app)
    .post("/api/movimientos")
    .set("Authorization", `Bearer ${tokenFor("EDITOR")}`)
    .send({ fecha: "2026-08-01", tipo: "INGRESO", concepto: "Cuota", valor: -5 });

  assert.equal(res.status, 400);
  assert.equal(res.body.error, "VALIDATION_ERROR");
});

test("POST /api/movimientos permite EDITOR", async () => {
  mocks.movimiento.findFirst.mock.mockImplementation(() => ({ saldo: "0" }));
  mocks.movimiento.create.mock.mockImplementation(({ data }) => ({ id: 1, ...data }));

  const res = await request(app)
    .post("/api/movimientos")
    .set("Authorization", `Bearer ${tokenFor("EDITOR")}`)
    .send({ fecha: "2026-08-01", tipo: "INGRESO", concepto: "Cuota", valor: 100 });

  assert.equal(res.status, 201);
  assert.equal(Number(res.body.saldo), 100);
});

test("POST /api/auth/register rechaza rol ADMIN", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ nombre: "X", correo: "x@x.com", password: "123456", rol: "ADMIN" });

  assert.equal(res.status, 400);
  assert.equal(res.body.error, "VALIDATION_ERROR");
});

test("GET /api/auth/me devuelve el usuario del token", async () => {
  const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${tokenFor("EDITOR")}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.usuario.id, 1);
  assert.equal(res.body.usuario.rol, "EDITOR");
});

test("DELETE /api/usuarios/:id impide eliminar la propia cuenta", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => ({ id: 1 }));

  const res = await request(app)
    .delete("/api/usuarios/1")
    .set("Authorization", `Bearer ${tokenFor("ADMIN")}`);
  assert.equal(res.status, 400);
  assert.equal(res.body.error, "SELF_DELETE");
  assert.equal(mocks.usuario.delete.mock.callCount(), 0);
});

test("DELETE /api/usuarios/:id permite a ADMIN eliminar a otro usuario", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => ({ id: 2 }));
  mocks.usuario.delete.mock.mockImplementation(() => ({}));

  const res = await request(app)
    .delete("/api/usuarios/2")
    .set("Authorization", `Bearer ${tokenFor("ADMIN")}`);
  assert.equal(res.status, 200);
  assert.equal(mocks.usuario.delete.mock.callCount(), 1);
});

test("GET /api/movimientos/saldo devuelve el saldo actual", async () => {
  mocks.movimiento.findFirst.mock.mockImplementation(() => ({ saldo: "450.5" }));

  const res = await request(app).get("/api/movimientos/saldo").set("Authorization", `Bearer ${tokenFor("EDITOR")}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.saldo, 450.5);
});

test("GET /api/movimientos/resumen agrega ingresos y egresos del mes", async () => {
  mocks.movimiento.aggregate.mock.mockImplementation(({ _sum }) => ({ _sum: { valor: _sum?.valor ? "1200" : "350" } }));
  mocks.movimiento.count.mock.mockImplementation(() => 4);
  mocks.movimiento.findFirst.mock.mockImplementation(() => ({ saldo: "850" }));

  const res = await request(app).get("/api/movimientos/resumen").set("Authorization", `Bearer ${tokenFor("EDITOR")}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.saldoActual, 850);
  assert.equal(res.body.movimientosMes, 4);
});

test("GET /api/movimientos lista paginado y con total", async () => {
  mocks.movimiento.findMany.mock.mockImplementation(() => [
    { id: 1, concepto: "A", tipo: "INGRESO", valor: "10", saldo: "10", fecha: new Date(), persona: null },
  ]);
  mocks.movimiento.count.mock.mockImplementation(() => 1);

  const res = await request(app).get("/api/movimientos?page=1&limit=5").set("Authorization", `Bearer ${tokenFor("EDITOR")}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.movimientos.length, 1);
  assert.equal(res.body.total, 1);
  assert.equal(res.body.totalPages, 1);
});

test("GET /api/reportes/pdf genera un PDF", async () => {
  mocks.movimiento.findMany.mock.mockImplementation(() => []);
  mocks.usuario.findUnique.mock.mockImplementation(() => ({ id: 1, nombre: "Ana", cuenta: "Barrio Norte" }));

  const res = await request(app).get("/api/reportes/pdf").set("Authorization", `Bearer ${tokenFor("EDITOR")}`);
  assert.equal(res.status, 200);
  assert.match(res.headers["content-type"], /application\/pdf/);
  assert.ok(Buffer.isBuffer(res.body));
  assert.ok(res.body.length > 100);
  assert.ok(res.body.subarray(0, 5).toString("latin1") === "%PDF-");
});

test("GET /api/health responde ok", async () => {
  const res = await request(app).get("/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
});
