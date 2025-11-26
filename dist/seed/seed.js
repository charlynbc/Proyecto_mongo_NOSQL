"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Comercio_1 = __importDefault(require("../models/Comercio"));
const Producto_1 = __importDefault(require("../models/Producto"));
const Precio_1 = __importDefault(require("../models/Precio"));
const Categoria_1 = require("../models/Categoria");
const db_1 = require("../config/db");
dotenv_1.default.config();
const seed = () => __awaiter(void 0, void 0, void 0, function* () {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/precio_comercio_app';
    yield (0, db_1.connectDB)(uri);
    console.log('Conectado para SEED');
    try {
        yield Categoria_1.Categoria.deleteMany({});
        yield Comercio_1.default.deleteMany({});
        yield Producto_1.default.deleteMany({});
        yield Precio_1.default.deleteMany({});
        // 1) Categorías
        const categorias = yield Categoria_1.Categoria.insertMany([
            { nombre: "Lácteos", slug: "lacteos", descripcion: "Leches, yogures, quesos" },
            { nombre: "Almacén", slug: "almacen", descripcion: "Arroz, fideos, aceites, etc." }
        ]);
        const catLacteos = categorias.find(c => c.slug === "lacteos");
        const catAlmacen = categorias.find(c => c.slug === "almacen");
        // 2) Comercios
        const comercios = yield Comercio_1.default.insertMany([
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
        const productos = yield Producto_1.default.insertMany([
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
        const leche = productos[0];
        const arroz = productos[1];
        const aceite = productos[2];
        const devoto = comercios[0];
        const tata = comercios[1];
        // 4) Precios
        yield Precio_1.default.insertMany([
            // Devoto
            { comercio: devoto._id, producto: leche._id, precio: 60, moneda: "UYU", promo: "ninguna" },
            { comercio: devoto._id, producto: arroz._id, precio: 90, moneda: "UYU", promo: "ninguna" },
            { comercio: devoto._id, producto: aceite._id, precio: 180, moneda: "UYU", promo: "ninguna" },
            // Ta-Ta
            { comercio: tata._id, producto: leche._id, precio: 58, moneda: "UYU", promo: "ninguna" },
            { comercio: tata._id, producto: arroz._id, precio: 95, moneda: "UYU", promo: "2x1" },
            { comercio: tata._id, producto: aceite._id, precio: 175, moneda: "UYU", promo: "ninguna" }
        ]);
        console.log('Datos insertados correctamente');
    }
    catch (error) {
        console.error('Error en seed:', error);
    }
    finally {
        yield mongoose_1.default.disconnect();
        console.log('Desconectado');
    }
});
seed();
