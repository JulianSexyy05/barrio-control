const STORAGE_KEYS = {
  USER: "kamilo-user",
  SESSION: "kamilo-session",
};

export function getUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem(STORAGE_KEYS.SESSION);
}

export function registerUser({ name, email, password }) {
  const user = { name, email, password };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.SESSION, "true");
  return user;
}

export function loginUser({ email, password }) {
  const user = getUser();

  if (!user) {
    return { success: false, error: "No existe una cuenta registrada. Regístrate primero." };
  }
  if (user.email !== email) {
    return { success: false, error: "El correo no coincide con ninguna cuenta registrada." };
  }
  if (user.password !== password) {
    return { success: false, error: "Contraseña incorrecta." };
  }

  localStorage.setItem(STORAGE_KEYS.SESSION, "true");
  return { success: true };
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}
