import { Router } from "express";
import { descargarPDF } from "../controllers/reporteController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/pdf", descargarPDF);

export default router;
