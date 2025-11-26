# Informe de Laboratorio: Base de Datos NoSQL (MongoDB)

**Estudiante:** [Tu Nombre]
**Fecha:** 26 de Noviembre de 2025
**Materia:** Base de Datos NoSQL

---

## 🧩 1. Realidad donde uso una base NoSQL (MongoDB)

### Descripción del problema

La realidad elegida es una aplicación llamada **Precio Comercio**, cuyo objetivo es comparar precios de productos entre distintos comercios de la ciudad. Cada comercio define sus propios productos, horarios, medios de pago y promociones. Además, los precios cambian a lo largo del tiempo y pueden variar según promociones puntuales.

Debido a que:

* la estructura de los productos puede ser muy variable (distintos atributos, presentaciones, variantes),
* los precios generan historiales extensos por producto/comercio/fecha,
* se necesitan consultas geoespaciales (comercios cercanos al usuario),

el uso de una base de datos relacional rígida se vuelve complejo y poco flexible.
En cambio, MongoDB permite:

* almacenar documentos JSON flexibles,
* manejar arrays y subdocumentos embebidos,
* soportar consultas geoespaciales con índices `2dsphere`,
* escalar horizontalmente si la cantidad de datos crece. 

Por estos motivos, MongoDB resulta una alternativa adecuada para este problema.

### Casos de uso

1. **Búsqueda de comercios cercanos al usuario**

   El usuario consulta la app y quiere ver los comercios en un radio de X metros desde su ubicación.
   MongoDB permite guardar la ubicación de cada comercio usando GeoJSON y ejecutar consultas con `$near`, aprovechando un índice geoespacial.

2. **Comparación de precios de una “canasta” de productos entre comercios**

   El usuario selecciona varios productos (por ejemplo, leche, arroz y aceite) y la aplicación calcula el costo total en cada comercio.
   Con documentos en la colección `precios` que vinculan `producto`, `comercio`, `precio` y `fecha`, es posible usar un Aggregation Pipeline para agrupar por comercio y sumar los precios de la canasta.

---

## 🧱 2. Diseño de la base de datos en MongoDB

### Modelo de datos: colecciones principales

1. **Colección `comercios`**

   Guarda la información de cada comercio:

   ```json
   {
     "nombre": "Devoto Pocitos",
     "rubro": "supermercado",
     "direccion": "Bvar. España 1234",
     "ubicacion": { "type": "Point", "coordinates": [-56.147, -34.908] },
     "horarios": "08:00-22:00",
     "medios_pago": ["efectivo", "debito", "credito"],
     "createdAt": ISODate(...),
     "updatedAt": ISODate(...)
   }
   ```

2. **Colección `productos`**

   Representa el catálogo de productos:

   ```json
   {
     "nombre": "Leche Entera 1L",
     "marca": "Conaprole",
     "categoria": "lacteos",
     "atributos": { "volumen": "1L", "tipo": "entera" },
     "variantes": [],
     "createdAt": ISODate(...),
     "updatedAt": ISODate(...)
   }
   ```

3. **Colección `precios`**

   Relaciona comercios con productos y registra el valor en una fecha:

   ```json
   {
     "comercio": ObjectId("..."),
     "producto": ObjectId("..."),
     "precio": 45,
     "moneda": "UYU",
     "promo": "2x1",
     "fuente": "relevamiento manual",
     "fecha": ISODate("2025-11-24T14:14:04.596Z"),
     "createdAt": ISODate(...),
     "updatedAt": ISODate(...)
   }
   ```

4. (Opcional) **Colección `usuarios`** para autenticación/roles.

### Relaciones: embebido vs referenciado

* **Embebido**:

  * Arrays como `medios_pago` y `atributos` se guardan dentro del documento del comercio o producto porque son propios de ese documento y se consultan siempre junto a él.
* **Referenciado**:

  * En la colección `precios`, tanto `comercio` como `producto` se guardan como `ObjectId`. Esto permite:

    * que un comercio tenga muchos productos con distintos precios,
    * que un producto exista en muchos comercios,
    * mantener la colección `precios` liviana y fácil de indexar.

Esta elección es eficiente porque separa la información de referencia (comercios, productos) de los datos de alta frecuencia de cambio (precios).

### Consultas comunes (Aggregation Pipeline)

1. **Traer precios con datos completos de comercio y producto**

   Usando `$lookup`:

   ```js
   db.precios.aggregate([
     { $match: { producto: ObjectId("...") } },
     {
       $lookup: {
         from: "comercios",
         localField: "comercio",
         foreignField: "_id",
         as: "comercio"
       }
     },
     { $unwind: "$comercio" },
     {
       $lookup: {
         from: "productos",
         localField: "producto",
         foreignField: "_id",
         as: "producto"
       }
     },
     { $unwind: "$producto" }
   ])
   ```

2. **Comparar costo de una canasta de productos entre comercios**

   ```js
   const productosCanasta = [
     ObjectId("idLeche"),
     ObjectId("idArroz"),
     ObjectId("idAceite")
   ];

   db.precios.aggregate([
     { $match: { producto: { $in: productosCanasta } } },
     {
       $group: {
         _id: "$comercio",
         totalCanasta: { $sum: "$precio" },
         items: { $push: { producto: "$producto", precio: "$precio" } }
       }
     },
     { $sort: { totalCanasta: 1 } }
   ]);
   ```

---

## 🧠 3. Interacción de MongoDB con lenguajes de programación

**Lenguaje elegido:**
➡️ **Node.js + TypeScript**

**Driver / librería:**
➡️ **Mongoose (ODM)**

MongoDB ofrece drivers oficiales para Node.js, Python, Java, C#, etc. En este proyecto se eligió **Node.js con TypeScript** porque:

* trabaja de forma nativa con JSON, igual que MongoDB,
* es ideal para construir APIs web asincrónicas,
* TypeScript agrega tipado estático y mejora el mantenimiento,
* existe un ecosistema muy maduro (Express, Mongoose, Swagger, etc.).

### Ventajas de usar MongoDB con Node.js + TypeScript + Mongoose

* JSON a JSON sin conversiones intermedias.
* Mongoose permite definir esquemas y modelos, facilitando validación y consistencia.
* TypeScript reduce errores en tiempo de desarrollo.
* La combinación es muy usada en la industria, con buena documentación y comunidad.

### Desventajas

* Mongoose agrega una capa extra de abstracción sobre el driver y puede limitar algunas funciones avanzadas.
* TypeScript suma un paso de compilación y cierta curva de aprendizaje inicial.

---

## 🛠️ 4. Implementación de la realidad planteada

### Desarrollo del esquema en MongoDB

Se crearon las colecciones `comercios`, `productos` y `precios` en una instancia real de MongoDB.
Los documentos se insertaron tanto mediante scripts (seed) como desde la API.

### Carga de datos de ejemplo

Se definió un script `npm run seed` que:

* Conecta a la base `precio_comercio_app`
* Limpia las colecciones
* Inserta:

  * comercios de prueba (Devoto Pocitos, Ta-Ta Centro, etc.),
  * productos de prueba (Leche Entera 1L, Arroz 1Kg, Aceite 900ml),
  * precios asociados.

### Interfaz de usuario / API

Se construyó una API REST con Node.js + Express que expone:

* CRUD de comercios: `POST /comercios`, `GET /comercios`, `PUT /comercios/{id}`, `DELETE /comercios/{id}`
* CRUD de productos: `POST /productos`, `GET /productos`, `PUT /productos/{id}`, `DELETE /productos/{id}`
* Gestión de precios: `POST /precios`, `GET /precios`, `GET /precios/historial`, `DELETE /precios/{id}`
* Health check: `GET /health`
* Documentación: `/docs` (Swagger/OpenAPI).

### Consultas complejas

Desde la API se implementan consultas usando Aggregation Pipeline, por ejemplo:

* obtener el historial de precios de un producto en un comercio,
* comparar precios entre comercios.

### Pruebas y validación

Se probaron los endpoints vía Swagger y mediante datos de prueba cargados en MongoDB.
Se verificó que:

* los CRUD funcionan correctamente,
* los datos insertados aparecen en las colecciones,
* los pipelines devuelven la información esperada.

---

## 📈 5. Indexación y optimización (opcional)

### Índices aplicados

* Índice geoespacial en `comercios`:

  ```js
  db.comercios.createIndex({ ubicacion: "2dsphere" });
  ```

* Índices compuestos y de texto en `productos`:

  ```js
  db.productos.createIndex({ categoria: 1, marca: 1 });
  db.productos.createIndex({ nombre: "text", marca: "text" });
  ```

* Índices en `precios`:

  ```js
  db.precios.createIndex({ comercio: 1, producto: 1 });
  db.precios.createIndex({ producto: 1 });
  db.precios.createIndex({ comercio: 1 });
  ```

Estos índices mejoran el rendimiento de:

* búsquedas por cercanía,
* filtrado por categoría/marca,
* comparación de precios por producto/comercio.

### Optimización futura

Se podría considerar sharding para distribuir la colección `precios` cuando crezca mucho, y replicación para alta disponibilidad.

---

## 📚 6. Documentación y reflexión final

### Documentación

Se documentó:

* el modelo de datos (colecciones, campos, relaciones),
* las consultas principales,
* la API REST (mediante Swagger),
* el proceso de carga de datos (seed),
* el flujo de ejecución (conexión a Mongo, uso de Mongoose, endpoints, middlewares).

### Reflexión sobre el uso de MongoDB

Para la realidad de comparación de precios entre comercios, MongoDB resultó una muy buena elección porque:

* ofrece la flexibilidad necesaria para manejar productos y precios variados,
* permite consultas geoespaciales para encontrar comercios cercanos,
* simplifica el manejo de historiales de precios,
* se integra de forma natural con Node.js y aplicaciones web modernas.

Como posibles alternativas podrían considerarse bases relacionales con columnas JSON (por ejemplo, PostgreSQL con JSONB) o servicios administrados como Firestore. Sin embargo, MongoDB ofrece un conjunto de funcionalidades (documentos, agregaciones, geospatial, escalabilidad) que se ajustan especialmente bien a esta realidad.

---

## ☁️ 7. Persistencia y Despliegue

### Persistencia de Datos

Para garantizar la persistencia de los datos más allá del ciclo de vida del entorno de desarrollo (GitHub Codespaces), se optó por utilizar **MongoDB Atlas**, un servicio de base de datos en la nube completamente administrado.

> "La persistencia real de los datos no depende del contenedor de desarrollo, sino de un servicio de base de datos externo (MongoDB Atlas). De esta forma, aunque el entorno Codespaces se detenga o se destruya, los datos se mantienen intactos."

La conexión se gestiona mediante variables de entorno (`MONGODB_URI`), lo que permite cambiar entre una base de datos local y la base de datos en la nube sin modificar el código fuente.

### Automatización del Despliegue

Se crearon scripts de automatización para facilitar el ciclo de vida de la aplicación:

*   `start.sh`: Script para el entorno de desarrollo. Verifica dependencias, asegura que el servicio de MongoDB local esté corriendo, carga datos de prueba y levanta el servidor en modo `watch`.
*   `deploy.sh`: Script para producción. Detiene procesos anteriores, instala dependencias, compila el código TypeScript, resetea la base de datos con datos frescos y lanza el servidor optimizado.

---

## 🌐 8. Interfaz Web (Frontend)

Además de la API REST y la documentación en Swagger, se implementó una interfaz web sencilla utilizando HTML, CSS y JavaScript puro (Vanilla JS). Esta interfaz es servida por el mismo servidor Node.js y permite:

*   **Visualizar datos:** Tablas dinámicas para listar comercios, productos y precios consumiendo los endpoints GET de la API.
*   **Interactuar con la API:** Un formulario para crear nuevos comercios que envía peticiones POST al backend.
*   **Validación visual:** Feedback inmediato al usuario sobre el estado de las peticiones (cargando, éxito, error).

Esta adición demuestra la capacidad de la API para servir datos a un cliente real, completando el ciclo de una aplicación full-stack básica.
