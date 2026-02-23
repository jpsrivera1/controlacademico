import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Navbar({ onLogout }) {
  const location = useLocation()
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'))
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed)
  }, [isCollapsed])
  
  const isActive = (path) => {
    return location.pathname === path
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const menuItems = [
    { 
      section: 'Sistema NFC',
      items: [
        { path: '/', icon: 'bi-house-door-fill', label: 'Inicio' },
        { path: '/registrar-asistencia', icon: 'bi-calendar-check-fill', label: 'Registrar Asistencia' },
        { path: '/asignar-tarjeta', icon: 'bi-credit-card-fill', label: 'Asignar Tarjetas' },
      ]
    },
    {
      section: 'Reportes',
      items: [
        { path: '/panel-dia', icon: 'bi-calendar-day', label: 'Panel del Día' },
        { path: '/reportes-alumno', icon: 'bi-file-earmark-text', label: 'Reportes por Alumno' },
        { path: '/reportes-masivos', icon: 'bi-archive', label: 'Reportes Masivos' },
      ]
    },
    {
      section: 'Docentes',
      items: [
        { path: '/registrar-docente', icon: 'bi-person-plus-fill', label: 'Registrar Docente' },
        { path: '/docentes', icon: 'bi-people-fill', label: 'Ver Docentes' },
      ]
    }
  ]

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-blue-900 text-white shadow-2xl z-50 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header del Sidebar - Compacto */}
      <div className="p-4 border-b border-blue-800 flex-shrink-0">
        <button
          onClick={toggleSidebar}
          className="mb-2 p-2 rounded-lg hover:bg-blue-800 transition-colors w-full flex justify-end"
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <i className={`bi ${isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'} text-xl`}></i>
        </button>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <i className="bi bi-mortarboard-fill text-3xl text-white"></i>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Control Académico</h1>
              <p className="text-xs text-blue-200">Sistema NFC</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <i className="bi bi-mortarboard-fill text-2xl text-white"></i>
          </div>
        )}
      </div>

      {/* Usuario actual - Compacto */}
      {user.username && (
        <div className="px-4 py-2 bg-blue-800 flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <i className="bi bi-person-circle text-xl text-white"></i>
              <div className="text-sm">
                <p className="font-medium text-white">{user.username}</p>
                <p className="text-xs text-blue-200">Usuario activo</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center">
              <i className="bi bi-person-circle text-xl text-white"></i>
            </div>
          )}
        </div>
      )}

      {/* Menú de Navegación - Sin scroll */}
      <nav className="px-3 py-2 flex-1 overflow-hidden">
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-3">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider px-3 mb-1">
                {section.section}
              </h3>
            )}
            {isCollapsed && idx > 0 && (
              <div className="border-t border-blue-700 my-2"></div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActive(item.path)
                        ? 'bg-blue-700 text-white shadow-lg'
                        : 'text-white hover:bg-blue-800'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <i className={`${item.icon} text-base`}></i>
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Botón de cerrar sesión y Footer - Compacto */}
      <div className="flex-shrink-0 border-t border-blue-800">
        <div className="p-3">
          <button
            onClick={onLogout}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all ${
              isCollapsed ? 'px-2' : ''
            }`}
            title={isCollapsed ? 'Cerrar Sesión' : ''}
          >
            <i className="bi bi-box-arrow-right text-base"></i>
            {!isCollapsed && <span className="text-sm font-medium">Cerrar Sesión</span>}
          </button>
        </div>

        {/* Footer del Sidebar */}
        {!isCollapsed && (
          <div className="px-3 py-2 bg-blue-900">
            <div className="text-center">
              <p className="text-xs text-blue-200">© 2026 CETI</p>
              <p className="text-xs text-blue-100">Sistema NFC v2.0</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Navbar
