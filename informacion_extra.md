# 📚 Información Extra - Sistema de Comparación de Precios con MongoDB

## 🎯 ¿Qué hace este programa?

Este es un **sistema completo de comparación de precios** entre comercios. Permite:

- 📍 **Gestionar comercios** con ubicación geográfica
- 🛒 **Catalogar productos** con sus marcas y categorías
- 💰 **Registrar precios** de productos en diferentes comercios
- 📊 **Comparar canastas** para encontrar dónde comprar más barato
- 🗺️ **Buscar comercios cercanos** usando coordenadas GPS

### Ejemplo de uso real:
Imagina que quieres comprar leche, arroz y aceite. El sistema te dice:
- En **Devoto** gastás: $330 (60+90+180)
- En **Ta-Ta** gastás: $328 (58+95+175)
- **Resultado**: Conviene Ta-Ta por $2 pesos 💡

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Navegador)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  index.html │──│   app.js    │──│  styles.css │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP Requests
                         ↓
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (API REST)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Express.js + TypeScript              │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Routes → Controllers → Models → MongoDB         │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ Mongoose ODM
                         ↓
┌─────────────────────────────────────────────────────────┐
│              MongoDB (Base de Datos NoSQL)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │Comercios │  │Productos │  │ Precios  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────┐                                          │
│  │Categorías│                                          │
│  └──────────┘                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Base de Datos - Estructura y Relaciones

### 📦 Colecciones (Tablas en SQL)

MongoDB organiza los datos en **colecciones** (equivalentes a tablas en SQL). Cada colección guarda **documentos** (registros) en formato JSON.

#### 1️⃣ **Categorías** (`categorias`)
```javascript
{
  _id: ObjectId("..."),
  nombre: "Lácteos",
  slug: "lacteos",
  descripcion: "Leches, yogures, quesos",
  createdAt: ISODate("2025-11-27T..."),
  updatedAt: ISODate("2025-11-27T...")
}
```

**Campos:**
- `_id`: ID único autogenerado por MongoDB
- `nombre`: Nombre legible ("Lácteos", "Almacén")
- `slug`: Versión URL-friendly ("lacteos", "almacen")
- `descripcion`: Información adicional
- `createdAt/updatedAt`: Timestamps automáticos

---

#### 2️⃣ **Comercios** (`comercios`)
```javascript
{
  _id: ObjectId("..."),
  nombre: "Devoto",
  direccion: "Av. Italia 1234",
  ubicacion: {
    type: "Point",
    coordinates: [-56.1645, -34.9059]  // [longitud, latitud]
  }
}
```

**Campos especiales:**
- `ubicacion`: Tipo **GeoJSON** para consultas geográficas
  - `type: "Point"`: Indica un punto en el mapa
  - `coordinates`: Array [longitud, latitud]
- **Índice 2dsphere**: Permite buscar "comercios a menos de 5km"

---

#### 3️⃣ **Productos** (`productos`)
```javascript
{
  _id: ObjectId("..."),
  nombre: "Leche Entera 1L",
  marca: "Conaprole",
  categoria: ObjectId("ref_a_categoria"),     // 🔗 Referencia
  categoriaNombre: "Lácteos",                 // Cache
  atributos: {
    volumen: "1L",
    tipo: "entera"
  },
  variantes: [],
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

**Características:**
- `categoria`: **Referencia** al `_id` de una categoría (relación)
- `categoriaNombre`: Copia del nombre para búsquedas rápidas (desnormalización)
- `atributos`: Objeto flexible (Schema-less, ventaja de MongoDB)
- `variantes`: Array para diferentes presentaciones del producto
- **Índice de texto**: Permite búsquedas como "leche conaprole"

---

#### 4️⃣ **Precios** (`precios`)
```javascript
{
  _id: ObjectId("..."),
  producto: ObjectId("ref_a_producto"),  // 🔗 Referencia
  comercio: ObjectId("ref_a_comercio"),  // 🔗 Referencia
  precio: 60,
  moneda: "UYU",
  promo: "2x1",
  fecha: ISODate("2025-11-27T...")
}
```

**Relaciones:**
- `producto`: Referencia al producto
- `comercio`: Referencia al comercio
- Permite histórico de precios (múltiples registros con diferentes fechas)

---

## 🔗 Tipos de Relaciones en MongoDB

### 1. **Referencia (Reference/Linking)** - Lo que usamos
```javascript
// Precio apunta a Producto y Comercio
{
  precio: 60,
  producto: ObjectId("abc123"),  // ← ID del producto
  comercio: ObjectId("def456")   // ← ID del comercio
}
```

**Ventajas:**
- ✅ Normalización (no duplicamos datos)
- ✅ Actualizar un producto actualiza todos los precios que lo referencian
- ✅ Flexibilidad para consultas complejas

**Desventajas:**
- ❌ Requiere hacer `populate()` o `$lookup` para obtener datos completos

---

### 2. **Embedding (Documentos anidados)** - No lo usamos aquí
```javascript
// Alternativa: guardar producto completo dentro del precio
{
  precio: 60,
  producto: {  // ← Documento completo anidado
    nombre: "Leche Entera 1L",
    marca: "Conaprole"
  },
  comercio: {
    nombre: "Devoto"
  }
}
```

**Ventajas:**
- ✅ Una sola consulta obtiene todo
- ✅ Rendimiento súper rápido

**Desventajas:**
- ❌ Duplicación de datos
- ❌ Si cambias el nombre del producto, hay que actualizar TODOS los precios

---

### 3. **Modelo Híbrido** - Lo que implementamos 🎯
```javascript
{
  producto: ObjectId("abc123"),        // Referencia
  categoriaNombre: "Lácteos"          // Cache (desnormalización)
}
```

Guardamos:
- **Referencias** para datos que cambian (IDs)
- **Copias** de datos que se consultan mucho (nombres)

**Mejor de ambos mundos:**
- ✅ Integridad referencial
- ✅ Consultas rápidas sin joins constantemente

---

## 🛠️ Stack Tecnológico

### Backend

#### **Node.js**
- 🟢 Entorno de ejecución de JavaScript fuera del navegador
- Permite usar JS tanto en frontend como backend (mismo lenguaje)

#### **TypeScript**
- 📘 Superset de JavaScript con tipado estático
- Ventajas:
  - Detecta errores en tiempo de desarrollo
  - Autocompletado inteligente
  - Documentación en el código

```typescript
// TypeScript te obliga a definir tipos
interface IProducto {
  nombre: string;    // ← Solo acepta texto
  precio: number;    // ← Solo acepta números
}

// JavaScript normal permitiría esto (bug potencial):
producto.precio = "gratis";  // ❌ TypeScript no lo permite
```

#### **Express.js**
- 🚂 Framework web minimalista para Node.js
- Maneja rutas, middlewares, peticiones HTTP

```typescript
// Define una ruta
app.get('/productos', async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);
});
```

#### **Mongoose**
- 🐱 ODM (Object-Document Mapper) para MongoDB
- Es como un ORM pero para bases NoSQL
- Permite definir esquemas y validaciones

```typescript
// Define la estructura de un documento
const ProductoSchema = new Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, min: 0 }
});
```

---

### Frontend

#### **HTML5 + CSS3 + JavaScript Vanilla**
- Sin frameworks (React, Vue, Angular)
- Puro y simple: `fetch()` para llamar a la API

```javascript
// Llamada a la API
const response = await fetch('http://localhost:3000/productos');
const productos = await response.json();
```

---

### Base de Datos

#### **MongoDB**
- 📊 Base de datos NoSQL orientada a documentos
- Almacena datos en formato BSON (JSON binario)

---

## 🤔 ¿Por qué MongoDB? (Ventajas)

### 1. **Flexibilidad de Esquema**
```javascript
// SQL: Necesitas alterar la tabla
ALTER TABLE productos ADD COLUMN atributos JSON;

// MongoDB: Directamente guardas lo que quieras
{
  nombre: "Leche",
  atributos: { volumen: "1L", grasa: "entera" }
}

{
  nombre: "Arroz",
  atributos: { peso: "1kg", tipo: "integral" }
}
```

Cada producto puede tener **atributos diferentes** sin problemas.

---

### 2. **Datos Geográficos Nativos**
```javascript
// Buscar comercios a menos de 5km de mi ubicación
db.comercios.find({
  ubicacion: {
    $near: {
      $geometry: { type: "Point", coordinates: [-56.16, -34.90] },
      $maxDistance: 5000  // metros
    }
  }
});
```

En SQL tradicional esto es **mucho más complejo**.

---

### 3. **Aggregation Pipeline Poderoso**
```javascript
// Comparar canastas: agrupar por comercio, sumar precios
db.precios.aggregate([
  { $match: { producto: { $in: [id1, id2, id3] } } },
  { $group: { _id: "$comercio", total: { $sum: "$precio" } } },
  { $sort: { total: 1 } }
]);
```

Equivalente a consultas SQL complejas con JOINs y GROUP BY.

---

### 4. **Escalabilidad Horizontal**
- MongoDB se diseñó para **distribuirse** en múltiples servidores
- Sharding (particionado) automático
- Perfecto para grandes volúmenes de datos

---

### 5. **JSON Nativo**
```javascript
// API devuelve JSON
res.json({ nombre: "Leche", precio: 60 });

// MongoDB guarda en BSON (JSON binario)
{ nombre: "Leche", precio: 60 }
```

No hay conversión entre formatos → **menos friccón**.

---

## 🆚 MongoDB vs SQL (Comparación)

| Característica | MongoDB | SQL (PostgreSQL/MySQL) |
|----------------|---------|------------------------|
| **Esquema** | Flexible, schema-less | Rígido, requiere definir tablas |
| **Relaciones** | Referencias u Embedding | Foreign Keys, JOINs |
| **Formato** | JSON/BSON | Tablas relacionales |
| **Escalabilidad** | Horizontal (sharding) | Vertical (más RAM/CPU) |
| **Transacciones** | Soportadas desde v4.0 | Nativas y maduras |
| **Consultas complejas** | Aggregation Pipeline | SQL queries |
| **Geo-queries** | Nativo (2dsphere) | Extensiones (PostGIS) |
| **Tipado** | Dinámico | Estático |

### ¿Cuándo usar MongoDB?
✅ Datos semi-estructurados o variables  
✅ Necesitas escalar horizontalmente  
✅ Prototipado rápido  
✅ Datos geográficos  
✅ Logs, analytics, IoT  

### ¿Cuándo usar SQL?
✅ Datos estructurados y relacionales complejos  
✅ Transacciones críticas (bancos)  
✅ Consultas complejas con múltiples JOINs  
✅ Integridad referencial estricta  

---

## 📁 Estructura del Proyecto

```
Proyecto_mongo_NOSQL/
│
├── public/                    # Frontend estático
│   ├── index.html            # Interfaz web
│   ├── app.js                # Lógica del cliente
│   └── styles.css            # Estilos
│
├── src/                      # Código backend
│   ├── server.ts            # Punto de entrada
│   ├── config/
│   │   └── db.ts            # Conexión a MongoDB
│   ├── models/              # Esquemas de Mongoose
│   │   ├── Categoria.ts
│   │   ├── Comercio.ts
│   │   ├── Precio.ts
│   │   └── Producto.ts
│   ├── routes/              # Definición de endpoints
│   │   ├── categorias.ts
│   │   ├── comercios.ts
│   │   ├── precios.ts
│   │   ├── productos.ts
│   │   └── analytics.routes.ts
│   ├── controllers/         # Lógica de negocio
│   │   └── analytics.controller.ts
│   └── seed/
│       └── seed.ts          # Datos de prueba
│
├── .env                     # Variables de entorno
├── package.json             # Dependencias
├── tsconfig.json            # Configuración TypeScript
├── start.sh                 # Script de inicio
└── deploy.sh                # Script de despliegue
```

---

## 🔧 Comandos Explicados

### Instalación y Setup

```bash
# Instalar dependencias del proyecto
npm install
# Descarga todos los paquetes en node_modules/
```

```bash
# Iniciar MongoDB con Docker (persistencia permanente)
docker run -d \
  --name mongodb \
  --restart unless-stopped \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

**Explicación:**
- `-d`: Modo detached (segundo plano)
- `--name mongodb`: Nombre del contenedor
- `--restart unless-stopped`: Reinicia automáticamente si falla
- `-p 27017:27017`: Expone puerto (host:contenedor)
- `-v mongodb_data:/data/db`: Volumen persistente
- `mongo:latest`: Imagen de Docker Hub

---

### Desarrollo

```bash
# Cargar datos de prueba
npm run seed
# Ejecuta: tsx src/seed/seed.ts
# Borra colecciones y las llena con datos de ejemplo
```

```bash
# Modo desarrollo (con hot-reload)
npm run dev
# Ejecuta: tsx watch src/server.ts
# Reinicia automáticamente al detectar cambios
```

```bash
# Compilar TypeScript a JavaScript
npm run build
# Ejecuta: tsc -p .
# Genera archivos .js en dist/
```

```bash
# Producción (con código compilado)
npm start
# Ejecuta: node dist/server.js
```

---

### Docker

```bash
# Ver contenedores activos
docker ps

# Ver logs de MongoDB
docker logs mongodb

# Reiniciar MongoDB
docker restart mongodb

# Detener MongoDB
docker stop mongodb

# Eliminar contenedor (NO borra el volumen)
docker rm mongodb

# Ver volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect mongodb_data
```

---

### MongoDB Shell

```bash
# Conectar al shell de MongoDB
docker exec -it mongodb mongosh

# Dentro del shell:
use precio_comercio_app       # Cambiar a la base de datos
show collections              # Listar colecciones
db.productos.find()           # Ver todos los productos
db.productos.countDocuments() # Contar documentos
db.precios.find().pretty()    # Ver precios formateados
exit                          # Salir
```

---

## 🚀 Flujo de Ejecución

### 1. **Inicio de la aplicación**

```
Usuario ejecuta: npm run dev
     ↓
tsx watch src/server.ts
     ↓
Carga dotenv → Lee .env
     ↓
Importa Express, Mongoose, Routes
     ↓
connectDB(MONGODB_URI) → Conecta a MongoDB
     ↓
app.listen(3000) → Servidor escuchando
     ↓
✅ API lista en http://localhost:3000
```

---

### 2. **Consulta de productos**

```
Cliente: fetch('http://localhost:3000/productos')
     ↓
Express recibe GET /productos
     ↓
Route: productoRoutes.get('/')
     ↓
Controller: productosController.getAll()
     ↓
Model: Producto.find().populate('categoria')
     ↓
Mongoose → MongoDB: db.productos.find()
     ↓
MongoDB devuelve documentos
     ↓
Mongoose convierte a objetos JS
     ↓
Controller envía res.json(productos)
     ↓
Cliente recibe JSON
     ↓
Frontend renderiza en tabla
```

---

### 3. **Comparación de canasta**

```
Cliente envía: POST /analytics/comparar-canasta
Body: { productos: [id1, id2, id3] }
     ↓
Controller: compararCanasta()
     ↓
Valida IDs con Types.ObjectId.isValid()
     ↓
Ejecuta Aggregation Pipeline:
  - $match: Filtra precios de esos productos
  - $group: Agrupa por comercio, suma precios
  - $lookup: Trae info de comercios
  - $lookup: Trae info de productos
  - $sort: Ordena por precio total
     ↓
MongoDB procesa pipeline
     ↓
Devuelve resultados ordenados
     ↓
Cliente recibe JSON con ranking de comercios
```

---

## 🔍 Conceptos Clave de MongoDB

### 1. **ObjectId**
```javascript
_id: ObjectId("507f1f77bcf86cd799439011")
```
- ID único de 12 bytes generado automáticamente
- Incluye timestamp, ID de máquina, contador
- Es el `PRIMARY KEY` equivalente en SQL

---

### 2. **Populate (JOIN en MongoDB)**
```javascript
// Sin populate
const precio = await Precio.findById(id);
// { producto: ObjectId("abc"), comercio: ObjectId("def"), precio: 60 }

// Con populate
const precio = await Precio.findById(id)
  .populate('producto')
  .populate('comercio');
// { 
//   producto: { nombre: "Leche", marca: "Conaprole" },
//   comercio: { nombre: "Devoto" },
//   precio: 60 
// }
```

---

### 3. **Aggregation Pipeline**
Sistema de procesamiento de datos por etapas:

```javascript
db.collection.aggregate([
  { $match: { ... } },      // 1. Filtrar documentos (WHERE)
  { $group: { ... } },      // 2. Agrupar (GROUP BY)
  { $lookup: { ... } },     // 3. Unir colecciones (JOIN)
  { $project: { ... } },    // 4. Seleccionar campos (SELECT)
  { $sort: { ... } },       // 5. Ordenar (ORDER BY)
  { $limit: 10 }            // 6. Limitar resultados (LIMIT)
]);
```

---

### 4. **Índices**
```javascript
// Índice geográfico para búsquedas espaciales
ComercioSchema.index({ ubicacion: '2dsphere' });

// Índice de texto para búsquedas full-text
ProductoSchema.index({ nombre: 'text', marca: 'text' });

// Índice compuesto para queries frecuentes
ProductoSchema.index({ categoria: 1, marca: 1 });
```

**Beneficios:**
- ⚡ Búsquedas **mucho más rápidas**
- Sin índices: escanea toda la colección (O(n))
- Con índices: búsqueda logarítmica (O(log n))

---

## 🌐 API REST - Endpoints Disponibles

### Comercios
```http
GET    /comercios              # Listar todos
POST   /comercios              # Crear nuevo
GET    /comercios/:id          # Obtener uno
PUT    /comercios/:id          # Actualizar
DELETE /comercios/:id          # Eliminar
GET    /comercios/cerca?lng=X&lat=Y&maxDist=5000  # Buscar cercanos
```

### Productos
```http
GET    /productos              # Listar todos
POST   /productos              # Crear nuevo
GET    /productos/:id          # Obtener uno
PUT    /productos/:id          # Actualizar
DELETE /productos/:id          # Eliminar
GET    /productos/search?q=leche  # Buscar por texto
```

### Precios
```http
GET    /precios                # Listar todos
POST   /precios                # Crear nuevo
GET    /precios/:id            # Obtener uno
PUT    /precios/:id            # Actualizar
DELETE /precios/:id            # Eliminar
GET    /precios/producto/:id   # Precios de un producto
GET    /precios/comercio/:id   # Precios de un comercio
```

### Categorías
```http
GET    /categorias             # Listar todas
POST   /categorias             # Crear nueva
GET    /categorias/:id         # Obtener una
PUT    /categorias/:id         # Actualizar
DELETE /categorias/:id         # Eliminar
```

### Analytics
```http
POST   /analytics/comparar-canasta
Body: { "productos": ["id1", "id2", "id3"] }
Response: Ranking de comercios ordenados por precio total
```

### Otros
```http
GET    /health                 # Healthcheck
GET    /docs                   # Documentación Swagger
```

---

## 📊 Ejemplos de Consultas MongoDB

### Buscar productos de una categoría
```javascript
db.productos.find({ 
  categoria: ObjectId("...") 
});
```

### Buscar comercios cercanos (5km)
```javascript
db.comercios.find({
  ubicacion: {
    $near: {
      $geometry: { type: "Point", coordinates: [-56.16, -34.90] },
      $maxDistance: 5000
    }
  }
});
```

### Precio promedio por producto
```javascript
db.precios.aggregate([
  { $group: {
    _id: "$producto",
    precioPromedio: { $avg: "$precio" },
    precioMin: { $min: "$precio" },
    precioMax: { $max: "$precio" }
  }}
]);
```

### Productos más caros
```javascript
db.precios.aggregate([
  { $sort: { precio: -1 } },
  { $limit: 10 },
  { $lookup: {
    from: "productos",
    localField: "producto",
    foreignField: "_id",
    as: "productoInfo"
  }}
]);
```

---

## 🔐 Variables de Entorno (.env)

```bash
PORT=3000                                           # Puerto del servidor
MONGODB_URI=mongodb://localhost:27017/precio_comercio_app  # URL de MongoDB
NODE_ENV=development                                # Entorno (dev/prod)
```

**¿Por qué usar .env?**
- 🔒 No exponer credenciales en el código
- 🔄 Diferentes configuraciones por entorno
- 🚀 Fácil deploy en diferentes servidores

---

## 🧪 Testing y Desarrollo

### Herramientas recomendadas

**Postman / Thunder Client / Insomnia**
- Probar endpoints de la API
- Guardar colecciones de requests
- Ver responses formateados

**MongoDB Compass**
- GUI para explorar la base de datos
- Ejecutar queries visualmente
- Ver índices y performance

**VS Code Extensions**
- MongoDB for VS Code
- REST Client
- Thunder Client

---

## 🎓 Conceptos Avanzados

### 1. **Transacciones en MongoDB**
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  await Producto.create([nuevoProducto], { session });
  await Precio.create([nuevoPrecio], { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**Garantiza atomicidad**: Todo o nada.

---

### 2. **Change Streams (Real-time)**
```javascript
const changeStream = Precio.watch();

changeStream.on('change', (change) => {
  console.log('¡Precio actualizado!', change);
  // Notificar al frontend por WebSocket
});
```

**Permite notificaciones en tiempo real** cuando cambian los datos.

---

### 3. **Sharding (Escalabilidad)**
```javascript
// Particionar datos por comercio
sh.shardCollection("precio_comercio_app.precios", { 
  comercio: 1 
});
```

Distribuye datos en múltiples servidores automáticamente.

---

## 🚀 Despliegue a Producción

### Opciones de hosting

**MongoDB Atlas** (Recomendado)
- MongoDB en la nube (gratis hasta 512MB)
- Backups automáticos
- Monitoreo incluido
- URL: `mongodb+srv://user:pass@cluster.mongodb.net/db`

**Backend**
- **Render / Railway / Fly.io**: Fácil deploy con Git
- **Heroku**: Requiere add-on de MongoDB
- **VPS (DigitalOcean, AWS EC2)**: Más control

**Pasos básicos:**
1. Crear cluster en MongoDB Atlas
2. Actualizar `MONGODB_URI` en .env de producción
3. Hacer `npm run build`
4. Subir código a GitHub
5. Conectar repositorio con servicio de hosting
6. Configurar variables de entorno en el hosting
7. Deploy automático 🎉

---

## 📚 Recursos para Aprender Más

### MongoDB
- [MongoDB University](https://university.mongodb.com/) - Cursos gratis oficiales
- [MongoDB Docs](https://docs.mongodb.com/) - Documentación oficial
- [Mongoose Docs](https://mongoosejs.com/docs/) - ODM para Node.js

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Documentación oficial
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) - Libro gratuito

### Node.js / Express
- [Express Docs](https://expressjs.com/) - Documentación oficial
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - Mejores prácticas

---

## 💡 Mejoras Futuras

### Funcionalidades
- [ ] Autenticación de usuarios (JWT)
- [ ] Sistema de favoritos
- [ ] Histórico de precios con gráficos
- [ ] Alertas cuando bajan precios
- [ ] Comparador de marcas
- [ ] API pública con rate limiting
- [ ] App móvil (React Native)

### Técnicas
- [ ] Cache con Redis
- [ ] GraphQL en lugar de REST
- [ ] WebSockets para actualizaciones real-time
- [ ] Migraciones de base de datos
- [ ] Tests unitarios (Jest) y e2e (Playwright)
- [ ] CI/CD con GitHub Actions
- [ ] Monitoreo con Prometheus + Grafana

---

## 🎯 Conclusión

Este proyecto demuestra:

✅ Arquitectura **MVC** moderna  
✅ **MongoDB** para flexibilidad y escalabilidad  
✅ **TypeScript** para código robusto  
✅ **API REST** bien estructurada  
✅ **Docker** para ambientes reproducibles  
✅ **Geolocalización** nativa  
✅ **Aggregations** avanzadas  

**Es una base sólida** para aprender desarrollo full-stack con el stack MEAN/MERN (MongoDB + Express + Angular/React + Node).

---

## 📞 Comandos de Inicio Rápido

```bash
# 1. Iniciar MongoDB
docker run -d --name mongodb --restart unless-stopped \
  -p 27017:27017 -v mongodb_data:/data/db mongo:latest

# 2. Instalar dependencias
npm install

# 3. Cargar datos de prueba
npm run seed

# 4. Iniciar aplicación
npm run dev

# 5. Abrir en navegador
# http://localhost:3000
```

---

**¡Ahora tienes toda la información para entender, modificar y extender este proyecto! 🚀**
