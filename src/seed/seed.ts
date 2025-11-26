import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Comercio from '../models/Comercio';
import Producto from '../models/Producto';
import Precio from '../models/Precio';
import { Categoria } from '../models/Categoria';
import { connectDB } from '../config/db';

dotenv.config();

const seed = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/precio_comercio_app';
  await connectDB(uri);
  console.log('Conectado para SEED');

  try {
    await Categoria.deleteMany({});
    await Comercio.deleteMany({});
    await Producto.deleteMany({});
    await Precio.deleteMany({});

    // 1) Categorías
    const categorias = await Categoria.insertMany([
      { nombre: "Lácteos", slug: "lacteos", descripcion: "Leches, yogures, quesos" },
      { nombre: "Almacén", slug: "almacen", descripcion: "Arroz, fideos, aceites, etc." }
    ]);

    const catLacteos = categorias.find(c => c.slug === "lacteos")!;
    const catAlmacen = categorias.find(c => c.slug === "almacen")!;

    // 2) Comercios
    const comercios = await Comercio.insertMany([
      { 
        nombre: 'Devoto', 
        direccion: 'Av. Italia 1234',
        ubicacion: { type: 'Point', coordinates: [-56.1645, -34.9059] }
      },
      { 
        nombre: 'Ta-Ta', 
        direccion: '18 de Julio 456',
        ubicacion: { type: 'Point', coordinates: [-56.18, -34.91] }
      },
    ]);

    // 3) Productos
    const productos = await Producto.insertMany([
      { 
        nombre: 'Leche Entera 1L', 
        marca: 'Conaprole', 
        categoria: catLacteos._id,
        categoriaNombre: catLacteos.nombre,
        atributos: { volumen: "1L", tipo: "entera" }
      },
      { 
        nombre: 'Arroz 1Kg', 
        marca: 'Saman', 
        categoria: catAlmacen._id,
        categoriaNombre: catAlmacen.nombre,
        atributos: { peso: "1kg" }
      },
      { 
        nombre: 'Aceite Girasol 900ml', 
        marca: 'Optimo', 
        categoria: catAlmacen._id,
        categoriaNombre: catAlmacen.nombre,
        atributos: { volumen: "900ml" }
      },
    ]);

    const leche  = productos[0];
    const arroz  = productos[1];
    const aceite = productos[2];
    const devoto = comercios[0];
    const tata   = comercios[1];

    // 4) Precios
    await Precio.insertMany([
      // Devoto
      { comercio: devoto._id, producto: leche._id,  precio: 60, moneda: "UYU", promo: "ninguna" },
      { comercio: devoto._id, producto: arroz._id,  precio: 90, moneda: "UYU", promo: "ninguna" },
      { comercio: devoto._id, producto: aceite._id, precio: 180, moneda: "UYU", promo: "ninguna" },

      // Ta-Ta
      { comercio: tata._id, producto: leche._id,  precio: 58, moneda: "UYU", promo: "ninguna" },
      { comercio: tata._id, producto: arroz._id,  precio: 95, moneda: "UYU", promo: "2x1" },
      { comercio: tata._id, producto: aceite._id, precio: 175, moneda: "UYU", promo: "ninguna" }
    ]);

    console.log('Datos insertados correctamente');
  } catch (error) {
    console.error('Error en seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado');
  }
};

seed();