@echo off
setlocal enabledelayedexpansion

echo 🚀 Iniciando Proyecto Precio Comercio (Windows)...

:: 1. Instalar dependencias si no existen
if not exist "node_modules" (
  echo 📦 Instalando dependencias...
  call npm install
) else (
  echo ✅ Dependencias ya instaladas.
)

:: 2. Verificar MongoDB (Simple check)
echo 🍃 Verificando conexión a MongoDB...
:: No es tan fácil verificar el servicio en batch sin permisos de admin, 
:: asumimos que el usuario lo tiene corriendo o usa Atlas.
echo ⚠️ Asegurate de tener MongoDB corriendo o la URI de Atlas en .env

:: 3. Cargar datos de prueba (Seed)
echo 🌱 Cargando datos de prueba (Seed)...
call npm run seed

:: 4. Iniciar la aplicación
echo 🔥 Levantando el servidor en http://localhost:3000 ...
echo Presiona Ctrl+C para detener.
call npm run dev
