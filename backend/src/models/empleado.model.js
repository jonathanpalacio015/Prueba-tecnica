const db = require('../db/connection');

const listar = async () => {
  const [rows] = await db.query('SELECT * FROM empleados');
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
  await db.query('DELETE FROM empleados WHERE id = ?', [id]);
  return true;
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
