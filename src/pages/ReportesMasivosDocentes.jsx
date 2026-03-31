import { useState, useEffect } from 'react';
import { obtenerDocentes, obtenerReporteDocente } from '../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JSZip from 'jszip';

const ReportesMasivosDocentes = () => {
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
        modalidad: 'todos' // todos, por_jornada
    });

    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generando, setGenerando] = useState(false);
    const [progreso, setProgreso] = useState({ actual: 0, total: 0 });

    // Obtener docentes
    useEffect(() => {
        cargarDocentes();
    }, []);

    const cargarDocentes = async () => {
        try {
            setLoading(true);
            const response = await obtenerDocentes();
            const data = response.docentes || [];
            
            // Filtrar solo docentes activos
            const docentesActivos = data.filter(doc => doc.estado === 'Activo');
            
            setDocentes(docentesActivos);
        } catch (error) {
            console.error('Error al cargar docentes:', error);
            toast.error('Error al cargar docentes');
        } finally {
            setLoading(false);
        }
    };

    // Obtener jornadas únicas
    const jornadas = [...new Set(docentes.map(d => d.jornada))].filter(Boolean).sort();

    // Filtrar docentes según selección
    const docentesFiltrados = docentes.filter(doc => {
        if (filtros.modalidad === 'por_jornada' && filtros.jornada) {
            return doc.jornada === filtros.jornada;
        }
        return true; // todos
    });

    // Generar PDF individual
    const generarPDFIndividual = async (docente, reporteData) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, 210, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Asistencias - Docente', 105, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Sistema de Control Académico', 105, 25, { align: 'center' });

        // Información del docente
        let y = 45;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Información del Docente', 14, y);

        y += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nombre: ${docente.nombre}`, 14, y);
        y += 6;
        doc.text(`Jornada: ${docente.jornada || 'N/A'}`, 14, y);
        y += 6;
        doc.text(`Estado: ${docente.estado || 'N/A'}`, 14, y);

        // Período del reporte
        y += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Período del Reporte', 14, y);
        y += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Desde: ${rangoFechas.inicio}`, 14, y);
        y += 6;
        doc.text(`Hasta: ${rangoFechas.fin}`, 14, y);

        // Tabla de asistencias
        y += 10;
        const asistencias = reporteData.asistencias || [];
        
        if (asistencias.length > 0) {
            const tableData = asistencias.map(asist => [
                asist.fecha,
                asist.hora_entrada || 'N/A'
            ]);

            doc.autoTable({
                startY: y,
                head: [['Fecha', 'Hora de Entrada']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [30, 58, 138],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 3
                },
                columnStyles: {
                    0: { halign: 'center' },
                    1: { halign: 'center' }
                }
            });

            y = doc.lastAutoTable.finalY + 10;
        } else {
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text('No hay registros de asistencia en el período seleccionado', 14, y);
            y += 10;
        }

        // Resumen
        y += 5;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Resumen', 14, y);
        
        y += 8;
        const resumenData = [
            ['Total de días asistidos', `${reporteData.resumen?.total_dias || 0}`]
        ];

        doc.autoTable({
            startY: y,
            head: [['Concepto', 'Valor']],
            body: resumenData,
            theme: 'grid',
            headStyles: {
                fillColor: [30, 58, 138],
                textColor: 255,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 10,
                cellPadding: 3
            }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(128);
            doc.text(
                `Página ${i} de ${pageCount}`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
            doc.text(
                `Generado: ${new Date().toLocaleDateString('es-GT')}`,
                14,
                doc.internal.pageSize.height - 10
            );
        }

        return doc;
    };

    // Generar reportes masivos
    const generarReportesMasivos = async () => {
        if (docentesFiltrados.length === 0) {
            toast.error('No hay docentes para generar reportes');
            return;
        }

        if (!rangoFechas.inicio || !rangoFechas.fin) {
            toast.error('Debe seleccionar un rango de fechas');
            return;
        }

        setGenerando(true);
        setProgreso({ actual: 0, total: docentesFiltrados.length });

        try {
            const zip = new JSZip();
            let exitosos = 0;
            let fallidos = 0;

            // Organizar por jornadas
            const docentesPorJornada = {};
            docentesFiltrados.forEach(doc => {
                const jornada = doc.jornada || 'Sin Jornada';
                if (!docentesPorJornada[jornada]) {
                    docentesPorJornada[jornada] = [];
                }
                docentesPorJornada[jornada].push(doc);
            });

            // Generar PDFs por jornada
            for (const [jornada, docentesJornada] of Object.entries(docentesPorJornada)) {
                const carpetaJornada = zip.folder(jornada);

                for (const docente of docentesJornada) {
                    try {
                        setProgreso(prev => ({ ...prev, actual: prev.actual + 1 }));

                        // Obtener datos del reporte
                        const response = await obtenerReporteDocente(docente.id, {
                            fecha_inicio: rangoFechas.inicio,
                            fecha_fin: rangoFechas.fin
                        });

                        // Generar PDF
                        const pdf = await generarPDFIndividual(docente, response);
                        const pdfBlob = pdf.output('blob');

                        // Agregar al ZIP
                        const nombreArchivo = `${docente.nombre.replace(/[^a-zA-Z0-9\s]/g, '')}.pdf`;
                        carpetaJornada.file(nombreArchivo, pdfBlob);

                        exitosos++;
                    } catch (error) {
                        console.error(`Error al generar PDF para ${docente.nombre}:`, error);
                        fallidos++;
                    }
                }
            }

            // Generar y descargar ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            // Descargar
            const url = window.URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Reportes_Docentes_${rangoFechas.inicio}_a_${rangoFechas.fin}.zip`;
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
        return <div className="flex items-center justify-center h-64">Cargando docentes...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    <i className="bi bi-person-video3 text-blue-600 mr-2"></i>
                    Reportes Masivos - Docentes
                </h1>
                <p className="text-gray-600 mt-1">
                    Genera reportes de asistencia para múltiples docentes en un solo archivo
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
                        onChange={(e) => setFiltros({...filtros, modalidad: e.target.value, jornada: ''})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="todos">Todos los docentes</option>
                        <option value="por_jornada">Por jornada específica</option>
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

                {/* Información de reportes a generar */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <i className="bi bi-bar-chart-fill text-blue-600 mr-2"></i>
                        Se generarán <span className="font-bold">{docentesFiltrados.length}</span> reportes
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                        Los reportes se organizarán en carpetas por jornada
                    </p>
                </div>
            </div>

            {/* Botón de generación */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <button
                    onClick={generarReportesMasivos}
                    disabled={generando || docentesFiltrados.length === 0}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                        generando || docentesFiltrados.length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {generando ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Generando {progreso.actual} de {progreso.total}...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center">
                            <i className="bi bi-file-earmark-arrow-down text-xl mr-2"></i>
                            Generar Reportes Masivos
                        </span>
                    )}
                </button>

                {generando && (
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${(progreso.actual / progreso.total) * 100}%` }}
                            />
                        </div>
                        <p className="text-center text-sm text-gray-600 mt-2">
                            {Math.round((progreso.actual / progreso.total) * 100)}% completado
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportesMasivosDocentes;
