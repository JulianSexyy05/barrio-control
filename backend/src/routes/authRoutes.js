import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { registerValidators, loginValidators } from "../validators/authValidators.js";

const router = Router();

router.post("/register", registerValidators, authController.register);
router.post("/login", loginValidators, authController.login);
router.get("/me", authMiddleware, authController.me);

export default router;
