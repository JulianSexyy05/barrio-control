import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import { createPrismaMock } from "./helpers/prismaMock.js";

const mocks = createPrismaMock();

const { register, login } = await import("../src/services/authService.js");

beforeEach(() => {
  for (const model of Object.values(mocks)) {
    for (const fn of Object.values(model)) fn.mock.resetCalls();
  }
});

test("register normaliza el correo y devuelve usuario + token", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => null);
  mocks.usuario.create.mock.mockImplementation(({ data }) => ({
    id: 1,
    nombre: data.nombre,
    correo: data.correo,
    rol: data.rol,
    cuenta: data.cuenta,
    creadoEn: new Date(),
  }));

  const res = await register({ nombre: "Ana", correo: " Ana@X.com ", password: "123456", rol: "EDITOR", cuenta: "B1" });

  assert.equal(res.usuario.correo, "ana@x.com");
  assert.equal(mocks.usuario.create.mock.calls[0].arguments[0].data.correo, "ana@x.com");
  assert.ok(res.token);
});

test("register usa rol EDITOR por defecto", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => null);
  mocks.usuario.create.mock.mockImplementation(({ data }) => ({ id: 2, nombre: data.nombre, correo: data.correo, rol: data.rol, cuenta: data.cuenta, creadoEn: new Date() }));

  const res = await register({ nombre: "B", correo: "b@x.com", password: "123456" });

  assert.equal(res.usuario.rol, "EDITOR");
  assert.notEqual(mocks.usuario.create.mock.calls[0].arguments[0].data.password, "123456");
  assert.ok(mocks.usuario.create.mock.calls[0].arguments[0].data.password.startsWith("$2b$"));
});

test("register rechaza correo duplicado con 409", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => ({ id: 9 }));

  await assert.rejects(
    () => register({ nombre: "C", correo: "c@x.com", password: "123456" }),
    (err) => err.status === 409 && err.code === "EMAIL_EXISTS"
  );
  assert.equal(mocks.usuario.create.mock.callCount(), 0);
});

test("login valida contraseña y devuelve token", async () => {
  const hash = await bcrypt.hash("secreto123", 4);
  mocks.usuario.findUnique.mock.mockImplementation(() => ({
    id: 1,
    nombre: "Ana",
    correo: "ana@x.com",
    rol: "EDITOR",
    cuenta: null,
    password: hash,
  }));

  const res = await login({ correo: " ANA@x.com ", password: "secreto123" });

  assert.equal(res.usuario.correo, "ana@x.com");
  assert.ok(res.token);
});

test("login rechaza contraseña incorrecta con 401", async () => {
  const hash = await bcrypt.hash("secreto123", 4);
  mocks.usuario.findUnique.mock.mockImplementation(() => ({
    id: 1,
    nombre: "Ana",
    correo: "ana@x.com",
    rol: "EDITOR",
    cuenta: null,
    password: hash,
  }));

  await assert.rejects(
    () => login({ correo: "ana@x.com", password: "incorrecta" }),
    (err) => err.status === 401 && err.code === "INVALID_CREDENTIALS"
  );
});

test("login rechaza usuario inexistente con 401", async () => {
  mocks.usuario.findUnique.mock.mockImplementation(() => null);

  await assert.rejects(
    () => login({ correo: "nadie@x.com", password: "cualquiera" }),
    (err) => err.status === 401
  );
});

