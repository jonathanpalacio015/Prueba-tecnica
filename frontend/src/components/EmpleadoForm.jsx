import React, { useState, useEffect } from 'react';

function EmpleadoForm({ initial = {}, onCancel, onSave }) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    departamento: '',
    cargo: '',
    fecha_ingreso: '',
    activo: true,
    ...initial
  });

  useEffect(() => setForm(f => ({ ...f, ...initial })), [initial]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="form-container">
      <form onSubmit={submit} className="empleado-form">
        <div className="form-row">
          <input className="text-input" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
          <input className="text-input" name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} />
        </div>

        <div className="form-row" style={{ marginTop: '0.6rem' }}>
          <input className="text-input" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input className="text-input" name="departamento" placeholder="Departamento" value={form.departamento} onChange={handleChange} />
        </div>

        <div className="form-row" style={{ marginTop: '0.6rem' }}>
          <input className="text-input" name="cargo" placeholder="Cargo" value={form.cargo} onChange={handleChange} />
          <input className="text-input" type="date" name="fecha_ingreso" value={form.fecha_ingreso || ''} onChange={handleChange} />
        </div>

        <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Activo
            <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} />
          </label>
        </div>

        <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem' }}>
          <button className="btn" type="submit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Guardar
          </button>

          <button className="btn secondary" type="button" onClick={onCancel}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmpleadoForm;
