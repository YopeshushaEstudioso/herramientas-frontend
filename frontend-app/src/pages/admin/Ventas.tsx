import { Fragment, useEffect, useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../../components/StatusBlock";
import { createResourceService } from "../../services/resource";
import { getErrorMessage } from "../../services/api";

// Shape real de GET /api/ventas (ver controllers/venta.controller.js):
// cada venta trae "cliente" y "detalles" (con "producto") anidados.
// El backend no expone un campo "estado" ni un endpoint de edición (PUT).
interface Cliente {
  id: number;
  nombres: string;
  apellidos: string;
}

interface Producto {
  id: number;
  nombre: string;
}

interface DetalleVenta {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto?: Producto;
}

interface Venta {
  id: number;
  clienteId: number;
  cliente?: Cliente;
  fecha: string;
  total: number;
  detalles: DetalleVenta[];
}

const ventasService = createResourceService<Venta>("ventas");

export default function Ventas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setVentas(await ventasService.list());
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
    <AdminLayout title="Ventas">
      {loading && <LoadingBlock label="Cargando ventas..." />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}
      {!loading && !error && ventas.length === 0 && (
        <EmptyBlock message="Aún no hay ventas registradas." />
      )}

      {!loading && !error && ventas.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Productos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <Fragment key={v.id}>
                  <tr
                    className="table-row--clickable"
                    onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                  >
                    <td>{v.id}</td>
                    <td>
                      {v.cliente ? `${v.cliente.nombres} ${v.cliente.apellidos}` : v.clienteId}
                    </td>
                    <td>{v.fecha ? new Date(v.fecha).toLocaleDateString() : "—"}</td>
                    <td>
                      <span className="badge">{v.detalles?.length ?? 0} ítem(s)</span>
                    </td>
                    <td>${Number(v.total).toFixed(2)}</td>
                  </tr>
                  {expanded === v.id && (
                    <tr className="table-row--detail">
                      <td colSpan={5}>
                        <ul className="detail-list">
                          {v.detalles?.map((d) => (
                            <li key={d.id}>
                              {d.producto?.nombre ?? `Producto #${d.productoId}`} — {d.cantidad} x $
                              {Number(d.precioUnitario).toFixed(2)} = ${Number(d.subtotal).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
