const db = require('../db/connection');

const listar = async (filtros = {}) => {
  let query = 'SELECT * FROM empleados';
  const values = [];
  let hasWhere = false;

  if (filtros.nombre) {
    query += ' WHERE (nombre LIKE ? OR apellido LIKE ?)';
    values.push(`%${filtros.nombre}%`, `%${filtros.nombre}%`);
    hasWhere = true;
  }
  
  if (filtros.departamento) {
    query += hasWhere ? ' AND departamento = ?' : ' WHERE departamento = ?';
    values.push(filtros.departamento);
    hasWhere = true;
  }

  const limit = parseInt(filtros.limit) || 10;
  const page = parseInt(filtros.page) || 1;
  const offset = (page - 1) * limit;

  query += ' LIMIT ? OFFSET ?';
  values.push(limit, offset);

  const [rows] = await db.query(query, values);
  
  return rows.map(r => ({
    ...r,
    fecha_ingreso: r.fecha_ingreso ? new Date(r.fecha_ingreso).toISOString().slice(0,10) : null
  }));
};

const obtener = async (id) => {
  const [rows] = await db.query('SELECT * FROM empleados WHERE id = ?', [id]);
  const row = rows[0];
  if (!row) return null;
  return { ...row, fecha_ingreso: row.fecha_ingreso ? new Date(row.fecha_ingreso).toISOString().slice(0,10) : null };
};

const crear = async (empleado) => {
  const { nombre, apellido, email, departamento, cargo, fecha_ingreso, activo } = empleado;
  const [result] = await db.query(
    'INSERT INTO empleados (nombre, apellido, email, departamento, cargo, fecha_ingreso, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [nombre, apellido, email, departamento, cargo, fecha_ingreso, activo]
  );
  return { id: result.insertId, ...empleado };
};

const actualizar = async (id, empleado) => {
  const fields = [];
  const values = [];
  for (const key of ['nombre','apellido','email','departamento','cargo','fecha_ingreso','activo']) {
    if (empleado[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(empleado[key]);
    }
  }
  if (fields.length === 0) return await obtener(id);
  values.push(id);
  await db.query(`UPDATE empleados SET ${fields.join(', ')} WHERE id = ?`, values);
  return await obtener(id);
};

const eliminar = async (id) => {
  await db.query('UPDATE empleados SET activo = FALSE WHERE id = ?', [id]);
  return true;
};

const contar = async (filtros = {}) => {
  let query = 'SELECT COUNT(*) as total FROM empleados';
  const values = [];
  let hasWhere = false;

  if (filtros.nombre) {
    query += ' WHERE (nombre LIKE ? OR apellido LIKE ?)';
    values.push(`%${filtros.nombre}%`, `%${filtros.nombre}%`);
    hasWhere = true;
  }
  
  if (filtros.departamento) {
    query += hasWhere ? ' AND departamento = ?' : ' WHERE departamento = ?';
    values.push(filtros.departamento);
  }

  const [rows] = await db.query(query, values);
  return rows[0].total;
};

module.exports = { listar, obtener, crear, actualizar, eliminar, contar };
