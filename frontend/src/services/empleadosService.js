const BASE = typeof window !== 'undefined' ? 'http://localhost:5000' : '';
const API = BASE + '/api/empleados';

async function request(path = '', options = {}) {
  const res = await fetch(API + path, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

export default {
  listar: (filtros = {}) => {
    const query = new URLSearchParams();
    if (filtros.nombre) query.append('nombre', filtros.nombre);
    if (filtros.departamento) query.append('departamento', filtros.departamento);
    if (filtros.limit) query.append('limit', filtros.limit);
    if (filtros.page) query.append('page', filtros.page);
    return request('/' + (query.toString() ? '?' + query.toString() : ''));
  },
  contar: (filtros = {}) => {
    const query = new URLSearchParams();
    if (filtros.nombre) query.append('nombre', filtros.nombre);
    if (filtros.departamento) query.append('departamento', filtros.departamento);
    return request('/count' + (query.toString() ? '?' + query.toString() : ''));
  },
  obtener: (id) => request('/' + id),
  crear: (data) => request('/', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id, data) => request('/' + id, { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id) => request('/' + id, { method: 'DELETE' })
};
