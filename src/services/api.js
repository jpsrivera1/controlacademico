import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://backgeneralsistemaceti.onrender.com/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Estudiantes (solo para listado en asignación de tarjetas)
export const obtenerEstudiantes = () => api.get('/estudiantes')
export const obtenerEstudiante = (id) => api.get(`/estudiantes/${id}`)

// Asistencias NFC
export const asignarUID = (studentId, uid_tarjeta) => api.put(`/asistencias/estudiante/${studentId}/uid`, { uid_tarjeta })
export const obtenerUltimoUID = () => api.get('/asistencias/ultimo-uid')
export const obtenerEstudiantePorUID = (uid) => api.get(`/asistencias/uid/${uid}`)
export const registrarAsistencia = (uid_tarjeta) => api.post('/asistencias/marcar', { uid_tarjeta })
export const obtenerAsistencias = (fecha) => api.get('/asistencias', { params: { fecha } })
export const obtenerHistorialEstudiante = (studentId, mes, anio) => api.get(`/asistencias/estudiante/${studentId}/historial`, { params: { mes, anio } })

// Docentes
export const registrarDocente = (data) => api.post('/docentes', data).then(res => res.data)
export const obtenerDocentes = (params) => api.get('/docentes', { params }).then(res => res.data)
export const obtenerDocente = (id) => api.get(`/docentes/${id}`).then(res => res.data)
export const obtenerDocentePorUID = (uid) => api.get(`/docentes/uid/${uid}`).then(res => res.data)
export const asignarUIDDocente = (docenteId, uid_tarjeta) => api.put(`/docentes/${docenteId}/uid`, { uid_tarjeta }).then(res => res.data)
export const actualizarEstadoDocente = (docenteId, estado) => api.put(`/docentes/${docenteId}/estado`, { estado }).then(res => res.data)

// Autenticación
export const login = (credentials) => api.post('/auth/login', credentials)
export const logout = () => api.post('/auth/logout')

// Panel del día
export const obtenerPanelDia = () => api.get('/reportes/panel-dia')
export const enviarWhatsApp = (data) => api.post('/reportes/enviar-whatsapp', data)

// Reportes por alumno
export const obtenerReporteAlumno = (params) => api.get('/reportes/alumno', { params })
export const generarPDFReporte = (params) => api.get('/reportes/alumno/pdf', { params, responseType: 'blob' })

// Asistencias de docentes
export const registrarAsistenciaDocente = (docente_id) => api.post('/asistencias-docentes/marcar', { docente_id })
export const obtenerAsistenciasDocentes = (params) => api.get('/asistencias-docentes', { params })
export const obtenerReporteDocente = (id, params) => api.get(`/asistencias-docentes/docente/${id}`, { params })

export default api
