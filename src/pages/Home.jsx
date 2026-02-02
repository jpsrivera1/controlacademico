import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <i className="bi bi-mortarboard-fill text-5xl text-blue-600"></i>
            <h1 className="text-4xl font-bold text-gray-800">
              Control Académico
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Sistema de Gestión de Asistencias y Docentes
          </p>
        </div>

        {/* Tarjetas Principales - Asistencia y Asignación */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          {/* Registrar Asistencia */}
          <Link
            to="/registrar-asistencia"
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-green-500"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="bi bi-calendar-check text-3xl text-green-600"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Registrar Asistencia
                  </h2>
                  <p className="text-gray-600">
                    Marca la asistencia de estudiantes y docentes acercando su tarjeta NFC al lector
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <span>Iniciar registro</span>
                <i className="bi bi-arrow-right"></i>
              </div>
            </div>
          </Link>

          {/* Asignar Tarjetas */}
          <Link
            to="/asignar-tarjeta"
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="bi bi-credit-card text-3xl text-blue-600"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Asignar Tarjetas NFC
                  </h2>
                  <p className="text-gray-600">
                    Vincula tarjetas NFC a estudiantes o docentes para el control de asistencias
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <span>Gestionar tarjetas</span>
                <i className="bi bi-arrow-right"></i>
              </div>
            </div>
          </Link>
        </div>

        {/* Sección de Docentes */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <i className="bi bi-person-badge text-orange-600"></i>
            Gestión de Docentes
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Registrar Docente */}
            <Link
              to="/registrar-docente"
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-orange-500"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="bi bi-person-plus text-3xl text-orange-600"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Registrar Docente
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Agrega un nuevo docente al sistema
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Ver Docentes */}
            <Link
              to="/docentes"
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="bi bi-people text-3xl text-purple-600"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Ver Docentes
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Consulta y administra los registros de docentes
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>


      </div>
    </div>
  )
}

export default Home
