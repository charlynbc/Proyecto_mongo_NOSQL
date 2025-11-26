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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Categoria_1 = require("../models/Categoria");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Gestión de categorías
 */
/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categorias = yield Categoria_1.Categoria.find();
        res.json(categorias);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías' });
    }
}));
/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: Crear una categoría
 *     tags: [Categorias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               slug:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoría creada
 */
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoria = new Categoria_1.Categoria(req.body);
        yield categoria.save();
        res.status(201).json(categoria);
    }
    catch (error) {
        res.status(400).json({ message: 'Error al crear categoría' });
    }
}));
exports.default = router;
