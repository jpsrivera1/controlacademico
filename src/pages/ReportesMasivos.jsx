import { useState, useEffect } from 'react';
import { obtenerEstudiantes, obtenerReporteAlumno } from '../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JSZip from 'jszip';

const ReportesMasivos = () => {
    const getGuatemalaDate = () => {
        const now = new Date();
        return new Date(now.toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
    };

    const guatemalaDate = getGuatemalaDate();
    const [rangoFechas, setRangoFechas] = useState({
        inicio: new Date(guatemalaDate.getFullYear(), guatemalaDate.getMonth(), 1).toISOString().split('T')[0],
        fin: guatemalaDate.toISOString().split('T')[0]
    });
    
    const [filtros, setFiltros] = useState({
        jornada: '',
        grado: '',
        modalidad: 'todos' // todos, por_jornada, por_grado
    });

    const [estudiantes, setEstudiantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generando, setGenerando] = useState(false);
    const [progreso, setProgreso] = useState({ actual: 0, total: 0 });

    // Obtener estudiantes
    useEffect(() => {
        cargarEstudiantes();
    }, []);

    const cargarEstudiantes = async () => {
        try {
            setLoading(true);
            const response = await obtenerEstudiantes();
            const data = response.data.data || []; // Acceder a response.data.data
            
            // Filtrar estudiantes excluyendo las categorías no deseadas
            const estudiantesFiltrados = data.filter(est => 
                est.modalidad !== 'Fin de semana' &&
                est.modalidad !== 'Curso extra' &&
                !['Kinder', 'Prepa', '1ero Primaria', '2do Primaria', '3ro Primaria'].includes(est.grado)
            );
            
            setEstudiantes(estudiantesFiltrados);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            toast.error('Error al cargar estudiantes');
        } finally {
            setLoading(false);
        }
    };

    // Obtener jornadas y grados únicos
    const jornadas = [...new Set(estudiantes.map(e => e.jornada))].filter(Boolean).sort();
    const grados = [...new Set(estudiantes.map(e => e.grado))]
        .filter(grado => grado && !['1ro Primaria', '2do Primaria', '3ro Primaria'].includes(grado))
        .sort();

    // Filtrar estudiantes según selección
    const estudiantesFiltrados = estudiantes.filter(est => {
        if (filtros.modalidad === 'por_jornada' && filtros.jornada) {
            return est.jornada === filtros.jornada;
        }
        if (filtros.modalidad === 'por_grado' && filtros.grado) {
            return est.grado === filtros.grado;
        }
        return true; // todos
    });

    // Generar PDF individual
    const generarPDFIndividual = async (estudiante, reporteData) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, 210, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Asistencias', 105, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Sistema de Control Académico', 105, 25, { align: 'center' });

        // Información del estudiante
        let y = 45;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Información del Estudiante', 14, y);

        y += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nombre: ${estudiante.nombre} ${estudiante.apellidos}`, 14, y);
        y += 6;
        doc.text(`Grado: ${estudiante.grado || 'N/A'}`, 14, y);
        y += 6;
        doc.text(`Jornada: ${estudiante.jornada || 'N/A'}`, 14, y);

        // Período
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('Período de Reporte', 14, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`Del ${rangoFechas.inicio} al ${rangoFechas.fin}`, 14, y);

        // Resumen de asistencias
        y += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumen de Asistencias', 14, y);

        y += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        const resumenData = [
            ['Asistencias a Tiempo', reporteData.resumen.asistencias.toString()],
            ['Llegadas Tarde', reporteData.resumen.tardes.toString()],
            ['Ausencias', reporteData.resumen.ausencias.toString()],
            ['Total de Días', reporteData.resumen.total_dias.toString()],
            ['Hora Promedio de Llegada', reporteData.resumen.hora_promedio_llegada || 'N/A'],
            ['Evaluación', reporteData.resumen.rango_promedio || 'N/A']
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
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generado: ${new Date().toLocaleString('es-GT')}`, 105, 285, { align: 'center' });
        doc.text('Página 1 de 1', 105, 290, { align: 'center' });

        return doc.output('blob');
    };

    // Generar reportes masivos
    const generarReportesMasivos = async () => {
        if (estudiantesFiltrados.length === 0) {
            toast.error('No hay estudiantes para generar reportes');
            return;
        }

        setGenerando(true);
        setProgreso({ actual: 0, total: estudiantesFiltrados.length });

        try {
            const zip = new JSZip();
            let exitosos = 0;
            let fallidos = 0;

            for (let i = 0; i < estudiantesFiltrados.length; i++) {
                const estudiante = estudiantesFiltrados[i];
                
                try {
                    // Obtener reporte del estudiante
                    const response = await obtenerReporteAlumno({
                        studentId: estudiante.id,
                        fechaInicio: rangoFechas.inicio,
                        fechaFin: rangoFechas.fin
                    });
                    const reporteData = response.data;

                    // Generar PDF
                    const pdfBlob = await generarPDFIndividual(estudiante, reporteData);

                    // Organizar en carpetas: Jornada/Grado/Nombre.pdf
                    const jornadaSafe = (estudiante.jornada || 'Sin_Jornada').replace(/[^a-zA-Z0-9]/g, '_');
                    const gradoSafe = (estudiante.grado || 'Sin_Grado').replace(/[^a-zA-Z0-9]/g, '_');
                    const nombreSafe = `${estudiante.nombre}_${estudiante.apellidos}`.replace(/[^a-zA-Z0-9]/g, '_');
                    
                    const rutaArchivo = `${jornadaSafe}/${gradoSafe}/${nombreSafe}.pdf`;
                    zip.file(rutaArchivo, pdfBlob);

                    exitosos++;
                } catch (error) {
                    console.error(`Error al generar reporte para ${estudiante.nombre}:`, error);
                    fallidos++;
                }

                // Actualizar progreso
                setProgreso({ actual: i + 1, total: estudiantesFiltrados.length });
            }

            // Generar archivo ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            // Descargar
            const url = window.URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Reportes_Asistencias_${rangoFechas.inicio}_a_${rangoFechas.fin}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Reportes generados: ${exitosos} exitosos${fallidos > 0 ? `, ${fallidos} fallidos` : ''}`);
        } catch (error) {
            console.error('Error al generar reportes masivos:', error);
            toast.error('Error al generar reportes masivos');
        } finally {
            setGenerando(false);
            setProgreso({ actual: 0, total: 0 });
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64">Cargando estudiantes...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    <i className="bi bi-archive-fill text-blue-600 mr-2"></i>
                    Reportes Masivos
                </h1>
                <p className="text-gray-600 mt-1">
                    Genera reportes de asistencia para múltiples estudiantes en un solo archivo
                </p>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Configuración de Reportes</h2>
                
                {/* Rango de fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Inicio
                        </label>
                        <input
                            type="date"
                            value={rangoFechas.inicio}
                            onChange={(e) => setRangoFechas({...rangoFechas, inicio: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Fin
                        </label>
                        <input
                            type="date"
                            value={rangoFechas.fin}
                            onChange={(e) => setRangoFechas({...rangoFechas, fin: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Modalidad de generación */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Generar reportes para:
                    </label>
                    <select
                        value={filtros.modalidad}
                        onChange={(e) => setFiltros({...filtros, modalidad: e.target.value, jornada: '', grado: ''})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="todos">Todos los estudiantes</option>
                        <option value="por_jornada">Por jornada específica</option>
                        <option value="por_grado">Por grado específico</option>
                    </select>
                </div>

                {/* Filtro de jornada */}
                {filtros.modalidad === 'por_jornada' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Jornada
                        </label>
                        <select
                            value={filtros.jornada}
                            onChange={(e) => setFiltros({...filtros, jornada: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccione una jornada</option>
                            {jornadas.map(j => (
                                <option key={j} value={j}>{j}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Filtro de grado */}
                {filtros.modalidad === 'por_grado' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Grado
                        </label>
                        <select
                            value={filtros.grado}
                            onChange={(e) => setFiltros({...filtros, grado: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccione un grado</option>
                            {grados.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Información de estudiantes */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <p className="text-blue-800 font-medium">
                        📊 Se generarán {estudiantesFiltrados.length} reportes
                    </p>
                    <p className="text-blue-600 text-sm mt-1">
                        Organizados en carpetas por Jornada → Grado → Nombre del estudiante
                    </p>
                </div>

                {/* Botón de generación */}
                <button
                    onClick={generarReportesMasivos}
                    disabled={generando || estudiantesFiltrados.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {generando ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Generando reportes...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center">
                            <i className="bi bi-file-earmark-arrow-down text-xl mr-2"></i>
                            Generar Reportes Masivos
                        </span>
                    )}
                </button>

                {/* Barra de progreso */}
                {generando && (
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Generando reportes...</span>
                            <span>{progreso.actual} / {progreso.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                                style={{ width: `${(progreso.actual / progreso.total) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-2">
                            {Math.round((progreso.actual / progreso.total) * 100)}% completado
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportesMasivos;
