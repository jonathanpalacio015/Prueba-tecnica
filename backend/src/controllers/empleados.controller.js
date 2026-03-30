const Model = require('../models/empleado.model');

const listar = async (req, res) => {
  try {
    const rows = await Model.listar(req.query);
    res.json(rows);
  } catch (err) {
    console.error('Error listando empleados:', err);
    res.status(500).json({ error: 'Error al listar empleados' });
  }
};

const obtener = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validar que id es un número
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'ID debe ser un número válido' });
    }
    
    const row = await Model.obtener(id);
    if (!row) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(row);
  } catch (err) {
    console.error('Error obteniendo empleado:', err);
    res.status(500).json({ error: 'Error al obtener empleado' });
  }
};

const crear = async (req, res) => {
  try {
    const nuevo = await Model.crear(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    // Manejar error de email duplicado
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        error: 'El email ya existe en el sistema',
        field: 'email',
        value: req.body.email
      });
    }
    
    // Manejar otros errores de BD
    if (err.code && err.code.startsWith('ER_')) {
      console.error('Error DB:', err);
      return res.status(400).json({ 
        error: 'Error en los datos: ' + err.message 
      });
    }
    
    console.error('Error creando empleado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizar = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validar que el empleado existe
    const existe = await Model.obtener(id);
    if (!existe) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    const updated = await Model.actualizar(id, req.body);
    res.json(updated);
  } catch (err) {
    // Manejar error de email duplicado
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        error: 'El email ya existe en el sistema',
        field: 'email'
      });
    }
    
    if (err.code && err.code.startsWith('ER_')) {
      console.error('Error DB:', err);
      return res.status(400).json({ 
        error: 'Error en los datos: ' + err.message 
      });
    }
    
    console.error('Error actualizando empleado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const eliminar = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validar que id es un número
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'ID debe ser un número válido' });
    }
    
    // Verificar que existe
    const existe = await Model.obtener(id);
    if (!existe) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    await Model.eliminar(id);
    res.status(204).send();
  } catch (err) {
    console.error('Error eliminando empleado:', err);
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
};

const contar = async (req, res) => {
  try {
    const total = await Model.contar(req.query);
    res.json({ total });
  } catch (err) {
    console.error('Error contando empleados:', err);
    res.status(500).json({ error: 'Error al contar empleados' });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar, contar };
