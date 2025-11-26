# 🚀 Más sobre la Aplicación "Precio Comercio"

Este documento detalla las funcionalidades y componentes adicionales que se desarrollaron para transformar el trabajo de laboratorio en una aplicación Full Stack funcional y robusta.

---

## 🌐 1. Interfaz Web (Frontend)

Para facilitar la interacción con la API sin depender exclusivamente de herramientas técnicas como Postman o Swagger, se desarrolló un frontend ligero utilizando tecnologías estándar:

*   **Tecnologías:** HTML5, CSS3 (Diseño oscuro/moderno) y JavaScript (Vanilla ES6+).
*   **Comunicación:** Uso de `fetch` para consumir los endpoints REST.
*   **Funcionalidades:**
    *   **Visualización:** Tablas dinámicas para Comercios, Productos y Precios.
    *   **Formularios:** Carga de nuevos comercios y asociación de precios/productos.
    *   **Feedback:** Sistema de notificaciones de estado (Cargando, Éxito, Error).
    *   **Formato Inteligente:** Visualización amigable de atributos JSON (ej: `volumen: 1L`).

---

## 🤖 2. Automatización y Scripts (DevOps)

Se crearon scripts de Bash para simplificar el ciclo de vida del desarrollo y el despliegue, abstrayendo la complejidad de los comandos de terminal.

### `start.sh` (Entorno de Desarrollo)
*   Verifica si `node_modules` existe e instala dependencias si faltan.
*   Comprueba si el servicio de MongoDB local está corriendo; si no, lo inicia automáticamente.
*   Ejecuta el script de `seed` para reiniciar la base de datos con datos de prueba limpios.
*   Inicia el servidor en modo `watch` (recarga automática ante cambios).

### `deploy.sh` (Entorno de Producción)
*   **Limpieza:** Detecta y detiene cualquier proceso corriendo en el puerto 3000.
*   **Build:** Compila el código TypeScript a JavaScript optimizado (`dist/`).
*   **Persistencia:** Se conecta a la base de datos (Local o Atlas según configuración).
*   **Ejecución:** Lanza la aplicación utilizando `node` directo sobre los archivos compilados para máximo rendimiento.

---

## 📊 3. Analítica y Agregaciones

Más allá del CRUD básico, se implementó lógica de negocio compleja utilizando el **Aggregation Pipeline** de MongoDB.

### Comparador de Canasta Básica (`/analytics/canasta`)
Esta funcionalidad permite:
1.  Recibir una lista de IDs de productos (ej: Leche, Arroz, Aceite).
2.  Buscar en la colección de `precios` todos los registros coincidentes.
3.  Agrupar los resultados por `comercio`.
4.  Sumar el costo total de la canasta para cada comercio.
5.  Ordenar los resultados del más barato al más caro.
6.  Devolver un detalle de qué productos se encontraron en cada lugar.

**Código destacado (Pipeline):**
```javascript
[
  { $match: { producto: { $in: productoIds } } },
  { $group: { 
      _id: "$comercio", 
      totalCanasta: { $sum: "$precio" },
      items: { $push: { producto: "$producto", precio: "$precio" } }
  }},
  { $lookup: { from: "comercios", localField: "_id", foreignField: "_id", as: "comercio" } },
  { $unwind: "$comercio" },
  { $sort: { totalCanasta: 1 } }
]
```

---

## ☁️ 4. Arquitectura Híbrida (Local vs Cloud)

La aplicación fue diseñada para ser agnóstica del entorno de ejecución:

*   **Modo Local (Codespaces):** Utiliza una instancia de MongoDB Community dentro del contenedor Docker. Ideal para desarrollo rápido y pruebas sin internet.
*   **Modo Nube (MongoDB Atlas):** Cambiando únicamente la variable `MONGODB_URI` en el archivo `.env`, la aplicación se conecta a un cluster global de MongoDB. Esto garantiza la **persistencia de datos** incluso si el contenedor de desarrollo se destruye.

---

## 🧠 5. Modelado de Datos y Relaciones

La aplicación utiliza un enfoque mixto de modelado en MongoDB (Referenciado y Embebido) para optimizar el rendimiento y la integridad.

### Colecciones Principales
1.  **Comercios (`/models/Comercio.ts`)**:
    *   Utiliza **GeoJSON** (`{ type: "Point", coordinates: [lng, lat] }`) para almacenar la ubicación geográfica.
    *   Índice `2dsphere` habilitado para consultas de proximidad (`$near`).
2.  **Productos (`/models/Producto.ts`)**:
    *   Almacena atributos dinámicos en un campo `Mixed` para flexibilidad (ej: peso, volumen, talla).
    *   Índices de texto (`text index`) en nombre y marca para búsquedas rápidas.
3.  **Precios (`/models/Precio.ts`)**:
    *   Actúa como tabla pivote entre Comercio y Producto.
    *   Almacena el valor histórico y metadatos (moneda, promo).
    *   Usa referencias (`ObjectId`) para mantener la consistencia.

---

## 📚 6. Documentación Interactiva (Swagger)

Se implementó **OpenAPI 3.0** (Swagger) para documentar automáticamente los endpoints.
*   **Ruta:** `/docs`
*   **Funcionalidad:** Permite probar los endpoints (GET, POST, etc.) directamente desde el navegador, viendo los esquemas de datos requeridos y las respuestas esperadas.

---

## 📂 7. Estructura del Proyecto

El código sigue una arquitectura **MVC (Model-View-Controller)** adaptada a API REST:

```text
/src
 ├── /config       # Conexión a base de datos (db.ts)
 ├── /controllers  # Lógica de negocio (Analytics, etc.)
 ├── /models       # Esquemas de Mongoose (Comercio, Producto, Precio)
 ├── /routes       # Definición de endpoints de Express
 ├── /seed         # Script de carga de datos iniciales
 └── server.ts     # Punto de entrada de la aplicación
/public            # Frontend estático (HTML, CSS, JS)
```

---

## 🛠 8. Stack Tecnológico Completo

*   **Runtime:** Node.js
*   **Lenguaje:** TypeScript
*   **Framework Web:** Express.js
*   **Base de Datos:** MongoDB
*   **ODM:** Mongoose
*   **Documentación:** Swagger (OpenAPI 3.0)
*   **Frontend:** HTML/CSS/JS
