import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../services/api";

// Guarda de ruta: si no hay token guardado, redirige a /login
// conservando la ruta original para volver después de iniciar sesión.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
