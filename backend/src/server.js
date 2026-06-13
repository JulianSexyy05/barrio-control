import express from "express";
import "dotenv/config";
import { generateProjectAnswer } from "./services/aiService.js";
import { verifyFirebaseToken, isFirebaseReady, db } from "./services/firebaseAdmin.js";

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

async function authMiddleware(req, res, next) {
  if (!isFirebaseReady()) return next();

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Token requerido." });
  }

  const token = header.split(" ")[1];
  const decoded = await verifyFirebaseToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Token inválido o expirado." });
  }

  req.user = decoded;
  next();
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "kamilo-atlas-backend" });
});

app.get("/api/projects", authMiddleware, async (req, res) => {
  if (!isFirebaseReady() || !db) {
    return res.status(503).json({ error: "FIREBASE_NOT_READY", message: "Firebase no está configurado." });
  }

  try {
    const snapshot = await db
      .collection("projects")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();

    const projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "FETCH_FAILED", message: error.message });
  }
});

app.post("/api/projects", authMiddleware, async (req, res) => {
  if (!isFirebaseReady() || !db) {
    return res.status(503).json({ error: "FIREBASE_NOT_READY", message: "Firebase no está configurado." });
  }

  const { id, name, notas, links, archivos } = req.body ?? {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "NAME_REQUIRED", message: "El nombre del proyecto es obligatorio." });
  }

  try {
    const project = {
      userId: req.user.uid,
      name: name.trim(),
      notas: Array.isArray(notas) ? notas : [],
      links: Array.isArray(links) ? links : [],
      archivos: Array.isArray(archivos) ? archivos : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = id ? db.collection("projects").doc(id) : db.collection("projects").doc();
    await docRef.set(project);

    res.status(201).json({ id: docRef.id, ...project });
  } catch (error) {
    res.status(500).json({ error: "CREATE_FAILED", message: error.message });
  }
});

app.put("/api/projects/:projectId", authMiddleware, async (req, res) => {
  if (!isFirebaseReady() || !db) {
    return res.status(503).json({ error: "FIREBASE_NOT_READY", message: "Firebase no está configurado." });
  }

  const { projectId } = req.params;
  const { name, notas, links, archivos } = req.body ?? {};

  try {
    const docRef = db.collection("projects").doc(projectId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Proyecto no encontrado." });
    }

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "FORBIDDEN", message: "No tienes permiso para modificar este proyecto." });
    }

    const updates = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updates.name = name.trim();
    if (notas !== undefined) updates.notas = notas;
    if (links !== undefined) updates.links = links;
    if (archivos !== undefined) updates.archivos = archivos;

    await docRef.update(updates);

    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    res.status(500).json({ error: "UPDATE_FAILED", message: error.message });
  }
});

app.delete("/api/projects/:projectId", authMiddleware, async (req, res) => {
  if (!isFirebaseReady() || !db) {
    return res.status(503).json({ error: "FIREBASE_NOT_READY", message: "Firebase no está configurado." });
  }

  const { projectId } = req.params;

  try {
    const docRef = db.collection("projects").doc(projectId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Proyecto no encontrado." });
    }

    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "FORBIDDEN", message: "No tienes permiso para eliminar este proyecto." });
    }

    await docRef.delete();
    res.json({ message: "Proyecto eliminado." });
  } catch (error) {
    res.status(500).json({ error: "DELETE_FAILED", message: error.message });
  }
});

app.post("/api/projects/:projectId/chat", authMiddleware, async (req, res) => {
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
