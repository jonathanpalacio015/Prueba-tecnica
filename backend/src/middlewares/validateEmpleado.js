function validateEmpleado(req, res, next) {
  const { nombre, apellido, email } = req.body;
  if (!nombre || !apellido || !email) {
    return res.status(400).json({ error: 'nombre, apellido y email son requeridos' });
  }
  next();
}

module.exports = validateEmpleado;
