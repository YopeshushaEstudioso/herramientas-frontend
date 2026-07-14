import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { LoadingBlock, ErrorBlock } from "../../components/StatusBlock";
import { createResourceService } from "../../services/resource";
import { getErrorMessage } from "../../services/api";

const productosService = createResourceService<{ id: number }>("productos");
const categoriasService = createResourceService<{ id: number }>("categorias");
const clientesService = createResourceService<{ id: number }>("clientes");
const ventasService = createResourceService<{ id: number }>("ventas");

interface Counts {
  productos: number;
  categorias: number;
  clientes: number;
  ventas: number;
}

export default function Dashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [productos, categorias, clientes, ventas] = await Promise.all([
        productosService.list(),
        categoriasService.list(),
        clientesService.list(),
        ventasService.list(),
      ]);
      setCounts({
        productos: productos.length,
        categorias: categorias.length,
        clientes: clientes.length,
        ventas: ventas.length,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading && <LoadingBlock label="Cargando resumen..." />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}
      {!loading && !error && counts && (
        <div className="stat-grid">
          <StatCard label="Productos" value={counts.productos} />
          <StatCard label="Categorías" value={counts.categorias} />
          <StatCard label="Clientes" value={counts.clientes} />
          <StatCard label="Ventas" value={counts.ventas} />
        </div>
      )}
    </AdminLayout>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
