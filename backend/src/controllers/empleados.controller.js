const Model = require('../models/empleado.model');

const listar = async (req, res) => {
  try {
    const rows = await Model.listar();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const id = req.params.id;
    const row = await Model.obtener(id);
    if (!row) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const nuevo = await Model.crear(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Model.actualizar(id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const id = req.params.id;
    await Model.eliminar(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
