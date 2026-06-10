const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function askProjectAi(projectId, question, context, history = []) {
  const user = await import("../services/firebase").then((m) => m.auth.currentUser);
  const token = user ? await user.getIdToken() : "";

  const response = await fetch(`${API_URL}/api/projects/${projectId}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question, context, history }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo enviar la pregunta.");
  }

  return data;
}
