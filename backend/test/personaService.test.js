import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createPrismaMock } from "./helpers/prismaMock.js";

const mocks = createPrismaMock();

const personaService = await import("../src/services/personaService.js");

beforeEach(() => {
  for (const model of Object.values(mocks)) {
    for (const fn of Object.values(model)) fn.mock.resetCalls();
  }
});

test("crear limpia espacios y convierte vacíos a null", async () => {
  mocks.persona.create.mock.mockImplementation(({ data }) => ({ id: 1, ...data }));

  const res = await personaService.crear({ nombre: "  Juan  ", casa: "  ", telefono: "", observaciones: "  ok  ", usuarioId: 1 });

  assert.equal(res.nombre, "Juan");
  assert.equal(res.casa, null);
  assert.equal(res.telefono, null);
  assert.equal(res.observaciones, "ok");
});

test("listar filtra por búsqueda con mode insensitive", async () => {
  mocks.persona.findMany.mock.mockImplementation(() => []);

  await personaService.listar({ search: "juan", usuarioId: 1 });

  const where = mocks.persona.findMany.mock.calls[0].arguments[0].where;
  assert.equal(where.usuarioId, 1);
  assert.equal(where.OR[0].nombre.mode, "insensitive");
});

test("actualizar lanza 403 si la persona es de otro usuario", async () => {
  mocks.persona.findUnique.mock.mockImplementation(() => ({ id: 5, usuarioId: 99 }));

  await assert.rejects(
    () => personaService.actualizar(5, { nombre: "X" }, 1),
    (err) => err.status === 403 && err.code === "FORBIDDEN"
  );
});

test("actualizar lanza 404 si no existe", async () => {
  mocks.persona.findUnique.mock.mockImplementation(() => null);

  await assert.rejects(
    () => personaService.actualizar(999, { nombre: "X" }, 1),
    (err) => err.status === 404 && err.code === "NOT_FOUND"
  );
});

test("actualizar modifica solo los campos enviados", async () => {
  mocks.persona.findUnique.mock.mockImplementation(() => ({ id: 5, usuarioId: 1 }));
  mocks.persona.update.mock.mockImplementation(({ data }) => ({ id: 5, ...data }));

  const res = await personaService.actualizar(5, { telefono: "300123" }, 1);

  assert.equal(res.telefono, "300123");
  assert.equal(mocks.persona.update.mock.calls[0].arguments[0].data.nombre, undefined);
});

test("obtener lanza 403 para persona ajena", async () => {
  mocks.persona.findUnique.mock.mockImplementation(() => ({ id: 5, usuarioId: 99 }));

  await assert.rejects(
    () => personaService.obtener(5, 1),
    (err) => err.status === 403
  );
});

test("eliminar valida pertenencia antes de borrar", async () => {
  mocks.persona.findUnique.mock.mockImplementation(() => ({ id: 5, usuarioId: 1 }));
  mocks.persona.delete.mock.mockImplementation(() => ({}));

  await personaService.eliminar(5, 1);
  assert.equal(mocks.persona.delete.mock.callCount(), 1);
});
