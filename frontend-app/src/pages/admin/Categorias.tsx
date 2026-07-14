import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../../components/StatusBlock";
import { createResourceService } from "../../services/resource";
import { getErrorMessage } from "../../services/api";

interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

const categoriasService = createResourceService<Categoria>("categorias");
const EMPTY_FORM: Partial<Categoria> = { nombre: "", descripcion: "" };

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [form, setForm] = useState<Partial<Categoria>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setCategorias(await categoriasService.list());
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

  function openEdit(c: Categoria) {
    setEditing(c);
    setForm(c);
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await categoriasService.update(editing.id, form);
      } else {
        await categoriasService.create(form);
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Categoria) {
    if (!confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
    try {
      await categoriasService.remove(c.id);
      await load();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <AdminLayout title="Categorías">
      <div className="toolbar">
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          + Nueva categoría
        </button>
      </div>

      {loading && <LoadingBlock label="Cargando categorías..." />}
      {!loading && error && <ErrorBlock message={error} onRetry={load} />}
      {!loading && !error && categorias.length === 0 && (
        <EmptyBlock message="Aún no hay categorías registradas." />
      )}

      {!loading && !error && categorias.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.nombre}</strong>
                  </td>
                  <td>{c.descripcion ?? "—"}</td>
                  <td className="table-actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(c)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm btn--danger"
                      onClick={() => handleDelete(c)}
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
            <h2>{editing ? "Editar categoría" : "Nueva categoría"}</h2>
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
