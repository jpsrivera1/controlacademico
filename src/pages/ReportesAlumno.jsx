import { useState, useEffect } from 'react';
import { obtenerEstudiantes, obtenerReporteAlumno, generarPDFReporte } from '../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportesAlumno = () => {
    // Obtener fecha de Guatemala (GMT-6)
    const getGuatemalaDate = () => {
        const now = new Date();
        return new Date(now.toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
    };
    
    const [estudiantes, setEstudiantes] = useState([]);
    const [todosEstudiantes, setTodosEstudiantes] = useState([]);
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState('');
    
    const guatemalaDate = getGuatemalaDate();
    const [rangoFechas, setRangoFechas] = useState({
        inicio: new Date(guatemalaDate.getFullYear(), guatemalaDate.getMonth(), 1).toISOString().split('T')[0],
        fin: guatemalaDate.toISOString().split('T')[0]
    });
    const [filtros, setFiltros] = useState({
        jornada: '',
        grado: '',
        busqueda: ''
    });
    const [reporte, setReporte] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingEstudiantes, setLoadingEstudiantes] = useState(true);

    // Obtener jornadas y grados únicos dinámicamente
    const jornadas = [...new Set(todosEstudiantes.map(e => e.jornada))].filter(Boolean);
    
    // Grados a excluir
    const gradosExcluidos = ['Kinder', 'Prepa', '1ro Primaria', '2do Primaria', '3ro Primaria'];
    
    // Filtrar grados según la jornada seleccionada
    const grados = [...new Set(
        todosEstudiantes
            .filter(e => {
                if (filtros.jornada) {
                    return e.jornada === filtros.jornada;
                }
                return true;
            })
            .map(e => e.grado)
            .filter(g => g && !gradosExcluidos.includes(g))
    )];

    useEffect(() => {
        cargarEstudiantes();
    }, []);

    const cargarEstudiantes = async () => {
        try {
            setLoadingEstudiantes(true);
            const response = await obtenerEstudiantes();
            // Filtrar para excluir fin de semana, primaria, prepa, kinder y cursos extras
            const estudiantesFiltrados = (response.data.data || []).filter(est => {
                const esFinDeSemana = est.modalidad === 'Fin de semana';
                const esCursoExtra = est.modalidad === 'Curso extra';
                const esNivelExcluido = ['Primaria', 'Prepa', 'Kinder'].includes(est.grado);
                return !esFinDeSemana && !esCursoExtra && !esNivelExcluido;
            });
            setTodosEstudiantes(estudiantesFiltrados);
            setEstudiantes(estudiantesFiltrados);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            toast.error('Error al cargar estudiantes');
        } finally {
            setLoadingEstudiantes(false);
        }
    };

    // Aplicar filtros a la lista de estudiantes
    useEffect(() => {
        let estudiantesFiltrados = [...todosEstudiantes];

        // Filtrar por jornada
        if (filtros.jornada) {
            estudiantesFiltrados = estudiantesFiltrados.filter(e => e.jornada === filtros.jornada);
        }

        // Filtrar por grado
        if (filtros.grado) {
            estudiantesFiltrados = estudiantesFiltrados.filter(e => e.grado === filtros.grado);
        }

        // Filtrar por búsqueda
        if (filtros.busqueda) {
            const busquedaLower = filtros.busqueda.toLowerCase();
            estudiantesFiltrados = estudiantesFiltrados.filter(e =>
                `${e.nombre} ${e.apellidos}`.toLowerCase().includes(busquedaLower)
            );
        }

        setEstudiantes(estudiantesFiltrados);
    }, [filtros, todosEstudiantes]);

    const handleGenerarReporte = async () => {
        if (!estudianteSeleccionado) {
            toast.error('Selecciona un estudiante');
            return;
        }

        try {
            setLoading(true);
            const response = await obtenerReporteAlumno({
                studentId: estudianteSeleccionado,
                fechaInicio: rangoFechas.inicio,
                fechaFin: rangoFechas.fin
            });
            setReporte(response.data);
            toast.success('Reporte generado');
        } catch (error) {
            console.error('Error al generar reporte:', error);
            toast.error('Error al generar reporte');
        } finally {
            setLoading(false);
        }
    };

    const handleExportarPDF = () => {
        if (!reporte) {
            toast.error('Genera un reporte primero');
            return;
        }

        const doc = new jsPDF();
        const estudiante = reporte.estudiante;

        // Título
        doc.setFillColor(30, 58, 138); // blue-900
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORTE DE ASISTENCIAS', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Período: ${rangoFechas.inicio} al ${rangoFechas.fin}`, 105, 30, { align: 'center' });

        // Información del estudiante
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMACIÓN DEL ESTUDIANTE', 14, 55);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        let y = 65;
        doc.text(`Nombre: ${estudiante.nombre} ${estudiante.apellidos}`, 14, y);
        y += 7;
        doc.text(`Grado: ${estudiante.grado}`, 14, y);
        y += 7;
        doc.text(`Jornada: ${estudiante.jornada}`, 14, y);
        y += 7;
        doc.text(`Modalidad: ${estudiante.modalidad}`, 14, y);
        y += 10;
        doc.text(`Encargado: ${estudiante.nombre_encargado}`, 14, y);
        y += 7;
        doc.text(`Teléfono: ${estudiante.telefono_encargado}`, 14, y);

        // Resumen
        y += 15;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN DEL PERÍODO', 14, y);

        y += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        // Tabla de resumen
        const resumenData = [
            ['Asistencias a Tiempo', reporte.resumen.asistencias.toString()],
            ['Llegadas Tarde', reporte.resumen.tardes.toString()],
            ['Ausencias', reporte.resumen.ausencias.toString()],
            ['Total de Días', reporte.resumen.total_dias.toString()],
            ['Rango de Hora de Llegada', reporte.resumen.hora_rango_llegada || reporte.resumen.hora_promedio_llegada || 'N/A']
        ];

        doc.autoTable({
            startY: y,
            head: [['Concepto', 'Valor']],
            body: resumenData,
            theme: 'grid',
            headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            margin: { left: 14, right: 14 }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Generado: ${new Date().toLocaleString('es-GT')}`, 105, 285, { align: 'center' });
            doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
        }

        // Guardar
        doc.save(`Reporte_Asistencias_${estudiante.nombre}_${estudiante.apellidos}.pdf`);
        toast.success('PDF descargado correctamente');
    };

    const estudianteInfo = estudiantes.find(e => e.id === estudianteSeleccionado);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    <i className="bi bi-file-earmark-text mr-3"></i>
                    Reportes por Alumno
                </h1>
                <p className="text-gray-600 mt-1">
                    Consulta y exporta reportes de asistencia individuales
                </p>
            </div>

            {/* Selección y Filtros */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    <i className="bi bi-funnel mr-2"></i>
                    Filtros de Búsqueda
                </h2>

                {/* Filtros superiores */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Filtro Jornada */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Jornada
                            </label>
                            <select
                                value={filtros.jornada}
                                onChange={(e) => {
                                    const nuevaJornada = e.target.value;
                                    setFiltros({...filtros, jornada: nuevaJornada, grado: ''});
                                    setEstudianteSeleccionado('');
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Todas las jornadas</option>
                                {jornadas.map(j => (
                                    <option key={j} value={j}>{j}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro Grado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Grado
                            </label>
                            <select
                                value={filtros.grado}
                                onChange={(e) => {
                                    setFiltros({...filtros, grado: e.target.value});
                                    setEstudianteSeleccionado('');
                                }}
                                disabled={grados.length === 0}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Todos los grados</option>
                                {grados.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro Búsqueda */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Buscar por nombre
                            </label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={filtros.busqueda}
                                onChange={(e) => {
                                    setFiltros({...filtros, busqueda: e.target.value});
                                    setEstudianteSeleccionado('');
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Botón limpiar filtros */}
                    {(filtros.jornada || filtros.grado || filtros.busqueda) && (
                        <div className="mt-4">
                            <button
                                onClick={() => {
                                    setFiltros({ jornada: '', grado: '', busqueda: '' });
                                    setEstudianteSeleccionado('');
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <i className="bi bi-x-circle mr-1"></i>
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>

                {/* Selección de estudiante y fechas */}
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Seleccionar Estudiante y Período</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Selector de estudiante */}
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estudiante {estudiantes.length > 0 && (
                                <span className="text-blue-600">({estudiantes.length} encontrado{estudiantes.length !== 1 ? 's' : ''})</span>
                            )}
                        </label>
                        {loadingEstudiantes ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
                            </div>
                        ) : (
                            <select
                                value={estudianteSeleccionado}
                                onChange={(e) => setEstudianteSeleccionado(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Selecciona un estudiante --</option>
                                {estudiantes.map((est) => (
                                    <option key={est.id} value={est.id}>
                                        {est.nombre} {est.apellidos} - {est.grado} ({est.jornada})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Fecha inicio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Inicio
                        </label>
                        <input
                            type="date"
                            value={rangoFechas.inicio}
                            onChange={(e) => setRangoFechas({...rangoFechas, inicio: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Fecha fin */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Fin
                        </label>
                        <input
                            type="date"
                            value={rangoFechas.fin}
                            onChange={(e) => setRangoFechas({...rangoFechas, fin: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Botón generar */}
                    <div className="flex items-end">
                        <button
                            onClick={handleGenerarReporte}
                            disabled={loading || !estudianteSeleccionado}
                            className="w-full bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-search mr-2"></i>
                                    Generar Reporte
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Información del estudiante seleccionado */}
            {estudianteInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Grado</p>
                            <p className="font-semibold text-gray-800">{estudianteInfo.grado}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Jornada</p>
                            <p className="font-semibold text-gray-800">{estudianteInfo.jornada}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Encargado</p>
                            <p className="font-semibold text-gray-800">{estudianteInfo.nombre_encargado}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Teléfono</p>
                            <p className="font-semibold text-gray-800">{estudianteInfo.telefono_encargado}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Resultados del reporte */}
            {reporte && (
                <>
                    {/* Resumen */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                                <i className="bi bi-bar-chart-fill mr-2"></i>
                                Resumen del Período
                            </h2>
                            <button
                                onClick={handleExportarPDF}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                            >
                                <i className="bi bi-file-earmark-pdf mr-2"></i>
                                Exportar PDF
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-600 text-sm font-medium">A TIEMPO</p>
                                        <p className="text-3xl font-bold text-green-800">{reporte.resumen.asistencias}</p>
                                    </div>
                                    <i className="bi bi-check-circle text-green-500 text-4xl"></i>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-yellow-600 text-sm font-medium">TARDE</p>
                                        <p className="text-3xl font-bold text-yellow-800">{reporte.resumen.tardes}</p>
                                    </div>
                                    <i className="bi bi-clock-history text-yellow-500 text-4xl"></i>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-red-600 text-sm font-medium">AUSENCIAS</p>
                                        <p className="text-3xl font-bold text-red-800">{reporte.resumen.ausencias}</p>
                                    </div>
                                    <i className="bi bi-x-circle text-red-500 text-4xl"></i>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-600 text-sm font-medium">TOTAL DÍAS</p>
                                        <p className="text-3xl font-bold text-blue-800">{reporte.resumen.total_dias}</p>
                                    </div>
                                    <i className="bi bi-calendar3 text-blue-500 text-4xl"></i>
                                </div>
                            </div>
                        </div>

                        {/* Información de rango de llegada */}
                        {(reporte.resumen.hora_rango_llegada || reporte.resumen.hora_promedio_llegada) !== 'N/A' && (
                            <div className="mt-6 grid grid-cols-1 gap-4">
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <i className="bi bi-clock text-purple-500 text-3xl"></i>
                                        <div>
                                            <p className="text-purple-600 text-sm font-medium">RANGO DE HORA DE LLEGADA</p>
                                            <p className="text-2xl font-bold text-purple-800">{reporte.resumen.hora_rango_llegada || reporte.resumen.hora_promedio_llegada}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ReportesAlumno;

