import OpenAI from "openai";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY no esta configurada en el backend.");
  }

  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: GROQ_BASE_URL,
  });
}

function formatProjectContext(context = {}) {
  const notes = Array.isArray(context.notas) ? context.notas : [];
  const links = Array.isArray(context.links) ? context.links : [];
  const files = Array.isArray(context.archivos) ? context.archivos : [];

  return {
    name: context.name || "Proyecto sin nombre",
    notes: notes.map((note) => note.text).filter(Boolean),
    links: links.map((link) => ({ title: link.title, url: link.url })),
    files: files.map((file) => ({ name: file.name, type: file.type, size: file.size })),
  };
}

export async function generateProjectAnswer({ question, context }) {
  const groq = await getGroqClient();
  const projectContext = formatProjectContext(context);

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content:
          "Eres el asistente de Kamilo Atlas. Responde en español, con claridad y usando solo el contexto del proyecto cuando sea posible. Si falta información, dilo sin inventar.",
      },
      {
        role: "user",
        content: JSON.stringify({
          question,
          project: projectContext,
        }),
      },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || "No pude generar una respuesta.";
}
