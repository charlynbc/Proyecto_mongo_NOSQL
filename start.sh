#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando Proyecto Precio Comercio...${NC}"

# 1. Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
  npm install
else
  echo -e "${GREEN}✅ Dependencias ya instaladas.${NC}"
fi

# 2. Verificar e iniciar MongoDB
echo -e "${YELLOW}🍃 Verificando MongoDB...${NC}"
if ! pgrep -x "mongod" > /dev/null
then
    echo -e "${YELLOW}⚠️ MongoDB no está corriendo. Iniciando servicio...${NC}"
    # Crear directorios necesarios si no existen (específico para este entorno)
    sudo mkdir -p /data/db
    sudo chown -R mongodb:mongodb /data/db
    
    # Iniciar mongod en background
    sudo mongod --fork --logpath /var/log/mongodb/mongod.log --bind_ip 127.0.0.1
    
    # Esperar unos segundos a que levante
    sleep 3
    echo -e "${GREEN}✅ MongoDB iniciado.${NC}"
else
    echo -e "${GREEN}✅ MongoDB ya está corriendo.${NC}"
fi

# 3. Cargar datos de prueba (Seed)
echo -e "${YELLOW}🌱 Cargando datos de prueba (Seed)...${NC}"
npm run seed

# 4. Iniciar la aplicación
echo -e "${GREEN}🔥 Levantando el servidor en http://localhost:3000 ...${NC}"
echo -e "${YELLOW}Presiona Ctrl+C para detener.${NC}"
npm run dev < /dev/null