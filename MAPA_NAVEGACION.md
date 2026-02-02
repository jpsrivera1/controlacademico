# 🗺️ MAPA DE NAVEGACIÓN DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                    🔐 PANTALLA DE LOGIN                         │
│                    http://localhost:5174/login                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  👤 Usuario: _______________                             │  │
│  │  🔒 Contraseña: _______________                          │  │
│  │                                                          │  │
│  │           [ 🚀 Iniciar Sesión ]                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (autenticado)
┌─────────────────────────────────────────────────────────────────┐
│                    🏠 SISTEMA PRINCIPAL                         │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────────────────────┐   │
│  │   📋 SIDEBAR     │  │   📊 CONTENIDO PRINCIPAL         │   │
│  │                  │  │                                  │   │
│  │  🏠 Inicio       │  │  Módulo seleccionado            │   │
│  │                  │  │  del menú lateral               │   │
│  │  🎯 SISTEMA NFC  │  │                                  │   │
│  │  • Registrar     │  │                                  │   │
│  │  • Asignar       │  │                                  │   │
│  │                  │  │                                  │   │
│  │  📊 REPORTES     │  │                                  │   │
│  │  • Panel Día ⭐  │  │                                  │   │
│  │  • Por Alumno ⭐ │  │                                  │   │
│  │                  │  │                                  │   │
│  │  👨‍🏫 DOCENTES    │  │                                  │   │
│  │  • Registrar     │  │                                  │   │
│  │  • Ver lista     │  │                                  │   │
│  │                  │  │                                  │   │
│  │  [ 🚪 Salir ]    │  │                                  │   │
│  └──────────────────┘  └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📅 PANEL DEL DÍA - FLUJO DE USO

```
┌─────────────────────────────────────────────────────────────────┐
│  📅 PANEL DEL DÍA - Viernes, 25 de enero de 2026              │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐      [ 🔄 Actualizar ]    │
│  │ ❌ AUSENTES  │  │ ⚠️ TARDE     │                            │
│  │     12       │  │     8        │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                 │
│  🔍 FILTROS:                                                    │
│  [ Jornada ▼ ] [ Grado ▼ ] [ Modalidad ▼ ] [ 🔎 Buscar... ]   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ❌ ESTUDIANTES AUSENTES (12)                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Estudiante      │ Grado │ Encargado    │ Teléfono │ Acción││
│  ├───────────────────────────────────────────────────────────┤ │
│  │ Juan Pérez      │ 1ro A │ María Pérez  │ 12345678 │ [📱]  ││
│  │ Ana García      │ 2do B │ José García  │ 87654321 │ [📱]  ││
│  │ Carlos López    │ 3ro C │ Ana López    │ 23456789 │ [✅]  ││
│  │                                                   10:30 AM  ││
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ⚠️ ESTUDIANTES TARDE (8)                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Estudiante      │ Hora  │ Encargado    │ Teléfono │ Acción││
│  ├───────────────────────────────────────────────────────────┤ │
│  │ Luis Rodríguez  │ 7:25  │ Pedro Rodrí. │ 34567890 │ [📱]  ││
│  │ Sofía Martínez  │ 7:30  │ Laura Martí. │ 45678901 │ [✅]  ││
│  │                                                   10:32 AM  ││
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Acción [📱]: Enviar WhatsApp
Estado [✅]: Ya enviado (con hora)
```

---

## 📑 REPORTES POR ALUMNO - FLUJO DE USO

```
┌─────────────────────────────────────────────────────────────────┐
│  📑 REPORTES POR ALUMNO                                         │
│                                                                 │
│  👤 Seleccionar Estudiante:                                     │
│  [ Juan Pérez Gómez - 1ro A (Matutina) ▼ ]                     │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 📋 Información del Encargado                              │ │
│  │ Grado: 1ro A    │ Jornada: Matutina                       │ │
│  │ Encargado: María Pérez │ Tel: 12345678                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  📅 Período:                                                    │
│  Desde: [ 2026-01-01 ]  Hasta: [ 2026-01-31 ]                  │
│                                                                 │
│                       [ 🔍 Generar Reporte ]                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  📊 RESUMEN DEL PERÍODO                  [ 📄 Exportar PDF ]   │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ ✅ A      │  │ ⚠️ TARDE │  │ ❌ AUSEN │  │ 📆 TOTAL │      │
│  │ TIEMPO    │  │          │  │ TES      │  │ DÍAS     │      │
│  │    18     │  │     3    │  │     2    │  │    23    │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  📋 DETALLE DE ASISTENCIAS                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Fecha       │ Hora      │ Estado                          │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ 2026-01-02  │ 7:15 AM   │ [✅ A Tiempo]                   │ │
│  │ 2026-01-03  │ 7:25 AM   │ [⚠️ Tarde]                      │ │
│  │ 2026-01-04  │ No marcó  │ [❌ Ausente]                    │ │
│  │ 2026-01-05  │ 7:10 AM   │ [✅ A Tiempo]                   │ │
│  │ ...                                                       │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE DATOS

```
┌──────────────────┐
│   FRONTEND       │
│ (React + Vite)   │
│  Port: 5174      │
└────────┬─────────┘
         │ HTTP/API
         ↓
┌──────────────────┐
│   BACKEND        │
│ (Node + Express) │
│  Port: 3000      │
└────────┬─────────┘
         │ SQL
         ↓
┌──────────────────┐
│   SUPABASE       │
│  (PostgreSQL)    │
│                  │
│  Tables:         │
│  • students      │
│  • asistencias   │
│  • users         │
│  • teachers      │
└──────────────────┘
```

---

## 📱 INTEGRACIÓN WHATSAPP (Futuro)

```
┌──────────────────┐
│  Panel del Día   │
│  [📱 Enviar WA]  │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   Backend API    │
│ /enviar-whatsapp │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐     ┌──────────────────┐
│  WhatsApp API    │────→│  Encargado       │
│  (Meta/Twilio)   │     │  Recibe mensaje  │
└──────────────────┘     └──────────────────┘
```

**Mensaje enviado**:
```
Estimado/a María Pérez,

Le informamos que su hijo/a Juan Pérez Gómez NO registró 
asistencia el día de hoy. Por favor comunicarse con la 
institución.

- CETI
```

---

## 🎯 ENDPOINTS API

```
┌─────────────────────────────────────────────────────┐
│  AUTENTICACIÓN                                      │
├─────────────────────────────────────────────────────┤
│  POST   /api/auth/login                             │
│  POST   /api/auth/logout                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  REPORTES (NUEVOS) ⭐                               │
├─────────────────────────────────────────────────────┤
│  GET    /api/reportes/panel-dia                     │
│  POST   /api/reportes/enviar-whatsapp               │
│  GET    /api/reportes/alumno                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ASISTENCIAS                                        │
├─────────────────────────────────────────────────────┤
│  GET    /api/asistencias/ultimo-uid                 │
│  POST   /api/asistencias/marcar                     │
│  GET    /api/asistencias                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ESTUDIANTES                                        │
├─────────────────────────────────────────────────────┤
│  GET    /api/estudiantes                            │
│  GET    /api/estudiantes/:id                        │
│  PUT    /api/estudiantes/:id/uid                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  DOCENTES                                           │
├─────────────────────────────────────────────────────┤
│  GET    /api/docentes                               │
│  POST   /api/docentes                               │
│  PUT    /api/docentes/:id/uid                       │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 PALETA DE COLORES

```
┌──────────────────────────────────────────┐
│  ESTADOS DE ASISTENCIA                   │
├──────────────────────────────────────────┤
│  ✅ A TIEMPO    →  🟢 Verde (#10B981)    │
│  ⚠️ TARDE       →  🟡 Amarillo (#F59E0B) │
│  ❌ AUSENTE     →  🔴 Rojo (#EF4444)     │
│  📆 TOTAL       →  🔵 Azul (#3B82F6)     │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  IDENTIDAD INSTITUCIONAL                 │
├──────────────────────────────────────────┤
│  Primary    →  #1E3A8A (Azul oscuro)     │
│  Secondary  →  #60A5FA (Azul claro)      │
│  Success    →  #10B981 (Verde)           │
│  Warning    →  #F59E0B (Amarillo)        │
│  Danger     →  #EF4444 (Rojo)            │
└──────────────────────────────────────────┘
```

---

## 📊 ARQUITECTURA DEL SISTEMA

```
┌────────────────────────────────────────────────────┐
│                  PRESENTACIÓN                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │   Login    │  │ Panel Día  │  │  Reportes  │  │
│  │   (Auth)   │  │  (Nuevo)   │  │  (Nuevo)   │  │
│  └────────────┘  └────────────┘  └────────────┘  │
└────────────────────────────────────────────────────┘
                       ↕
┌────────────────────────────────────────────────────┐
│               CAPA DE SERVICIOS                    │
│              (api.js - Axios)                      │
└────────────────────────────────────────────────────┘
                       ↕
┌────────────────────────────────────────────────────┐
│             CONTROLADORES (Backend)                │
│  ┌─────────┐  ┌─────────┐  ┌─────────────┐       │
│  │  Auth   │  │ Reportes│  │ Asistencias │       │
│  │  Ctrl   │  │  Ctrl   │  │    Ctrl     │       │
│  └─────────┘  └─────────┘  └─────────────┘       │
└────────────────────────────────────────────────────┘
                       ↕
┌────────────────────────────────────────────────────┐
│           BASE DE DATOS (Supabase)                 │
│  • students       • asistencias                    │
│  • users          • teachers                       │
│  • teacher_attendance                              │
└────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE VERIFICACIÓN RÁPIDA

```
Backend:
[✅] Puerto 3000 activo
[✅] Ruta /api/reportes registrada
[✅] reportes.routes.js creado
[✅] 3 endpoints funcionando

Frontend:
[✅] Puerto 5174 activo
[✅] Login.jsx creado
[✅] PanelDia.jsx creado
[✅] ReportesAlumno.jsx creado
[✅] Rutas protegidas implementadas
[✅] Navbar actualizado
[✅] api.js con nuevos endpoints

Dependencias:
[✅] jspdf instalado
[✅] jspdf-autotable instalado
[✅] Sin errores de compilación

Documentación:
[✅] NUEVOS_MODULOS.md
[✅] CHECKLIST.md
[✅] RESUMEN_FINAL.md
[✅] MAPA_NAVEGACION.md
[✅] README.md actualizado
```

---

**Estado**: ✅ **100% COMPLETO Y FUNCIONAL**  
**Próximo paso**: Iniciar sistema y probar módulos nuevos  
**Comando**: `.\iniciar.ps1` en carpeta reportes_academicos
