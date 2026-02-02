# 🚀 INICIAR SISTEMA COMPLETO

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SISTEMA DE REPORTES ACADÉMICOS NFC" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📦 Verificando instalación de dependencias..." -ForegroundColor Yellow

# Verificar si las dependencias están instaladas
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$nodeModules = Test-Path "node_modules"

if (-not $nodeModules) {
    Write-Host "⚠️  No se encontró node_modules. Instalando dependencias..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencias instaladas`n" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencias OK`n" -ForegroundColor Green
}

# Verificar si el backend está corriendo
Write-Host "🔍 Verificando backend (http://localhost:3000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "✅ Backend activo`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend no está corriendo" -ForegroundColor Red
    Write-Host "   Por favor inicia el backend primero:`n" -ForegroundColor Yellow
    Write-Host "   cd C:\Users\JoseP\OneDrive\Desktop\RegEstudiantes" -ForegroundColor White
    Write-Host "   npm start`n" -ForegroundColor White
    Read-Host "Presiona Enter para continuar de todos modos"
}

# Mostrar información del sistema
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INFORMACIÓN DEL SISTEMA" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📍 Frontend:" -ForegroundColor Green
Write-Host "   URL: http://localhost:5174" -ForegroundColor White
Write-Host "   Puerto: 5174`n" -ForegroundColor White

Write-Host "🔐 Credenciales de prueba:" -ForegroundColor Green
Write-Host "   Usuario: Consulta tabla 'users' en Supabase" -ForegroundColor White
Write-Host "   Password: (definido en BD)`n" -ForegroundColor White

Write-Host "📋 Módulos disponibles:" -ForegroundColor Green
Write-Host "   ✅ Login" -ForegroundColor White
Write-Host "   ✅ Registrar Asistencia (NFC)" -ForegroundColor White
Write-Host "   ✅ Asignar Tarjetas" -ForegroundColor White
Write-Host "   ✅ Panel del Día [NUEVO]" -ForegroundColor Yellow
Write-Host "   ✅ Reportes por Alumno [NUEVO]" -ForegroundColor Yellow
Write-Host "   ✅ Registrar Docente" -ForegroundColor White
Write-Host "   ✅ Ver Docentes`n" -ForegroundColor White

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INICIANDO SERVIDOR DE DESARROLLO..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "🚀 Servidor iniciándose en http://localhost:5174`n" -ForegroundColor Green
Write-Host "📝 Documentación:" -ForegroundColor Yellow
Write-Host "   - NUEVOS_MODULOS.md (detalles de nuevos módulos)" -ForegroundColor White
Write-Host "   - CHECKLIST.md (pruebas a realizar)" -ForegroundColor White
Write-Host "   - README.md (documentación general)`n" -ForegroundColor White

Write-Host "⚠️  Presiona Ctrl+C para detener el servidor`n" -ForegroundColor Red

# Iniciar servidor
npm run dev
