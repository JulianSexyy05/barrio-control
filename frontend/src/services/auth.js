const STORAGE_KEYS = {
  USER: "kamilo-user",
  SESSION: "kamilo-session",
};

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem(STORAGE_KEYS.SESSION);
}

export async function registerUser({ name, email, password }) {
  const hashed = await hashPassword(password);
  const user = { name, email, password: hashed };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.SESSION, "true");
  return { name, email };
}

export async function loginUser({ email, password }) {
  const user = getUser();

  if (!user) {
    return { success: false, error: "No existe una cuenta registrada. Regístrate primero." };
  }
  if (user.email !== email) {
    return { success: false, error: "El correo no coincide con ninguna cuenta registrada." };
  }

  const hashed = await hashPassword(password);
  if (user.password !== hashed) {
    return { success: false, error: "Contraseña incorrecta." };
  }

  localStorage.setItem(STORAGE_KEYS.SESSION, "true");
  return { success: true };
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}
