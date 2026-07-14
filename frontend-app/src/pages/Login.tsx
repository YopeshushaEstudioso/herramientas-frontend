import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = await login({ email, password });
    if (ok) {
      const from = (location.state as { from?: Location })?.from?.pathname || "/admin";
      navigate(from, { replace: true });
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <Link to="/" className="brand-mark brand-mark--lg">
          TH
        </Link>
        <h1>Ingresa a ToolHub</h1>
        <p className="auth-card__subtitle">Panel de administración</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Correo electrónico
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@toolhub.com"
              autoComplete="username"
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="auth-form__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
