import { mock } from "node:test";

function makeModel() {
  return {
    findUnique: mock.fn(),
    findFirst: mock.fn(),
    findMany: mock.fn(),
    create: mock.fn(),
    update: mock.fn(),
    delete: mock.fn(),
    count: mock.fn(),
    aggregate: mock.fn(),
    upsert: mock.fn(),
  };
}

export function createPrismaMock() {
  const mocks = {
    usuario: makeModel(),
    persona: makeModel(),
    movimiento: makeModel(),
  };

  mock.module("../../src/utils/prisma.js", {
    exports: { prisma: mocks },
  });

  return mocks;
}
