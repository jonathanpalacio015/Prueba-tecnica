import React from 'react';

function EmpleadosTable({ empleados, onEdit, onDelete }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Departamento</th>
            <th>Cargo</th>
            <th>Fecha Ingreso</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map(emp => (
            <tr key={emp.id}>
              <td>{emp.nombre}</td>
              <td>{emp.apellido}</td>
              <td>{emp.email}</td>
              <td>{emp.departamento}</td>
              <td>{emp.cargo}</td>
              <td>{emp.fecha_ingreso}</td>
              <td>{emp.activo ? 'Sí' : 'No'}</td>
              <td className="actions-cell">
                <button className="edit-btn" title="Editar" onClick={() => onEdit(emp)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                </button>
                <button className="delete-btn" title="Eliminar" onClick={() => onDelete(emp.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmpleadosTable;
