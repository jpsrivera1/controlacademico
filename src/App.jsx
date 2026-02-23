import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import RegistrarAsistencia from './pages/RegistrarAsistencia'
import AsignarUID from './pages/AsignarUID'
import RegistrarDocente from './pages/RegistrarDocente'
import ListaDocentes from './pages/ListaDocentes'
import PanelDia from './pages/PanelDia'
import ReportesAlumno from './pages/ReportesAlumno'
import ReportesMasivos from './pages/ReportesMasivos'

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user')
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })

  useEffect(() => {
    // Verificar autenticación al montar y cuando cambie el localStorage
    const checkAuth = () => {
      const user = localStorage.getItem('user')
      setIsAuthenticated(!!user)
    }

    checkAuth()

    // Escuchar cambios en localStorage (útil para múltiples pestañas)
    window.addEventListener('storage', checkAuth)
    
    // Revisar cambios en el sidebar collapse
    const interval = setInterval(() => {
      const saved = localStorage.getItem('sidebarCollapsed')
      setIsCollapsed(saved === 'true')
    }, 100)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
      clearInterval(interval)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    window.location.href = '/login'
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        {isAuthenticated && <Navbar onLogout={handleLogout} />}
        
        {/* Contenedor principal con margen para el sidebar si está autenticado */}
        <div className={isAuthenticated ? (isCollapsed ? 'ml-16 transition-all duration-300' : 'ml-64 transition-all duration-300') : ''}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/registrar-asistencia" element={<ProtectedRoute><RegistrarAsistencia /></ProtectedRoute>} />
            <Route path="/asignar-tarjeta" element={<ProtectedRoute><AsignarUID /></ProtectedRoute>} />
            <Route path="/registrar-docente" element={<ProtectedRoute><RegistrarDocente /></ProtectedRoute>} />
            <Route path="/docentes" element={<ProtectedRoute><ListaDocentes /></ProtectedRoute>} />
            <Route path="/panel-dia" element={<ProtectedRoute><PanelDia /></ProtectedRoute>} />
            <Route path="/reportes-alumno" element={<ProtectedRoute><ReportesAlumno /></ProtectedRoute>} />
            <Route path="/reportes-masivos" element={<ProtectedRoute><ReportesMasivos /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
