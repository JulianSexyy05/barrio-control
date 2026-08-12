import { test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { authMiddleware, authorizeRoles } from "../src/middlewares/authMiddleware.js";
import { JWT_SECRET } from "../src/config/env.js";

function makeRes() {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
}

function makeReq(token) {
  const req = {};
  if (token) req.headers = { authorization: `Bearer ${token}` };
  else req.headers = {};
  return req;
}

test("authMiddleware exige token", () => {
  const req = makeReq(null);
  const res = makeRes();
  authMiddleware(req, res, () => {});
  assert.equal(res.statusCode, 401);
});

test("authMiddleware rechaza token inválido", () => {
  const req = makeReq("token-basura");
  const res = makeRes();
  authMiddleware(req, res, () => {});
  assert.equal(res.statusCode, 401);
});

test("authMiddleware inyecta usuario con token válido", () => {
  const token = jwt.sign({ id: 1, rol: "EDITOR" }, JWT_SECRET);
  const req = makeReq(token);
  const res = makeRes();
  let nextCalled = false;
  authMiddleware(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(req.usuario.id, 1);
});

test("authorizeRoles permite roles incluidos", () => {
  const req = { usuario: { rol: "ADMIN" } };
  const res = makeRes();
  let nextCalled = false;
  authorizeRoles("ADMIN", "EDITOR")(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});

test("authorizeRoles bloquea roles no incluidos con 403", () => {
  const req = { usuario: { rol: "CONSULTA" } };
  const res = makeRes();
  authorizeRoles("ADMIN", "EDITOR")(req, res, () => {});
  assert.equal(res.statusCode, 403);
});

test("authorizeRoles exige usuario autenticado", () => {
  const req = {};
  const res = makeRes();
  authorizeRoles("ADMIN")(req, res, () => {});
  assert.equal(res.statusCode, 401);
});
