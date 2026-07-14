import { Router } from "express";
import authRoutes from "./authRoutes.js";
import movimientoRoutes from "./movimientoRoutes.js";
import personaRoutes from "./personaRoutes.js";
import reporteRoutes from "./reporteRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/movimientos", movimientoRoutes);
router.use("/personas", personaRoutes);
router.use("/reportes", reporteRoutes);

export default router;
