import { useState, useEffect } from 'react'
import { obtenerUltimoUID, registrarAsistencia } from '../services/api'
import toast from 'react-hot-toast'

function RegistrarAsistencia() {
  const [ultimoRegistro, setUltimoRegistro] = useState(null)
  const [escuchando, setEscuchando] = useState(true)
  const [procesando, setProcesando] = useState(false)

  // Polling para detectar UIDs del lector NFC
  useEffect(() => {
    if (!escuchando) return

    const interval = setInterval(async () => {
      try {
        const response = await obtenerUltimoUID()
        if (response.data.detectado && response.data.uid && !procesando) {
          await procesarAsistencia(response.data.uid)
        }
      } catch (err) {
        console.error('Error al obtener UID:', err)
      }
    }, 500) // Cada 0.5 segundos para respuesta más rápida

    return () => clearInterval(interval)
  }, [escuchando, procesando])

  const procesarAsistencia = async (uid) => {
    setProcesando(true)
    try {
      const response = await registrarAsistencia(uid)
      const { tipo, persona, asistencia, tipoPersona, mensaje, detalle } = response.data

      // Caso especial: Fin de semana
      if (tipo === 'fin_de_semana') {
        setUltimoRegistro({
          tipo: 'fin_de_semana',
          tipoPersona: tipoPersona,
          nombre: tipoPersona === 'estudiante' 
            ? `${persona.nombre} ${persona.apellido}` 
            : persona.nombre,
          grado: persona.grado || null,
          jornada: persona.jornada,
          mensaje: mensaje,
          detalle: detalle,
          timestamp: new Date()
        })

        // Limpiar después de 6 segundos
        setTimeout(() => {
          setUltimoRegistro(null)
        }, 6000)

        setProcesando(false)
        return
      }

      // Mostrar registro exitoso normal
      setUltimoRegistro({
        tipo: 'exito',
        tipoPersona: tipo, // 'estudiante' o 'docente'
        nombre: tipo === 'estudiante' 
          ? `${persona.nombre} ${persona.apellido}` 
          : persona.nombre,
        grado: persona.grado || null,
        jornada: persona.jornada,
        hora: asistencia.hora_marcaje,
        estado: tipo === 'estudiante' ? asistencia.estado_asistencia : asistencia.estado,
        timestamp: new Date()
      })

      // Limpiar después de 5 segundos
      setTimeout(() => {
        setUltimoRegistro(null)
      }, 5000)

    } catch (error) {
      console.error('Error al registrar asistencia:', error)
      
      // Casos específicos que no son errores del sistema
      const status = error.response?.status
      const errorMsg = error.response?.data?.error || error.response?.data?.mensaje || error.response?.data?.message || 'Error desconocido'
      const errorData = error.response?.data

      // Caso especial: tarjeta no registrada (404) - no es un error del sistema
      if (status === 404 && errorMsg.includes('no registrada')) {
        setUltimoRegistro({
          tipo: 'no_registrada',
          mensaje: errorMsg,
          timestamp: new Date()
        })

        setTimeout(() => {
          setUltimoRegistro(null)
        }, 5000)

        setProcesando(false)
        return
      }

      // Otros errores
      setUltimoRegistro({
        tipo: 'error',
        tipoPersona: errorData?.tipo || null,
        mensaje: errorMsg,
        persona: errorData?.persona || null,
        timestamp: new Date()
      })

      // Limpiar después de 5 segundos
      setTimeout(() => {
        setUltimoRegistro(null)
      }, 5000)
    } finally {
      // Esperar 3 segundos antes de permitir otra lectura
      setTimeout(() => {
        setProcesando(false)
      }, 3000)
    }
  }

  const formatearHora = (hora) => {
    if (!hora) return ''
    return hora.substring(0, 5) // HH:MM
  }

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'A_TIEMPO':
        return 'bg-green-500'
      case 'TARDE':
        return 'bg-yellow-500'
      case 'AUSENTE':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getEstadoTexto = (estado) => {
    switch(estado) {
      case 'A_TIEMPO':
        return 'A TIEMPO'
      case 'TARDE':
        return 'TARDE'
      case 'AUSENTE':
        return 'AUSENTE'
      default:
        return estado
    }
  }

  const getEstadoIcono = (estado) => {
    switch(estado) {
      case 'A_TIEMPO':
        return <i className="bi bi-check-circle-fill text-green-600"></i>
      case 'TARDE':
        return <i className="bi bi-clock-fill text-yellow-600"></i>
      case 'AUSENTE':
        return <i className="bi bi-x-circle-fill text-red-600"></i>
      default:
        return <i className="bi bi-circle-fill text-gray-400"></i>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex flex-col">
      {/* Header Compacto */}
      <div className="bg-blue-950 text-white py-3 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <i className="bi bi-calendar-check text-blue-900 text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Control de Asistencia</h1>
                <p className="text-blue-200 text-sm">Centro Educativo Tecnológico Innova</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-blue-200 text-sm">
                {new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-5xl">
          
          {/* Estado del Sistema */}
          {!ultimoRegistro && (
            <div className="bg-white rounded-2xl shadow-2xl p-6 text-center">
              <div className="mb-4">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${escuchando ? 'bg-green-100 animate-pulse' : 'bg-gray-100'}`}>
                  <i className={`bi bi-broadcast text-4xl ${escuchando ? 'text-green-600' : 'text-gray-400'}`}></i>
                </div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {escuchando ? (
                  <><i className="bi bi-broadcast"></i> Sistema Listo</>
                ) : (
                  <><i className="bi bi-pause-circle"></i> Sistema en Pausa</>
                )}
              </h2>
              
              <p className="text-lg text-gray-600 mb-4">
                {escuchando ? 'Acerca tu tarjeta al lector NFC' : 'Sistema pausado'}
              </p>

              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">Horarios de Asistencia</h3>
                
                {/* Jornada Matutina */}
                <div className="mb-3 pb-3 border-b border-blue-200">
                  <p className="font-semibold text-blue-800 mb-2 text-xs flex items-center gap-1">
                    <i className="bi bi-sun-fill"></i> Jornada Matutina
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                        <i className="bi bi-check-lg text-white text-sm"></i>
                      </div>
                      <p className="font-semibold text-green-700 text-xs">A TIEMPO</p>
                      <p className="text-gray-600" style={{fontSize: '10px'}}>≤ 7:20 AM</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                        <i className="bi bi-clock text-white text-sm"></i>
                      </div>
                      <p className="font-semibold text-yellow-700 text-xs">TARDE</p>
                      <p className="text-gray-600" style={{fontSize: '10px'}}>7:20 - 7:59</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                        <i className="bi bi-x-lg text-white text-sm"></i>
                      </div>
                      <p className="font-semibold text-red-700 text-xs">AUSENTE</p>
                      <p className="text-gray-600" style={{fontSize: '10px'}}>≥ 8:00 AM</p>
                    </div>
                  </div>
                </div>

                {/* Jornada Vespertina */}
                <div>
                  <p className="font-semibold text-orange-800 mb-2 text-xs flex items-center gap-1">
                    <i className="bi bi-moon-fill"></i> Jornada Vespertina
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                        <i className="bi bi-check-lg text-white text-sm"></i>
                      </div>
                      <p className="font-semibold text-green-700 text-xs">A TIEMPO</p>
                      <p className="text-gray-600" style={{fontSize: '10px'}}>≤ 1:20 PM</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                        <i className="bi bi-clock text-white text-sm"></i>
                      </div>
                      <p className="font-semibold text-yellow-700 text-xs">TARDE</p>
                      <p className="text-gray-600" style={{fontSize: '10px'}}>1:20 - 2:00</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                        <i className="bi bi-x-lg text-white text-sm"></i>
                      </div>
                      <p className="font-semibold text-red-700 text-xs">AUSENTE</p>
                      <p className="text-gray-600" style={{fontSize: '10px'}}>≥ 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEscuchando(!escuchando)}
                className={`px-6 py-2 rounded-xl font-semibold text-base transition-all inline-flex items-center gap-2 ${
                  escuchando 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <i className={`bi ${escuchando ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
                {escuchando ? 'Pausar Sistema' : 'Reanudar Sistema'}
              </button>
            </div>
          )}

          {/* Resultado de Registro */}
          {ultimoRegistro && ultimoRegistro.tipo === 'exito' && (
            <div className={`rounded-2xl shadow-2xl p-6 text-center ${getEstadoColor(ultimoRegistro.estado)}`}>
              <div className="mb-3">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
                  ultimoRegistro.estado === 'TARDE' ? 'bg-white' : 'bg-white bg-opacity-30'
                }`}>
                  <i className={`text-5xl ${
                    ultimoRegistro.estado === 'A_TIEMPO' ? 'bi bi-check-circle-fill text-green-600' :
                    ultimoRegistro.estado === 'TARDE' ? 'bi bi-clock-fill text-yellow-600' :
                    'bi bi-x-circle-fill text-red-600'
                  }`}></i>
                </div>
              </div>

              <div className="mb-3">
                <div className={`inline-block px-4 py-2 rounded-full ${
                  ultimoRegistro.estado === 'TARDE' 
                    ? 'bg-white text-yellow-800'
                    : ultimoRegistro.estado === 'AUSENTE'
                    ? 'bg-white text-red-800'
                    : 'bg-white bg-opacity-20 text-white'
                }`}>
                  <p className="text-xl font-bold">{getEstadoTexto(ultimoRegistro.estado)}</p>
                </div>
              </div>

              {/* Badge de tipo */}
              <div className="mb-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                  ultimoRegistro.estado === 'TARDE'
                    ? 'bg-white text-yellow-800'
                    : ultimoRegistro.estado === 'AUSENTE'
                    ? 'bg-white text-red-800'
                    : 'bg-white bg-opacity-30 text-white'
                }`}>
                  <i className={`bi ${ultimoRegistro.tipoPersona === 'docente' ? 'bi-person-workspace' : 'bi-mortarboard-fill'}`}></i>
                  {ultimoRegistro.tipoPersona === 'docente' ? 'DOCENTE' : 'ESTUDIANTE'}
                </span>
              </div>

              <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${
                ultimoRegistro.estado === 'TARDE' || ultimoRegistro.estado === 'AUSENTE' ? 'text-gray-900' : 'text-white'
              }`}>
                {ultimoRegistro.nombre}
              </h2>

              <div className={`text-lg mb-4 ${
                ultimoRegistro.estado === 'TARDE' || ultimoRegistro.estado === 'AUSENTE' ? 'text-gray-800' : 'text-white opacity-90'
              }`}>
                {ultimoRegistro.grado && (
                  <p className="flex items-center justify-center gap-2">
                    <i className="bi bi-bookmark-fill"></i> {ultimoRegistro.grado}
                  </p>
                )}
                <p className="flex items-center justify-center gap-2">
                  <i className="bi bi-sun-fill"></i> Jornada {ultimoRegistro.jornada}
                </p>
              </div>

              <div className={`rounded-xl p-4 inline-block ${
                ultimoRegistro.estado === 'TARDE' || ultimoRegistro.estado === 'AUSENTE'
                  ? 'bg-white text-gray-900'
                  : 'bg-white bg-opacity-20 text-white'
              }`}>
                <p className="text-sm mb-1 flex items-center justify-center gap-2">
                  <i className="bi bi-alarm"></i> Hora de Marcaje
                </p>
                <p className="text-4xl font-bold">{formatearHora(ultimoRegistro.hora)}</p>
              </div>

              {ultimoRegistro.estado === 'A_TIEMPO' && (
                <div className="mt-4">
                  <p className="text-xl font-semibold text-white flex items-center justify-center gap-2">
                    <i className="bi bi-trophy-fill"></i> ¡Excelente puntualidad!
                  </p>
                </div>
              )}

              {ultimoRegistro.estado === 'TARDE' && (
                <div className="mt-4">
                  <p className="text-lg text-gray-900 font-semibold flex items-center justify-center gap-2">
                    <i className="bi bi-exclamation-triangle-fill"></i> Procura llegar más temprano
                  </p>
                </div>
              )}

              {ultimoRegistro.estado === 'AUSENTE' && (
                <div className="mt-4">
                  <p className="text-lg text-gray-900 font-semibold flex items-center justify-center gap-2">
                    <i className="bi bi-exclamation-circle-fill"></i> Llegaste después del horario permitido
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {ultimoRegistro && ultimoRegistro.tipo === 'error' && (
            <div className={`rounded-2xl shadow-2xl p-6 text-center ${
              ultimoRegistro.mensaje.includes('Ya se registró') 
                ? 'bg-orange-500' 
                : 'bg-red-500'
            }`}>
              <div className="mb-3">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full">
                  <i className={`text-5xl ${
                    ultimoRegistro.mensaje.includes('Ya se registró')
                      ? 'bi bi-check-circle-fill text-orange-500'
                      : 'bi bi-exclamation-triangle-fill text-red-500'
                  }`}></i>
                </div>
              </div>

              {ultimoRegistro.mensaje.includes('Ya se registró') ? (
                <>
                  {/* Badge de tipo */}
                  {ultimoRegistro.tipoPersona && (
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm font-semibold text-orange-700">
                        <i className={`bi ${ultimoRegistro.tipoPersona === 'docente' ? 'bi-person-workspace' : 'bi-mortarboard-fill'}`}></i>
                        {ultimoRegistro.tipoPersona === 'docente' ? 'DOCENTE' : 'ESTUDIANTE'}
                      </span>
                    </div>
                  )}

                  <h2 className="text-2xl font-bold mb-3 text-white flex items-center justify-center gap-2">
                    <i className="bi bi-check-circle-fill"></i> Asistencia Ya Registrada
                  </h2>

                  {ultimoRegistro.persona && (
                    <div className="bg-white rounded-xl p-4 mb-3">
                      <p className="text-xl font-bold text-gray-800 mb-1">
                        {ultimoRegistro.tipoPersona === 'docente'
                          ? ultimoRegistro.persona.nombre
                          : `${ultimoRegistro.persona.nombre} ${ultimoRegistro.persona.apellido || ''}`
                        }
                      </p>
                      {ultimoRegistro.persona.grado && (
                        <p className="text-gray-600 text-sm flex items-center justify-center gap-1">
                          <i className="bi bi-bookmark-fill"></i> {ultimoRegistro.persona.grado}
                        </p>
                      )}
                      <p className="text-gray-600 text-sm flex items-center justify-center gap-1">
                        <i className="bi bi-sun-fill"></i> Jornada {ultimoRegistro.persona.jornada}
                      </p>
                    </div>
                  )}

                  <div className="bg-white rounded-xl p-4 mb-3">
                    <p className="text-base font-bold text-gray-800 mb-1 flex items-center justify-center gap-2">
                      <i className="bi bi-info-circle-fill"></i> Tu asistencia ya fue registrada hoy
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date().toLocaleDateString('es-GT', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <p className="text-base text-gray-700 font-semibold mb-1 flex items-center justify-center gap-2">
                      <i className="bi bi-calendar-plus"></i> Próximo registro disponible
                    </p>
                    <p className="text-sm text-gray-600">
                      Podrás marcar asistencia nuevamente mañana
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-3 text-white flex items-center justify-center gap-2">
                    <i className="bi bi-exclamation-triangle-fill"></i> ERROR
                  </h2>

                  <div className="bg-white rounded-xl p-4 mb-3">
                    <p className="text-lg font-bold text-gray-800">{ultimoRegistro.mensaje}</p>
                  </div>

                  {ultimoRegistro.mensaje.includes('no está registrada') && (
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-base text-gray-700 font-semibold mb-1 flex items-center justify-center gap-2">
                        <i className="bi bi-credit-card-2-front"></i> Esta tarjeta no está asignada
                      </p>
                      <p className="text-sm text-gray-600">
                        Contacta al administrador para asignarla
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Fin de Semana */}
          {ultimoRegistro && ultimoRegistro.tipo === 'fin_de_semana' && (
            <div className="rounded-2xl shadow-2xl p-6 text-center bg-gradient-to-br from-blue-500 to-blue-600">
              <div className="mb-3">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full">
                  <i className="bi bi-calendar-x text-5xl text-blue-600"></i>
                </div>
              </div>

              {/* Badge de tipo */}
              <div className="mb-3">
                <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-700">
                  <i className={`bi ${ultimoRegistro.tipoPersona === 'docente' ? 'bi-person-workspace' : 'bi-mortarboard-fill'}`}></i>
                  {ultimoRegistro.tipoPersona === 'docente' ? 'DOCENTE' : 'ESTUDIANTE'}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                {ultimoRegistro.nombre}
              </h2>

              {ultimoRegistro.grado && (
                <p className="text-white opacity-90 mb-1 flex items-center justify-center gap-2">
                  <i className="bi bi-bookmark-fill"></i> {ultimoRegistro.grado}
                </p>
              )}
              <p className="text-white opacity-90 mb-4 flex items-center justify-center gap-2">
                <i className="bi bi-sun-fill"></i> Jornada {ultimoRegistro.jornada}
              </p>

              <div className="bg-white rounded-xl p-5 mb-3">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <i className="bi bi-calendar-week text-4xl text-blue-600"></i>
                </div>
                <p className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                  <i className="bi bi-info-circle-fill text-blue-600"></i>
                  {ultimoRegistro.mensaje}
                </p>
                <p className="text-base text-gray-600">
                  {ultimoRegistro.detalle}
                </p>
              </div>

              <div className="bg-blue-700 bg-opacity-50 rounded-xl p-4">
                <p className="text-white font-semibold mb-2 flex items-center justify-center gap-2">
                  <i className="bi bi-calendar-check"></i> Registro de Asistencias
                </p>
                <p className="text-blue-100 text-sm">
                  Las asistencias se registran de <span className="font-bold">Lunes a Viernes</span>
                </p>
                <p className="text-blue-100 text-sm mt-1">
                  ¡Disfruta tu fin de semana! 🎉
                </p>
              </div>
            </div>
          )}

          {/* Tarjeta No Registrada */}
          {ultimoRegistro && ultimoRegistro.tipo === 'no_registrada' && (
            <div className="rounded-2xl shadow-2xl p-6 text-center bg-gradient-to-br from-gray-600 to-gray-700">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full">
                  <i className="bi bi-credit-card-2-front text-6xl text-gray-600"></i>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-4 text-white flex items-center justify-center gap-2">
                <i className="bi bi-exclamation-circle"></i>
                Tarjeta No Registrada
              </h2>

              <div className="bg-white rounded-xl p-6 mb-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <i className="bi bi-shield-x text-5xl text-gray-600"></i>
                </div>
                <p className="text-xl font-bold text-gray-800 mb-2">
                  Esta tarjeta no está asignada
                </p>
                <p className="text-base text-gray-600">
                  {ultimoRegistro.mensaje}
                </p>
              </div>

              <div className="bg-gray-800 bg-opacity-50 rounded-xl p-5">
                <p className="text-white font-semibold mb-3 flex items-center justify-center gap-2">
                  <i className="bi bi-info-circle-fill"></i> ¿Qué hacer?
                </p>
                <div className="space-y-2 text-left text-gray-100">
                  <p className="flex items-start gap-2">
                    <i className="bi bi-1-circle-fill text-xl"></i>
                    <span>Contacta al administrador del sistema</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <i className="bi bi-2-circle-fill text-xl"></i>
                    <span>Solicita que te asignen una tarjeta NFC</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <i className="bi bi-3-circle-fill text-xl"></i>
                    <span>Una vez asignada podrás registrar asistencia</span>
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Compacto */}
      <div className="bg-blue-950 text-white py-2 text-center">
        <p className="text-xs opacity-75 flex items-center justify-center gap-2">
          <i className="bi bi-shield-check"></i> Sistema de Control de Asistencia • Centro Educativo Tecnológico Innova 2026
        </p>
      </div>
    </div>
  )
}

export default RegistrarAsistencia
