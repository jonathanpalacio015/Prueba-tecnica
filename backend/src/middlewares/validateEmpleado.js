function validateEmpleado(req, res, next) {
  const { nombre, apellido, email, fecha_ingreso } = req.body;
  const errors = [];
  
  // Validar campos requeridos
  if (!nombre || nombre.trim() === '') {
    errors.push('Nombre es requerido');
  }
  if (!apellido || apellido.trim() === '') {
    errors.push('Apellido es requerido');
  }
  if (!email || email.trim() === '') {
    errors.push('Email es requerido');
  }
  
  // Validar formato de email
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Email debe ser válido (formato: usuario@dominio.com)');
    }
  }
  
  // Validar longitud
  if (nombre && nombre.length > 100) {
    errors.push('Nombre no puede exceder 100 caracteres');
  }
  if (apellido && apellido.length > 100) {
    errors.push('Apellido no puede exceder 100 caracteres');
  }
  if (email && email.length > 150) {
    errors.push('Email no puede exceder 150 caracteres');
  }
  
  // Validar fecha_ingreso no sea futura
  if (fecha_ingreso) {
    const fechaIngreso = new Date(fecha_ingreso);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaIngreso > hoy) {
      errors.push('Fecha de ingreso no puede ser futura');
    }
  }
  
  // Si hay errores, retornar
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validación fallida',
      details: errors 
    });
  }
  
  next();
}

module.exports = validateEmpleado;
