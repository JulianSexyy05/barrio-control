import { Router } from "express";
import * as usuarioController from "../controllers/usuarioController.js";
import { authMiddleware, authorizeRoles } from "../middlewares/authMiddleware.js";
import { crearUsuarioValidators, cambiarRolValidators, usuarioIdValidators } from "../validators/usuarioValidators.js";

const router = Router();

router.use(authMiddleware, authorizeRoles("ADMIN"));

router.get("/", usuarioController.listar);
router.post("/", crearUsuarioValidators, usuarioController.crear);
router.put("/:id/rol", cambiarRolValidators, usuarioController.cambiarRol);
router.delete("/:id", usuarioIdValidators, usuarioController.eliminar);

export default router;
