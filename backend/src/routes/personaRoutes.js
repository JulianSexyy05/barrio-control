import { Router } from "express";
import * as personaController from "../controllers/personaController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", personaController.listar);
router.post("/", personaController.crear);
router.put("/:id", personaController.actualizar);
router.delete("/:id", personaController.eliminar);

export default router;
