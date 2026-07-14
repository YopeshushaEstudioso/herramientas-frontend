import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

/**
 * Cliente HTTP único para toda la app.
 * baseURL siempre relativa: "/api".
 * Nunca usar localhost:3000 ni IPs — en producción nginx (dentro del
 * contenedor frontend) reenvía /api hacia el servicio backend por su
 * nombre de red interno de Docker Compose.
 *
 * Contrato real del backend (herramientas-node-api):
 *  - POST /api/auth/login  -> { user, accessToken, refreshToken }
 *  - accessToken expira en 15 min, refreshToken en 7 días
 *  - Authorization: Bearer <accessToken> en cada request protegido
 *  - Errores: { status: "error", message, errors? }
 */
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const ACCESS_TOKEN_KEY = "toolhub_access_token";
const REFRESH_TOKEN_KEY = "toolhub_refresh_token";
const USER_KEY = "toolhub_user";

export interface StoredUser {
  id: number | string;
  email: string;
  rol?: "admin" | "user";
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(tokens: { accessToken: string; refreshToken: string }, user?: StoredUser): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Mantenido por compatibilidad con el resto del código: "hay sesión" =
// hay accessToken guardado.
export function getToken(): string | null {
  return getAccessToken();
}

// Adjunta el accessToken a cada request saliente.
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// El accessToken dura solo 15 min. Si una request falla con 401,
// intentamos renovarlo una vez con el refreshToken (POST /api/auth/refresh)
// antes de forzar el logout. Esto evita expulsar al usuario del panel
// en medio de una sesión larga solo porque el access token venció.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = axios
      .post("/api/auth/refresh", { refreshToken })
      .then(({ data }) => {
        const newAccess = data?.accessToken as string | undefined;
        const newRefresh = data?.refreshToken as string | undefined;
        if (newAccess && newRefresh) {
          setSession({ accessToken: newAccess, refreshToken: newRefresh });
          return newAccess;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }

      // No se pudo renovar: cerrar sesión y volver a /login.
      clearSession();
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: string[] } | undefined;
    if (data?.errors?.length) return data.errors.join(", ");
    return data?.message || err.message || "Error de red";
  }
  if (err instanceof Error) return err.message;
  return "Ocurrió un error inesperado";
}
