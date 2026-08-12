import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createPrismaMock } from "./helpers/prismaMock.js";

const mocks = createPrismaMock();

const { generarPDF } = await import("../src/services/reporteService.js");

beforeEach(() => {
  for (const model of Object.values(mocks)) {
    for (const fn of Object.values(model)) fn.mock.resetCalls();
  }
});

test("generarPDF consulta movimientos y usuario, y devuelve un buffer PDF", async () => {
  mocks.movimiento.findMany.mock.mockImplementation(() => [
    { id: 1, tipo: "INGRESO", valor: "100", saldo: "100", concepto: "Cuota", fecha: new Date("2026-08-01"), hora: "14:30", persona: { nombre: "Ana", casa: "1" } },
    { id: 2, tipo: "EGRESO", valor: "30", saldo: "70", concepto: "Mercado", fecha: new Date("2026-08-02"), hora: null, persona: null },
  ]);
  mocks.usuario.findUnique.mock.mockImplementation(() => ({ id: 1, nombre: "Ana", cuenta: "Barrio Norte" }));

  const buffer = await generarPDF(1, {});

  assert.ok(Buffer.isBuffer(buffer));
  assert.ok(buffer.length > 100);
  assert.ok(buffer.subarray(0, 5).toString("latin1") === "%PDF-");

  const where = mocks.movimiento.findMany.mock.calls[0].arguments[0].where;
  assert.equal(where.usuarioId, 1);
  assert.equal(where.fecha, undefined);
});

test("generarPDF aplica filtros de fecha cuando se envían", async () => {
  mocks.movimiento.findMany.mock.mockImplementation(() => []);
  mocks.usuario.findUnique.mock.mockImplementation(() => null);

  await generarPDF(1, { fechaDesde: "2026-08-01", fechaHasta: "2026-08-31" });

  const where = mocks.movimiento.findMany.mock.calls[0].arguments[0].where;
  assert.ok(where.fecha);
  assert.ok(where.fecha.gte instanceof Date);
  assert.ok(where.fecha.lte instanceof Date);
});

test("generarPDF funciona sin movimientos", async () => {
  mocks.movimiento.findMany.mock.mockImplementation(() => []);
  mocks.usuario.findUnique.mock.mockImplementation(() => ({ id: 1, nombre: "Ana", cuenta: null }));

  const buffer = await generarPDF(1, {});

  assert.ok(Buffer.isBuffer(buffer));
  assert.ok(buffer.subarray(0, 5).toString("latin1") === "%PDF-");
});
