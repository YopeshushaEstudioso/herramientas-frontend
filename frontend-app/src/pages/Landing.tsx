import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Catálogo siempre al día",
    desc: "Cada herramienta con stock, precio y ficha técnica sincronizados en tiempo real.",
  },
  {
    title: "Panel de control único",
    desc: "Productos, categorías, clientes y ventas en un mismo lugar, sin hojas de cálculo sueltas.",
  },
  {
    title: "Acceso seguro",
    desc: "Autenticación con JWT: solo tu equipo administra el inventario.",
  },
];

const CATEGORIES = [
  { name: "Herramientas manuales", icon: "🔧" },
  { name: "Herramientas eléctricas", icon: "🪚" },
  { name: "Medición y trazado", icon: "📏" },
  { name: "Seguridad y protección", icon: "🦺" },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav__brand">
          <span className="brand-mark">TH</span> ToolHub
        </div>
        <Link to="/login" className="btn btn--outline">
          Ingresar
        </Link>
      </header>

      <section className="hero">
        <div className="hero__content">
          <span className="eyebrow">Ferretería digital</span>
          <h1>
            La herramienta correcta, <span className="accent">para cada trabajo.</span>
          </h1>
          <p>
            ToolHub reúne el catálogo, el inventario y las ventas de tu ferretería
            en un solo panel, para que dediques tiempo al proyecto y no al papeleo.
          </p>
          <div className="hero__actions">
            <Link to="/login" className="btn btn--primary">
              Ir al panel de administración
            </Link>
          </div>
        </div>
        <div className="hero__art" aria-hidden="true">
          <div className="hero__art-shape" />
        </div>
      </section>

      <section className="features">
        <h2>Por qué ToolHub</h2>
        <div className="features__grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="feature-card">
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="categories">
        <h2>Categorías destacadas</h2>
        <div className="categories__grid">
          {CATEGORIES.map((c) => (
            <div key={c.name} className="category-chip">
              <span className="category-chip__icon">{c.icon}</span>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <div>
          <span className="brand-mark">TH</span> ToolHub
        </div>
        <p>© {new Date().getFullYear()} ToolHub. Práctica académica — Frontend + Coolify.</p>
      </footer>
    </div>
  );
}
