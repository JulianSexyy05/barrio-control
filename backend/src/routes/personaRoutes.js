import { Router } from "express";
import * as personaController from "../controllers/personaController.js";
import { authMiddleware, authorizeRoles } from "../middlewares/authMiddleware.js";
import { crearPersonaValidators, actualizarPersonaValidators, personaIdValidators } from "../validators/personaValidators.js";

const router = Router();

router.use(authMiddleware);

router.get("/", personaController.listar);
router.get("/:id", personaIdValidators, personaController.obtener);
router.post("/", authorizeRoles("ADMIN", "EDITOR"), crearPersonaValidators, personaController.crear);
router.put("/:id", authorizeRoles("ADMIN", "EDITOR"), actualizarPersonaValidators, personaController.actualizar);
router.delete("/:id", authorizeRoles("ADMIN", "EDITOR"), personaIdValidators, personaController.eliminar);

export default router;
