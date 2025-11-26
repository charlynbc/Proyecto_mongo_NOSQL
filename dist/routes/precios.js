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
const Precio_1 = __importDefault(require("../models/Precio"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Precios
 *   description: Gestión de precios
 */
/**
 * @swagger
 * /precios:
 *   get:
 *     summary: Obtener todos los precios
 *     tags: [Precios]
 *     responses:
 *       200:
 *         description: Lista de precios
 */
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const precios = yield Precio_1.default.find().populate('comercio').populate('producto');
        res.json(precios);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener precios' });
    }
}));
/**
 * @swagger
 * /precios:
 *   post:
 *     summary: Crear o actualizar un precio
 *     tags: [Precios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               producto:
 *                 type: string
 *               comercio:
 *                 type: string
 *               precio:
 *                 type: number
 *               moneda:
 *                 type: string
 *               promo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Precio creado o actualizado
 */
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { producto, comercio, precio, moneda, promo } = req.body;
        const doc = yield Precio_1.default.findOneAndUpdate({
            comercio: comercio,
            producto: producto,
        }, {
            comercio,
            producto,
            precio,
            moneda,
            promo,
            fecha: new Date()
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        res.status(201).json(doc);
    }
    catch (error) {
        res.status(400).json({ message: 'Error al crear precio' });
    }
}));
exports.default = router;
