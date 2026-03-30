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
  const [filtros, setFiltros] = useState({ nombre: '', departamento: '', page: 1, limit: 10 });
  const [total, setTotal] = useState(0);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await service.listar(filtros);
      const totalData = await service.contar(filtros);
      setEmpleados(data || []);
      setTotal(totalData?.total || 0);
    } catch (err) {
      console.error('Error fetching:', err);
    }
    setLoading(false);
  };

  // cargar listado cuando el usuario lo solicite o cuando cambien los filtros
  useEffect(() => {
    if (showList) fetchAll();
  }, [showList, filtros]);

  const handleEdit = (emp) => { setEditing(emp); setShowForm(true); };
  
  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este empleado?')) {
      await service.eliminar(id);
      fetchAll();
    }
  };
  
  const handleSave = async (emp) => {
    try {
      if (emp.id) await service.actualizar(emp.id, emp);
      else await service.crear(emp);
      setShowForm(false); 
      setEditing(null); 
      fetchAll();
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  const handleFilterChange = (type, value) => {
    setFiltros(prev => ({ ...prev, [type]: value, page: 1 }));
  };

  const totalPages = Math.ceil(total / filtros.limit);
  const currentPage = filtros.page;

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
            {showList ? (
              <>
                {loading ? <Loader /> : (
                  <>
                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        placeholder="Buscar por nombre..." 
                        value={filtros.nombre} 
                        onChange={(e) => handleFilterChange('nombre', e.target.value)}
                        className="text-input"
                        style={{ flex: 1, minWidth: '150px' }}
                      />
                      <input 
                        type="text" 
                        placeholder="Filtrar por departamento..." 
                        value={filtros.departamento} 
                        onChange={(e) => handleFilterChange('departamento', e.target.value)}
                        className="text-input"
                        style={{ flex: 1, minWidth: '150px' }}
                      />
                    </div>
                    <EmpleadosTable empleados={empleados} onEdit={handleEdit} onDelete={handleDelete} />
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        className="btn" 
                        disabled={currentPage === 1}
                        onClick={() => handleFilterChange('page', currentPage - 1)}
                      >
                        Anterior
                      </button>
                      <span>Página {currentPage} de {totalPages} (Total: {total})</span>
                      <button 
                        className="btn"
                        disabled={currentPage === totalPages}
                        onClick={() => handleFilterChange('page', currentPage + 1)}
                      >
                        Siguiente
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : <div className="centered">Pulsa "Ver listado" para cargar los empleados</div>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default EmpleadosPage;
