import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createPrismaMock } from "./helpers/prismaMock.js";

const mocks = createPrismaMock();

const usuarioService = await import("../src/services/usuarioService.js");

beforeEach(() => {
  for (const model of Object.values(mocks)) {
    for (const fn of Object.values(model)) fn.mock.resetCalls();
  }
});

test("crear normaliza el correo y hashea la contraseña", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => null);
  mocks.usuario.create.mock.mockImplementation(({ data }) => ({
    id: 1,
    nombre: data.nombre,
    correo: data.correo,
    rol: data.rol,
    cuenta: data.cuenta,
    creadoEn: new Date(),
  }));

  const res = await usuarioService.crear({ nombre: "Nuevo", correo: " Nuevo@X.com ", password: "123456", rol: "CONSULTA", cuenta: "B1" });

  assert.equal(res.correo, "nuevo@x.com");
  const createArgs = mocks.usuario.create.mock.calls[0].arguments[0].data;
  assert.equal(createArgs.correo, "nuevo@x.com");
  assert.equal(createArgs.rol, "CONSULTA");
  assert.notEqual(createArgs.password, "123456");
  assert.ok(createArgs.password.startsWith("$2b$"));
});

test("crear rechaza correo duplicado con 409", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => ({ id: 9 }));

  await assert.rejects(
    () => usuarioService.crear({ nombre: "X", correo: "x@x.com", password: "123456", rol: "EDITOR" }),
    (err) => err.status === 409 && err.code === "EMAIL_EXISTS"
  );
  assert.equal(mocks.usuario.create.mock.callCount(), 0);
});

test("cambiarRol lanza 404 si el usuario no existe", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => null);

  await assert.rejects(
    () => usuarioService.cambiarRol(999, "EDITOR"),
    (err) => err.status === 404 && err.code === "NOT_FOUND"
  );
  assert.equal(mocks.usuario.update.mock.callCount(), 0);
});

test("cambiarRol actualiza el rol", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => ({ id: 2 }));
  mocks.usuario.update.mock.mockImplementation(({ data }) => ({ id: 2, rol: data.rol }));

  const res = await usuarioService.cambiarRol(2, "ADMIN");

  assert.equal(res.rol, "ADMIN");
  assert.equal(mocks.usuario.update.mock.calls[0].arguments[0].data.rol, "ADMIN");
});

test("eliminar lanza 400 al intentar eliminar la propia cuenta", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => ({ id: 5 }));

  await assert.rejects(
    () => usuarioService.eliminar(5, 5),
    (err) => err.status === 400 && err.code === "SELF_DELETE"
  );
  assert.equal(mocks.usuario.delete.mock.callCount(), 0);
});

test("eliminar lanza 404 si el usuario no existe", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => null);

  await assert.rejects(
    () => usuarioService.eliminar(999, 1),
    (err) => err.status === 404
  );
  assert.equal(mocks.usuario.delete.mock.callCount(), 0);
});

test("eliminar borra un usuario distinto al solicitante", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => ({ id: 5 }));
  mocks.usuario.delete.mock.mockImplementation(() => ({}));

  await usuarioService.eliminar(5, 1);
  assert.equal(mocks.usuario.delete.mock.callCount(), 1);
  assert.equal(mocks.usuario.delete.mock.calls[0].arguments[0].where.id, 5);
});
