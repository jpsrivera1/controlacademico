# Sistema de Control Académico con NFC

Sistema completo para el registro y control de asistencias mediante tecnología NFC con módulos de reportería y notificaciones para el Centro Educativo Tecnológico Innova.

## 🚀 Características

- ✅ **Registro de Asistencia en Tiempo Real** - Marcaje instantáneo con tarjetas NFC
- 🎯 **Detección Automática** - El sistema detecta automáticamente si es estudiante o docente
- ⏰ **Horarios Diferenciados** - Diferentes horarios para jornadas matutina y vespertina
- 👥 **Multi-usuario** - Soporta estudiantes y docentes
- 📊 **Estados de Asistencia** - A tiempo, tarde, y ausente según horarios configurados
- 🔒 **Asignación de Tarjetas** - Interfaz para vincular tarjetas NFC a usuarios
- 📅 **Panel del Día** - Vista consolidada de ausentes y tardes con notificaciones WhatsApp
- 📑 **Reportes Individuales** - Generación de reportes PDF por estudiante
- 🔐 **Sistema de Autenticación** - Login con usuarios de base de datos

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Backend del sistema ejecutándose en `http://localhost:3000`
- Lector NFC ACR1552U (o compatible)

## 🛠️ Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` si es necesario (por defecto apunta a `http://localhost:3000/api`)

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

El sistema estará disponible en `http://localhost:5174`

## 📱 Módulos del Sistema

### 🔐 Login
- Autenticación con usuarios de base de datos
- Protección de rutas privadas
- Sesión persistente en localStorage

### 3. Panel del Día 📅 **[NUEVO]**
- Vista consolidada de ausentes y estudiantes que llegaron tarde
- Filtros por jornada, grado, modalidad y búsqueda por nombre
- Envío de notificaciones WhatsApp individuales a encargados
- Estado de envío (enviado/no enviado) con hora registrada
- Actualización en tiempo real

### 4. Reportes por Alumno 📑 **[NUEVO]**
- Selección de estudiante con información completa
- Rango de fechas personalizable (mes actual por defecto)
- Resumen visual: asistencias, tardes, ausencias
- Detalle día por día del período seleccionado
- Exportación a PDF profesional con logo institucional

### 5. Registrar Docente
- Formulario completo de registro de docentes
- Asignación de especialidades
- Gestión de estados activo/inactivo

### 6. Ver Docentes
- Lista completa de docentes
- Búsqueda y filtros
- Control de asistencias docentes

## ⏰ Horarios de Asistencia

### Jornada Matutina
- **A TIEMPO**: ≤ 7:20 AM
- **TARDE**: 7:20 AM - 7:59 AM
- **AUSENTE**: ≥ 8:00 AM

### Jornada Vespertina (Estudiantes)
- **A TIEMPO**: ≤ 1:20 PM
- **TARDE**: 1:20 PM - 2:00 PM
- **AUSENTE**: ≥ 2:00 PM

### Docentes Vespertina
- **A TIEMPO**: ≤ 1:10 PM
- **TARDE**: > 1:10 PM

## 🎨 Tecnologías Utilizadas

- **React 19** - Framework de UI
- **Vite 7** - Build tool y dev server
- **React Router 7** - Enrutamiento
- **TailwindCSS 4** - Estilos y diseño responsive
- **Axios** - Cliente HTTP
- **Bootstrap Icons** - Iconografía
- **React Hot Toast** - Notificaciones
- **jsPDF** - Generación de reportes PDF
- **jsPDF AutoTable** - Tablas en PDFs

## 📦 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Vista previa de producción
```

## 🔧 Configuración del Backend

Este proyecto requiere el backend del sistema principal ejecutándose. Asegúrate de que el servidor backend esté corriendo en `http://localhost:3000` con los siguientes endpoints disponibles:

### Asistencias
- `GET /api/asistencias/ultimo-uid` - Obtener último UID detectado
- `POST /api/asistencias/marcar` - Registrar asistencia
- `GET /api/estudiantes` - Listar estudiantes

### Reportes **[NUEVOS]**
- `GET /api/reportes/panel-dia` - Panel del día con ausentes y tardes
- `POST /api/reportes/enviar-whatsapp` - Enviar notificación WhatsApp
- `GET /api/reportes/alumno` - Reporte individual de estudiante

### Autenticación **[NUEVO]**
- `POST /api/auth/login` - Iniciar sesión

## 📱 Notificaciones WhatsApp

El sistema está preparado para enviar notificaciones WhatsApp automáticas a los encargados. Para activar esta funcionalidad:

1. Registrarse en un proveedor de WhatsApp Business API (Meta, Twilio, etc.)
2. Obtener credenciales de API
3. Configurar el endpoint en `src/routes/reportes.routes.js`

Actualmente simula el envío y registra en consola del servidor.

## 📄 Documentación Adicional

- `NUEVOS_MODULOS.md` - Documentación detallada de los nuevos módulos
- `.env.example` - Ejemplo de configuración de variables de entorno
- `GET /api/docentes` - Listar docentes
- `PUT /api/asistencias/estudiante/:id/uid` - Asignar UID a estudiante
- `PUT /api/docentes/:id/uid` - Asignar UID a docente

## 📄 Licencia

Desarrollado para Centro Educativo Tecnológico Innova © 2026
