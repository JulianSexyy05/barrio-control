import express from "express";
import "dotenv/config";
import cors from "cors";
import { PORT, FRONTEND_URL } from "./config/env.js";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(cors({
  origin: [FRONTEND_URL, "https://frontend-ten-ashen-38.vercel.app", "http://192.168.80.18:5173", "http://192.168.80.18:3001"],
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "barrio-control-backend" });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ error: "NOT_FOUND", message: "Ruta no encontrada." });
});

app.use(errorMiddleware);

export default app;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`BarrioControl backend running on http://localhost:${PORT}`);
  });
}
