import { api } from "./api";

/**
 * Fábrica de servicio CRUD genérico.
 * Cubre GET (list/one), POST, PUT, DELETE contra /api/<resource>.
 * Úsalo para Productos, Categorías, Clientes, Ventas, etc.
 *
 * Ejemplo:
 *   const productosService = createResourceService<Producto>("productos");
 *   await productosService.list();
 *   await productosService.create({ nombre: "Martillo", precio: 12.5 });
 */
export function createResourceService<T extends { id?: number | string }>(
  resourcePath: string
) {
  const base = `/${resourcePath}`;

  return {
    async list(params?: Record<string, unknown>): Promise<T[]> {
      const { data } = await api.get<T[]>(base, { params });
      return data;
    },
    async getOne(id: number | string): Promise<T> {
      const { data } = await api.get<T>(`${base}/${id}`);
      return data;
    },
    async create(payload: Partial<T>): Promise<T> {
      const { data } = await api.post<T>(base, payload);
      return data;
    },
    async update(id: number | string, payload: Partial<T>): Promise<T> {
      const { data } = await api.put<T>(`${base}/${id}`, payload);
      return data;
    },
    async remove(id: number | string): Promise<void> {
      await api.delete(`${base}/${id}`);
    },
  };
}
