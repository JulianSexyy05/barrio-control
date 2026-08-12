import "dotenv/config";

export const PORT = process.env.PORT || 3001;
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
export const JWT_SECRET = process.env.JWT_SECRET || "cuentas-control-secret-dev";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
