const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function askProjectAi(projectId, question, context) {
  const response = await fetch(`${API_URL}/api/projects/${projectId}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, context }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo enviar la pregunta.");
  }

  return data;
}
