# 🛒 Proyecto Precio Comercio (Versión Windows)

Este proyecto es una API RESTful construida con Node.js, Express y MongoDB para gestionar y comparar precios de productos entre diferentes comercios.

> **Nota:** Esta rama (`para-windows`) está optimizada para ejecutarse en sistemas operativos Windows.

## 📋 Requisitos Previos

1.  **Node.js**: Tener instalado Node.js (v18 o superior). [Descargar aquí](https://nodejs.org/).
2.  **MongoDB**:
    *   Opción A (Local): Tener MongoDB Community Server instalado y corriendo como servicio. [Guía de instalación](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/).
    *   Opción B (Nube): Tener una cuenta en MongoDB Atlas y la cadena de conexión lista.

## 🚀 Cómo iniciar (Rápido)

Hemos incluido scripts `.bat` para facilitar la ejecución en Windows.

### 1. Modo Desarrollo
Para trabajar en el código. El servidor se reiniciará automáticamente si haces cambios.

Doble click en **`start.bat`** o ejecutar en CMD/PowerShell:
```cmd
start.bat
```

### 2. Modo Producción (Despliegue)
Para simular un entorno real. Compila el código TypeScript y lo ejecuta optimizado.

Doble click en **`deploy.bat`** o ejecutar en CMD/PowerShell:
```cmd
deploy.bat
```

## ⚙️ Configuración Manual

Si prefieres no usar los scripts automáticos:

1.  Instalar dependencias:
    ```cmd
    npm install
    ```
2.  Configurar variables de entorno:
    Renombrar (o crear) el archivo `.env` y configurar `MONGODB_URI`.
3.  Cargar datos de prueba:
    ```cmd
    npm run seed
    ```
4.  Iniciar servidor:
    ```cmd
    npm run dev
    ```

## 📚 Documentación

*   **API Swagger:** Una vez iniciado, visita `http://localhost:3000/docs`
*   **Frontend:** Visita `http://localhost:3000` para ver la interfaz web.