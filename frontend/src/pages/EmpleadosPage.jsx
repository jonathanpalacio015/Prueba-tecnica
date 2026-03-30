import React, { useEffect, useState } from 'react';
import EmpleadosTable from '../components/EmpleadosTable';
import EmpleadoForm from '../components/EmpleadoForm';
import Loader from '../components/Loader';
import service from '../services/empleadosService';

function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const data = await service.listar();
    setEmpleados(data || []);
    setLoading(false);
  };

  // cargar listado solo cuando el usuario lo solicite
  useEffect(() => {
    if (showList) fetchAll();
  }, [showList]);

  const handleEdit = (emp) => { setEditing(emp); setShowForm(true); };
  const handleDelete = async (id) => { await service.eliminar(id); fetchAll(); };
  const handleSave = async (emp) => {
    if (emp.id) await service.actualizar(emp.id, emp);
    else await service.crear(emp);
    setShowForm(false); setEditing(null); fetchAll();
  };

  return (
    <div>
      <header>
        <div className="header-title">
          <h1>Electrobridges</h1>
        </div>
      </header>
      <main className="app-container">
        <div className="content-grid">
          <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button className="btn" onClick={() => { setEditing(null); setShowForm(prev => !prev); }} title="Nuevo empleado">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>

                    <button className="btn" onClick={() => setShowList(prev => !prev)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {showList ? 'Ocultar listado' : 'Ver listado'}
                    </button>
                  </div>
                </div>
            {showForm && <EmpleadoForm initial={editing} onCancel={() => { setShowForm(false); setEditing(null); }} onSave={handleSave} />}
          </div>

          <div>
            {showList ? (loading ? <Loader /> : <EmpleadosTable empleados={empleados} onEdit={handleEdit} onDelete={handleDelete} />) : <div className="centered">Pulsa "Ver listado" para cargar los empleados</div>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default EmpleadosPage;
