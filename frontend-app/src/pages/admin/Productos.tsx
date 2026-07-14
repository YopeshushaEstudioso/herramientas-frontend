import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../../components/StatusBlock";
import { createResourceService } from "../../services/resource";
import { getErrorMessage } from "../../services/api";

// Shape real de GET /api/productos (ver controllers/producto.controller.js
// y config/swagger.js del backend): incluye "categoria" anidada.
interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoriaId?: number | null;
  categoria?: Categoria | null;
}

const productosService = createResourceService<Producto>("productos");
const categoriasService = createResourceService<Categoria>("categorias");

const EMPTY_FORM: Partial<Producto> = {
  nombre: "",
  descripcion: "",
  precio: 0,
  stock: 0,
  categoriaId: undefined,
};

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState<Partial<Producto>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [prod, cats] = await Promise.all([productosService.list(), categoriasService.list()]);
      setProductos(prod);
      setCategorias(cats);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(p: Producto) {
    setEditing(p);
    setForm(p);
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await productosService.update(editing.id, form);
      } else {
        await productosService.create(form);
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Producto) {
    if (!confirm(`¿Eliminar el producto "${p.nombre}"?`)) return;
    try {
      await productosService.remove(p.id);
      await load();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <AdminLayout title="Productos">
      <div className="toolbar">
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          + Nuevo producto
        </button>
      </div>

      {loading && <LoadingBlock label="Cargando productos..." />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}
      {!loading && !error && productos.length === 0 && (
        <EmptyBlock message="Aún no hay productos registrados." />
      )}

      {!loading && !error && productos.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.nombre}</strong>
                    {p.descripcion && <div className="cell-subtext">{p.descripcion}</div>}
                  </td>
                  <td>{p.categoria?.nombre ?? "—"}</td>
                  <td>${Number(p.precio).toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td className="table-actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(p)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm btn--danger"
                      onClick={() => handleDelete(p)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Editar producto" : "Nuevo producto"}</h2>
            <form onSubmit={handleSubmit} className="form-grid">
              <label>
                Nombre
                <input
                  required
                  value={form.nombre ?? ""}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </label>
              <label>
                Descripción
                <textarea
                  value={form.descripcion ?? ""}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </label>
              <label>
                Precio
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.precio ?? 0}
                  onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  required
                  value={form.stock ?? 0}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </label>
              <label>
                Categoría
                <select
                  value={form.categoriaId ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categoriaId: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                >
                  <option value="">Sin categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>

              {formError && (
                <p className="auth-form__error" role="alert">
                  {formError}
                </p>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
