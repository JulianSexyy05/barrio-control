import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createPrismaMock } from "./helpers/prismaMock.js";

const mocks = createPrismaMock();

const movimientoService = await import("../src/services/movimientoService.js");

beforeEach(() => {
  for (const model of Object.values(mocks)) {
    for (const fn of Object.values(model)) fn.mock.resetCalls();
  }
});

test("crear ingreso suma al saldo anterior", async () => {
  mocks.movimiento.findFirst.mock.mockImplementation(() => ({ saldo: "1000.00" }));
  mocks.movimiento.create.mock.mockImplementation(({ data }) => ({ id: 1, ...data }));

  const res = await movimientoService.crear({
    fecha: "2026-08-01",
    tipo: "INGRESO",
    concepto: "Cuota",
    valor: "500",
    usuarioId: 1,
  });

  assert.equal(Number(res.saldo), 1500);
});

test("crear egreso resta al saldo anterior", async () => {
  mocks.movimiento.findFirst.mock.mockImplementation(() => ({ saldo: "1000.00" }));
  mocks.movimiento.create.mock.mockImplementation(({ data }) => ({ id: 2, ...data }));

  const res = await movimientoService.crear({
    fecha: "2026-08-02",
    tipo: "EGRESO",
    concepto: "Mercado",
    valor: "300",
    usuarioId: 1,
  });

  assert.equal(Number(res.saldo), 700);
});

test("crear usa saldo 0 si no hay movimientos previos", async () => {
  mocks.movimiento.findFirst.mock.mockImplementation(() => null);
  mocks.movimiento.create.mock.mockImplementation(({ data }) => ({ id: 3, ...data }));

  const res = await movimientoService.crear({
    fecha: "2026-08-03",
    tipo: "EGRESO",
    concepto: "Aseo",
    valor: "100",
    usuarioId: 1,
  });

  assert.equal(Number(res.saldo), -100);
});

test("listar aplica filtros y paginación", async () => {
  mocks.movimiento.findMany.mock.mockImplementation(() => []);
  mocks.movimiento.count.mock.mockImplementation(() => 5);

  const res = await movimientoService.listar({ usuarioId: 1, tipo: "INGRESO", page: 2, limit: 20 });

  const args = mocks.movimiento.findMany.mock.calls[0].arguments[0];
  assert.equal(args.skip, 20);
  assert.equal(args.take, 20);
  assert.equal(args.where.usuarioId, 1);
  assert.equal(args.where.tipo, "INGRESO");
  assert.equal(res.totalPages, 1);
});

test("obtener lanza 404 si no existe", async () => {
  mocks.movimiento.findUnique.mock.mockImplementation(() => null);

  await assert.rejects(
    () => movimientoService.obtener(999, 1),
    (err) => err.status === 404
  );
});

test("obtener lanza 403 si es de otro usuario", async () => {
  mocks.movimiento.findUnique.mock.mockImplementation(() => ({ id: 5, usuarioId: 99 }));

  await assert.rejects(
    () => movimientoService.obtener(5, 1),
    (err) => err.status === 403
  );
});

test("actualizar recalcula saldos en cadena", async () => {
  mocks.movimiento.findUnique.mock.mockImplementation(() => ({ id: 5, usuarioId: 1 }));
  mocks.movimiento.update.mock.mockImplementation(() => ({}));
  mocks.movimiento.findMany.mock.mockImplementation(() => []);
  mocks.movimiento.findFirst.mock.mockImplementation(() => ({ saldo: "0" }));

  await movimientoService.actualizar(5, { concepto: "Cambiado" }, 1);

  assert.ok(mocks.movimiento.update.mock.calls.length >= 1);
});

test("eliminar recalcula saldos restantes", async () => {
  mocks.movimiento.findUnique.mock.mockImplementation(() => ({ id: 5, usuarioId: 1 }));
  mocks.movimiento.delete.mock.mockImplementation(() => ({}));
  mocks.movimiento.findMany.mock.mockImplementation(() => []);
  mocks.movimiento.findFirst.mock.mockImplementation(() => null);

  await movimientoService.eliminar(5, 1);

  assert.equal(mocks.movimiento.delete.mock.callCount(), 1);
  assert.ok(mocks.movimiento.findMany.mock.callCount() >= 1);
});
