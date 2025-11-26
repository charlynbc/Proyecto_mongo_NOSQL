@echo off
setlocal

echo 🚀 Iniciando Despliegue de Producción (Windows)...

:: 1. Intentar liberar el puerto 3000
echo 🧹 Verificando puerto 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Matando proceso con PID %%a...
    taskkill /F /PID %%a
)

:: 2. Instalar dependencias
echo 📦 Asegurando dependencias...
call npm install

:: 3. Compilar
echo 🔨 Compilando TypeScript a JavaScript (dist/)...
call npm run build

:: 4. Seed
echo 🌱 Ejecutando Seed...
call npm run seed

:: 5. Start
echo 🔥 Iniciando servidor en modo PRODUCCIÓN...
echo 👉 Web: http://localhost:3000
echo 👉 Docs: http://localhost:3000/api-docs

call npm start
