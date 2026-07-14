import { Router } from "express";
import * as movimientoController from "../controllers/movimientoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", movimientoController.listar);
router.post("/", movimientoController.crear);
router.put("/:id", movimientoController.actualizar);
router.delete("/:id", movimientoController.eliminar);
router.get("/saldo", movimientoController.saldo);
router.get("/resumen", movimientoController.resumen);

export default router;
