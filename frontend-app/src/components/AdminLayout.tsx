import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/clientes", label: "Clientes" },
  { to: "/admin/ventas", label: "Ventas" },
];

export function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="brand-mark">TH</span>
          <span>ToolHub Admin</span>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                "admin-nav__link" + (isActive ? " admin-nav__link--active" : "")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          {user?.email && <span className="admin-sidebar__user">{user.email}</span>}
          <button type="button" className="btn btn--ghost admin-sidebar__logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-main__header">
          <h1>{title}</h1>
        </header>
        <div className="admin-main__content">{children}</div>
      </main>
    </div>
  );
}
