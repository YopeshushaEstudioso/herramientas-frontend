import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../../components/StatusBlock";
import { createResourceService } from "../../services/resource";
import { getErrorMessage } from "../../services/api";

// Shape real de GET /api/clientes (ver models/cliente.js y
// config/swagger.js del backend).
interface Cliente {
  id: number;
  identificacion: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
}

const clientesService = createResourceService<Cliente>("clientes");

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setClientes(await clientesService.list());
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
    <AdminLayout title="Clientes">
      {loading && <LoadingBlock label="Cargando clientes..." />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}
      {!loading && !error && clientes.length === 0 && (
        <EmptyBlock message="Aún no hay clientes registrados." />
      )}

      {!loading && !error && clientes.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Nombre completo</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Dirección</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td>{c.identificacion}</td>
                  <td>
                    <strong>
                      {c.nombres} {c.apellidos}
                    </strong>
                  </td>
                  <td>{c.email}</td>
                  <td>{c.telefono}</td>
                  <td>{c.direccion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
