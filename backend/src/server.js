import express from "express";
import "dotenv/config";
import { generateProjectAnswer } from "./services/aiService.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "kamilo-atlas-backend" });
});

app.post("/api/projects/:projectId/chat", async (req, res) => {
  const { projectId } = req.params;
  const { question, context, history } = req.body ?? {};

  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({
      error: "QUESTION_REQUIRED",
      message: "La pregunta es obligatoria.",
    });
  }

  try {
    const answer = await generateProjectAnswer({
      question: question.trim(),
      context,
      history,
    });

    res.json({
      projectId,
      answer,
      received: {
        question: question.trim(),
        contextSummary: {
          projectName: context?.name ?? null,
          notes: Array.isArray(context?.notas) ? context.notas.length : 0,
          links: Array.isArray(context?.links) ? context.links.length : 0,
          files: Array.isArray(context?.archivos) ? context.archivos.length : 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "AI_REQUEST_FAILED",
      message: error.message || "No se pudo generar la respuesta de IA.",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Ruta no encontrada.",
  });
});

app.listen(PORT, () => {
  console.log(`Kamilo Atlas backend running on http://localhost:${PORT}`);
});
