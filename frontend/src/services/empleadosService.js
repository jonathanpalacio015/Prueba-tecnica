const BASE = typeof window !== 'undefined' ? 'http://backend:5000' : '';
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
  listar: () => request('/'),
  obtener: (id) => request('/' + id),
  crear: (data) => request('/', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id, data) => request('/' + id, { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id) => request('/' + id, { method: 'DELETE' })
};
