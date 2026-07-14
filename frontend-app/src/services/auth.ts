import { api, setSession, clearSession, type StoredUser } from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

// Shape real de POST /api/auth/login y /api/auth/register
// (ver controllers/auth.controller.js del backend).
export interface AuthResponse {
  user: StoredUser;
  accessToken: string;
  refreshToken: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken }, data.user);
  return data;
}

export async function fetchCurrentUser(): Promise<StoredUser> {
  const { data } = await api.get<StoredUser>("/auth/me");
  return data;
}

export function logout(): void {
  clearSession();
}
