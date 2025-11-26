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
const express_1 = require("express");
const Producto_1 = __importDefault(require("../models/Producto"));
const Categoria_1 = require("../models/Categoria");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos
 */
/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productos = yield Producto_1.default.find();
        res.json(productos);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener productos' });
    }
}));
/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crear un producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               marca:
 *                 type: string
 *               categoriaId:
 *                 type: string
 *               atributos:
 *                 type: object
 *     responses:
 *       201:
 *         description: Producto creado
 */
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, marca, categoriaId, atributos } = req.body;
        let categoriaData;
        if (categoriaId) {
            categoriaData = yield Categoria_1.Categoria.findById(categoriaId);
            if (!categoriaData) {
                return res.status(400).json({ message: "Categoría no encontrada" });
            }
        }
        const producto = new Producto_1.default({
            nombre,
            marca,
            categoria: categoriaData === null || categoriaData === void 0 ? void 0 : categoriaData._id,
            categoriaNombre: categoriaData === null || categoriaData === void 0 ? void 0 : categoriaData.nombre,
            atributos
        });
        yield producto.save();
        res.status(201).json(producto);
    }
    catch (error) {
        res.status(400).json({ message: 'Error al crear producto' });
    }
}));
exports.default = router;
