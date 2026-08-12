import { createContext, useState, useEffect, useCallback } from "react";
import { getStoredUser, getMe, logout as logoutService } from "../services/auth";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe()
        .then((data) => {
          setUser(data.usuario);
          localStorage.setItem("usuario", JSON.stringify(data.usuario));
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          setUser(null);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
