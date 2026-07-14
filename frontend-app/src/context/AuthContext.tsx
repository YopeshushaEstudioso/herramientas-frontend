import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { login as loginRequest, logout as logoutRequest, type LoginPayload } from "../services/auth";
import { getToken, getStoredUser, getErrorMessage, type StoredUser } from "../services/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  user: StoredUser | null;
  loading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getToken());
  const [user, setUser] = useState<StoredUser | null>(getStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginRequest(payload);
      setIsAuthenticated(true);
      setUser(res.user);
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
