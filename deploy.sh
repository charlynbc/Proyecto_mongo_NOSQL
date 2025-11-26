#!/bin/bash

# Colores para que se vea bonito
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando Despliegue de Producción (Deploy)...${NC}"

# 1. Detener cualquier cosa que esté usando el puerto 3000
echo -e "${YELLOW}🧹 Verificando puerto 3000...${NC}"
# Intentamos usar lsof o fuser para encontrar y matar el proceso
PID=$(lsof -t -i:3000)
if [ -n "$PID" ]; then
  echo -e "${RED}Matando proceso anterior (PID: $PID)...${NC}"
  kill -9 $PID
else
  echo -e "${GREEN}Puerto 3000 libre.${NC}"
fi

# 2. Verificar MongoDB
echo -e "${YELLOW}🍃 Verificando estado de MongoDB...${NC}"
if ! pgrep -x "mongod" > /dev/null
then
    echo -e "${RED}MongoDB detenido. Intentando iniciar...${NC}"
    sudo service mongodb start
    sleep 3
else
    echo -e "${GREEN}MongoDB está corriendo.${NC}"
fi

# 3. Instalar dependencias
echo -e "${YELLOW}📦 Asegurando dependencias...${NC}"
npm install

# 4. Compilar el código (Build)
echo -e "${YELLOW}🔨 Compilando TypeScript a JavaScript (dist/)...${NC}"
npm run build

# 5. Poblar la base de datos (Seed)
# Esto asegura que la demo tenga datos frescos
echo -e "${YELLOW}🌱 Ejecutando Seed para cargar datos iniciales...${NC}"
npm run seed

# 6. Arrancar el servidor en modo producción
echo -e "${GREEN}🔥 Todo listo. Iniciando servidor en modo PRODUCCIÓN...${NC}"
echo -e "${GREEN}👉 Web: http://localhost:3000${NC}"
echo -e "${GREEN}👉 Docs: http://localhost:3000/api-docs${NC}"

npm start
