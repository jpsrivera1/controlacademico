import { useState, useEffect } from 'react';

function PanelDia() {
  const [todosEstudiantes, setTodosEstudiantes] = useState([]);
  const [ausentes, setAusentes] = useState([]);
  const [tardes, setTardes] = useState([]);
  const [filtros, setFiltros] = useState({
    jornada: '',
    grado: '',
    busqueda: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeEnviado, setMensajeEnviado] = useState({});

  // Cargar mensajes enviados desde localStorage al iniciar
  useEffect(() => {
    const mensajesGuardados = localStorage.getItem('mensajesEnviados');
    if (mensajesGuardados) {
      setMensajeEnviado(JSON.parse(mensajesGuardados));
    }
  }, []);

  // Obtener jornadas y grados únicos dinámicamente
  const jornadas = [...new Set(todosEstudiantes.map(e => e.jornada))].filter(Boolean);
  
  // Grados a excluir
  const gradosExcluidos = ['Kinder', 'Prepa', '1ro Primaria', '2do Primaria', '3ro Primaria'];
  
  // Filtrar grados según la jornada seleccionada
  const grados = [...new Set(
    todosEstudiantes
      .filter(e => {
        // Si hay jornada seleccionada, filtrar por esa jornada
        if (filtros.jornada) {
          return e.jornada === filtros.jornada;
        }
        return true;
      })
      .map(e => e.grado)
      .filter(g => g && !gradosExcluidos.includes(g))
  )];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://backgeneralsistemaceti.onrender.com/api'}/reportes/panel-dia`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setTodosEstudiantes(data.todos || []);
      setAusentes(data.ausentes || []);
      setTardes(data.tardes || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos del panel');
    } finally {
      setLoading(false);
    }
  };

  const enviarMensajeWhatsApp = (estudiante, tipo) => {
    if (!estudiante.contacto_emergencia) {
      alert('No hay número de contacto de emergencia registrado');
      return;
    }

    // Verificar si ya se envió mensaje a este estudiante hoy
    if (mensajeEnviado[estudiante.id]) {
      alert('El mensaje ya fue enviado a este encargado.');
      return;
    }

    const fecha = new Date().toLocaleDateString('es-GT', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    const mensaje = tipo === 'ausente' 
      ? `*AVISO DE INASISTENCIA*\n\n` +
        `Estimado(a) encargado(a):\n\n` +
        `Le informamos que el día *${fecha}* no se registró el ingreso del estudiante:\n\n` +
        `*Nombre:* ${estudiante.nombre} ${estudiante.apellidos}\n` +
        `*Grado:* ${estudiante.grado}\n` +
        `*Jornada:* ${estudiante.jornada}\n\n` +
        `Si existe alguna justificación, por favor comuníquese con la institución.\n\n` +
        `Atentamente,\n` +
        `Coordinación Académica`
      : `*AVISO DE LLEGADA TARDE*\n\n` +
        `Estimado(a) encargado(a):\n\n` +
        `Le informamos que el día *${fecha}* el estudiante llegó tarde a la institución:\n\n` +
        `*Nombre:* ${estudiante.nombre} ${estudiante.apellidos}\n` +
        `*Hora de entrada:* ${estudiante.hora_entrada}\n` +
        `*Grado:* ${estudiante.grado}\n` +
        `*Jornada:* ${estudiante.jornada}\n\n` +
        `Si existe alguna justificación, por favor comuníquese con la institución.\n\n` +
        `Atentamente,\n` +
        `Coordinación Académica`;

    // Limpiar número (eliminar caracteres no numéricos)
    const numeroLimpio = estudiante.contacto_emergencia.replace(/\D/g, '');
    
    // Marcar como enviado INMEDIATAMENTE (antes de abrir WhatsApp)
    const nuevosEnviados = { ...mensajeEnviado, [estudiante.id]: true };
    setMensajeEnviado(nuevosEnviados);
    
    // Guardar en localStorage para que persista
    localStorage.setItem('mensajesEnviados', JSON.stringify(nuevosEnviados));
    
    // Abrir WhatsApp Web con el mensaje prellenado
    const urlWhatsApp = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
  };

  const estudiantesFiltrados = (lista) => {
    return lista.filter(est => {
      const coincideJornada = !filtros.jornada || est.jornada === filtros.jornada;
      const coincideGrado = !filtros.grado || est.grado === filtros.grado;
      const coincideBusqueda = !filtros.busqueda || 
        `${est.nombre} ${est.apellidos}`.toLowerCase().includes(filtros.busqueda.toLowerCase());
      
      return coincideJornada && coincideGrado && coincideBusqueda;
    });
  };

  if (loading) return <div className="panel-loading">Cargando datos del día...</div>;
  if (error) return <div className="panel-error">{error}</div>;

  const ausentesFiltrados = estudiantesFiltrados(ausentes);
  const tardesFiltrados = estudiantesFiltrados(tardes);

  // Verificar si hoy es fin de semana (Guatemala GMT-6)
  const getGuatemalaDate = () => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
  };
  
  const hoy = getGuatemalaDate();
  const diaSemana = hoy.getDay(); // 0=Domingo, 6=Sábado
  const esFinDeSemana = diaSemana === 0 || diaSemana === 6;

  return (
    <div className="panel-dia-container">
      {esFinDeSemana && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #f59e0b',
          borderRadius: '0.75rem',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <i className="bi bi-calendar-event text-yellow-600" style={{ fontSize: '1.5rem' }}></i>
          <div>
            <strong style={{ color: '#92400e', fontSize: '1.1rem' }}>Fin de semana</strong>
            <p style={{ color: '#78350f', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
              Las asistencias solo se registran de lunes a viernes. Los datos mostrados corresponden al último día hábil.
            </p>
          </div>
        </div>
      )}
      
      <div className="panel-header">
        <h1>Panel del Día - {getGuatemalaDate().toLocaleDateString('es-MX', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</h1>
        <button onClick={cargarDatos} className="btn-refresh">
          🔄 Actualizar
        </button>
      </div>

      <div className="panel-stats">
        <div className="stat-card ausentes">
          <h3>Ausentes</h3>
          <p className="stat-number">{ausentesFiltrados.length}</p>
        </div>
        <div className="stat-card tardes">
          <h3>Tardes</h3>
          <p className="stat-number">{tardesFiltrados.length}</p>
        </div>
        <div className="stat-card total">
          <h3>Total Estudiantes</h3>
          <p className="stat-number">{todosEstudiantes.length}</p>
        </div>
      </div>

      <div className="filtros-container">
        <div className="filtros-grid">
          <div className="filtro-group">
            <label>Jornada</label>
            <select 
              value={filtros.jornada} 
              onChange={(e) => {
                const nuevaJornada = e.target.value;
                setFiltros({...filtros, jornada: nuevaJornada, grado: ''});
              }}
            >
              <option value="">Todas</option>
              {jornadas.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>

          <div className="filtro-group">
            <label>Grado</label>
            <select 
              value={filtros.grado} 
              onChange={(e) => setFiltros({...filtros, grado: e.target.value})}
              disabled={grados.length === 0}
            >
              <option value="">Todos</option>
              {grados.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="filtro-group">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
            />
          </div>
        </div>

        {(filtros.jornada || filtros.grado || filtros.busqueda) && (
          <button 
            onClick={() => setFiltros({ jornada: '', grado: '', busqueda: '' })}
            className="btn-limpiar-filtros"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="panel-tables">
        <div className="table-section">
          <h2 className="table-title ausentes-title">
            <i className="bi bi-clipboard-x text-red-600 mr-2"></i>
            Estudiantes Ausentes ({ausentesFiltrados.length})
          </h2>
          {ausentesFiltrados.length === 0 ? (
            <p className="empty-message">No hay ausentes hoy</p>
          ) : (
            <div className="table-responsive">
              <table className="estudiantes-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Grado</th>
                    <th>Jornada</th>
                    <th>Contacto</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ausentesFiltrados.map((est) => (
                    <tr key={est.id}>
                      <td>{est.nombre} {est.apellidos}</td>
                      <td>{est.grado || 'N/A'}</td>
                      <td>{est.jornada || 'N/A'}</td>
                      <td>{est.contacto_emergencia || 'N/A'}</td>
                      <td>
                        <button
                          onClick={() => enviarMensajeWhatsApp(est, 'ausente')}
                          className={`btn-whatsapp ${mensajeEnviado[est.id] ? 'enviado' : ''}`}
                          disabled={mensajeEnviado[est.id]}
                        >
                          {mensajeEnviado[est.id] ? '✓ Enviado' : '📱 WhatsApp'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="table-section">
          <h2 className="table-title tardes-title">
            <i className="bi bi-clock-history text-yellow-600 mr-2"></i>
            Estudiantes que llegaron tarde ({tardesFiltrados.length})
          </h2>
          {tardesFiltrados.length === 0 ? (
            <p className="empty-message">No hay tardes hoy</p>
          ) : (
            <div className="table-responsive">
              <table className="estudiantes-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Grado</th>
                    <th>Jornada</th>
                    <th>Contacto</th>
                    <th>Hora Entrada</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {tardesFiltrados.map((est) => (
                    <tr key={est.id}>
                      <td>{est.nombre} {est.apellidos}</td>
                      <td>{est.grado || 'N/A'}</td>
                      <td>{est.jornada || 'N/A'}</td>
                      <td>{est.contacto_emergencia || 'N/A'}</td>
                      <td>{est.hora_entrada || 'N/A'}</td>
                      <td>
                        <button
                          onClick={() => enviarMensajeWhatsApp(est, 'tarde')}
                          className={`btn-whatsapp ${mensajeEnviado[est.id] ? 'enviado' : ''}`}
                          disabled={mensajeEnviado[est.id]}
                        >
                          {mensajeEnviado[est.id] ? '✓ Enviado' : '📱 WhatsApp'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PanelDia;
