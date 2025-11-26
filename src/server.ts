import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import comercioRoutes from './routes/comercios';
import productoRoutes from './routes/productos';
import precioRoutes from './routes/precios';
import categoriaRoutes from './routes/categorias';
import analyticsRouter from './routes/analytics.routes';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/precio_comercio_app';

// Middleware
app.use(cors());
app.use(express.json());

const publicPath = path.join(process.cwd(), "public");
app.use(express.static(publicPath));

// Routes
app.use('/comercios', comercioRoutes);
app.use('/productos', productoRoutes);
app.use('/precios', precioRoutes);
app.use('/categorias', categoriaRoutes);
app.use('/analytics', analyticsRouter);

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Precio Comercio API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.ts'], 
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Start server
const start = async () => {
  await connectDB(MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`🚀 API lista en http://localhost:${PORT}`);
  });
};

start();