import { Router } from "express";
import * as movimientoController from "../controllers/movimientoController.js";
import { authMiddleware, authorizeRoles } from "../middlewares/authMiddleware.js";
import { crearMovimientoValidators, actualizarMovimientoValidators, movimientoIdValidators, listarMovimientoValidators } from "../validators/movimientoValidators.js";

const router = Router();

router.use(authMiddleware);

router.get("/", listarMovimientoValidators, movimientoController.listar);
router.post("/", authorizeRoles("ADMIN", "EDITOR"), crearMovimientoValidators, movimientoController.crear);
router.put("/:id", authorizeRoles("ADMIN", "EDITOR"), actualizarMovimientoValidators, movimientoController.actualizar);
router.delete("/:id", authorizeRoles("ADMIN", "EDITOR"), movimientoIdValidators, movimientoController.eliminar);
router.get("/saldo", movimientoController.saldo);
router.get("/resumen", movimientoController.resumen);
router.get("/:id", movimientoIdValidators, movimientoController.obtener);

export default router;
